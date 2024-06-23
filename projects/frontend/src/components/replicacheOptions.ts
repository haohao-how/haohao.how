import { ExpoSQLiteKVStore } from "@/util/ExpoSQLiteKVStore";

export const experimentalCreateKVStore = (name: string) => {
  // eslint-disable-next-line no-console
  console.log(`experimentalCreateKVStore(${name})`);
  return new ExpoSQLiteKVStore(`replicache-${name}.sqlite`);
};
