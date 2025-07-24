import { column, Schema, Table } from "@powersync/react-native";

const thoughts = new Table({
  content: column.text,
  created_at: column.text,
  created_by: column.text,
});

const reactions = new Table(
  {
    thought_id: column.text,
    user_id: column.text,
    emoji: column.text,
    created_at: column.text,
  },
  { indexes: { thought: ["thought_id"] } }
);

export const AppSchema = new Schema({
  thoughts,
  reactions,
});

export type Database = (typeof AppSchema)["types"];
export type ThoughtRecord = Database["thoughts"];
export type ReactionRecord = Database["reactions"];
