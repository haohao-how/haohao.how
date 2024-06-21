import { ExpoSQLiteKVStore } from "@/util/ExpoSQLiteKVStore";

export const experimentalCreateKVStore = (name: string) =>
  new ExpoSQLiteKVStore(`replicache-${name}.sqlite`);
