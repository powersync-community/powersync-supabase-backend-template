import {
  AbstractPowerSyncDatabase,
  BaseObserver,
  CrudEntry,
  PowerSyncBackendConnector,
  UpdateType,
} from "@powersync/react-native";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
export type SupabaseConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  powersyncUrl: string;
};

/// Postgres Response codes that we cannot recover from by retrying.
const FATAL_RESPONSE_CODES = [
  // Class 22 — Data Exception
  // Examples include data type mismatch.
  new RegExp("^22...$"),
  // Class 23 — Integrity Constraint Violation.
  // Examples include NOT NULL, FOREIGN KEY and UNIQUE violations.
  new RegExp("^23...$"),
  // INSUFFICIENT PRIVILEGE - typically a row-level security violation
  new RegExp("^42501$"),
];

export type SupabaseConnectorListener = {
  initialized: () => void;
};

export class SupabaseConnector
  extends BaseObserver<SupabaseConnectorListener>
  implements PowerSyncBackendConnector
{
  readonly client: SupabaseClient;
  readonly config: SupabaseConfig;
  userId?: string;

  constructor() {
    super();
    this.config = {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL!,
      powersyncUrl: process.env.EXPO_PUBLIC_POWERSYNC_URL!,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
    };
    this.client = createClient(
      this.config.supabaseUrl,
      this.config.supabaseAnonKey
    );
    this.loadUserId();
  }

  async loadUserId(): Promise<void> {
    let {
      data: { session },
    } = await this.client.auth.getSession();
    if (session == null) {
      const { data, error } = await this.client.auth.signInAnonymously();
      if (error) {
        throw error;
      }
      session = data.session;
    }
    if (session == null || session.user == null) {
      throw new Error(`Failed to get Supabase session or user`);
    }
    this.userId = session.user.id;
  }

  async fetchCredentials() {
    let {
      data: { session },
    } = await this.client.auth.getSession();
    if (session == null) {
      const { data, error } = await this.client.auth.signInAnonymously();
      if (error) {
        throw error;
      }
      session = data.session;
    }
    if (session == null) {
      throw new Error(`Failed to get Supabase session`);
    }
    return {
      endpoint: this.config.powersyncUrl,
      token: session.access_token,
    };
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    console.log("Uploading data to Supabase...");
    const transaction = await database.getNextCrudTransaction();
    if (!transaction) {
      return;
    }
    let lastOp: CrudEntry | null = null;
    try {
      // Note: If transactional consistency is important, use database functions
      // or edge functions to process the entire transaction in a single call.
      for (const op of transaction.crud) {
        lastOp = op;
        const table = this.client.from(op.table);
        let result: any = null;
        switch (op.op) {
          case UpdateType.PUT:
            const record = { ...op.opData, id: op.id };
            result = await table.upsert(record);
            break;
          case UpdateType.PATCH:
            result = await table.update(op.opData).eq("id", op.id);
            break;
          case UpdateType.DELETE:
            result = await table.delete().eq("id", op.id);
            break;
        }
        if (result.error) {
          console.error(result.error);
          result.error.message = `Could not ${
            op.op
          } data to Supabase error: ${JSON.stringify(result)}`;
          throw result.error;
        }
      }
      await transaction.complete();
    } catch (ex: any) {
      console.debug(ex);
      if (
        typeof ex.code == "string" &&
        FATAL_RESPONSE_CODES.some((regex) => regex.test(ex.code))
      ) {
        /**
         * Instead of blocking the queue with these errors,
         * discard the (rest of the) transaction.
         *
         * Note that these errors typically indicate a bug in the application.
         * If protecting against data loss is important, save the failing records
         * elsewhere instead of discarding, and/or notify the user.
         */
        console.error("Data upload error - discarding:", lastOp, ex);
        await transaction.complete();
      } else {
        // Error may be retryable - e.g. network error or temporary server error.
        // Throwing an error here causes this call to be retried after a delay.
        throw ex;
      }
    }
  }
}
