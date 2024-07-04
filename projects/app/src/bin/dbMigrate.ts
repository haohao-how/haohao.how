import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createPool } from "../api/db.js";
import * as schema from "../api/schema.js";

const pool = createPool();
const client = await pool.connect();

await migrate(drizzle(client, { schema }), {
  migrationsFolder: `drizzle`,
});

client.release();
await pool.end();
