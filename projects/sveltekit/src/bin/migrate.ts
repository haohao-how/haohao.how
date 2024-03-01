import { sql } from "@vercel/postgres";
import type { MigrationConfig } from "drizzle-orm/migrator";
import { drizzle as pgDrizzle } from "drizzle-orm/postgres-js";
import { migrate as pgMigrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle as vercelDrizzle } from "drizzle-orm/vercel-postgres";
import { migrate as vercelMigrate } from "drizzle-orm/vercel-postgres/migrator";
import postgres from "postgres";

const migrationConfig = { migrationsFolder: "drizzle" } satisfies MigrationConfig;

if (process.env.VERCEL != null) {
  const db = vercelDrizzle(sql);
  await vercelMigrate(db, migrationConfig);
  await sql.end();
} else {
  const client = postgres();
  const db = pgDrizzle(client);
  await pgMigrate(db, migrationConfig);
  await client.end();
}
