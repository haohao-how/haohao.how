import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres();
export const db = drizzle(client, {});
