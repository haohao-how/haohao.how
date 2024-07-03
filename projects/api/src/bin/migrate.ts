import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createPool } from "../db.js";
import * as schema from "../schema.js";

const pool = await createPool();
const client = await pool.connect();

await migrate(drizzle(client, { schema }), {
  migrationsFolder: "drizzle",
});

client.release();
await pool.end();
