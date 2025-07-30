import { SupabaseConnector } from './SupabaseConnector';
import { SQLJSOpenFactory, SQLJSPersister } from '@powersync/adapter-sql-js';
import { createBaseLogger, LogLevel, PowerSyncContext, PowerSyncDatabase } from '@powersync/react-native';
import { AppSchema } from './AppSchema';
import * as FileSystem from 'expo-file-system';

import React, { PropsWithChildren } from 'react';

const SupabaseContext = React.createContext<SupabaseConnector | null>(null);
export const useSupabase = () => React.useContext(SupabaseContext);


const createSQLJSPersister = (dbFilename: string): SQLJSPersister => {
    const dbPath = `${FileSystem.documentDirectory}${dbFilename}`;

    return {
        readFile: async (): Promise<ArrayLike<number> | Buffer | null> => {
            try {
                const fileInfo = await FileSystem.getInfoAsync(dbPath);
                if (!fileInfo.exists) {
                    return null;
                }

                const result = await FileSystem.readAsStringAsync(dbPath, {
                    encoding: FileSystem.EncodingType.Base64
                });

                const binary = atob(result);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                    bytes[i] = binary.charCodeAt(i);
                }
                return bytes;
            } catch (error) {
                console.error('Error reading database file:', error);
                return null;
            }
        },

        writeFile: async (data: ArrayLike<number> | Buffer): Promise<void> => {
            try {
                const uint8Array = new Uint8Array(data);
                const binary = Array.from(uint8Array, (byte) => String.fromCharCode(byte)).join('');
                const base64 = btoa(binary);

                await FileSystem.writeAsStringAsync(dbPath, base64, {
                    encoding: FileSystem.EncodingType.Base64
                });
            } catch (error) {
                console.error('Error writing database file:', error);
                throw error;
            }
        }
    };
};


export const powerSync = new PowerSyncDatabase({
    schema: AppSchema,
    database: new SQLJSOpenFactory({
        dbFilename: 'app.db',
        persister: createSQLJSPersister('app.db')
    })
});

export const connector = new SupabaseConnector();
powerSync.connect(connector);

const logger = createBaseLogger();
logger.useDefaults();
logger.setLevel(LogLevel.DEBUG);

export const SystemProvider = ({ children }: PropsWithChildren) => {
    return (
        <PowerSyncContext.Provider value={powerSync as any}>
            <SupabaseContext.Provider value={connector}>{children}</SupabaseContext.Provider>
        </PowerSyncContext.Provider>
    );
};

export default SystemProvider;
