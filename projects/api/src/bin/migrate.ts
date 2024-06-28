import type { MigrationConfig } from "drizzle-orm/migrator";
import z from "zod";

const migrationConfig = {
  migrationsFolder: "drizzle",
} satisfies MigrationConfig;

const env = z.object({ DATABASE_URL: z.string() }).parse(process.env);

const IS_NEON = env.DATABASE_URL.includes("neon.tech");

if (IS_NEON) {
  console.log("Migrating via Neon adapter…");
  const { neon } = await import("@neondatabase/serverless");
  const { migrate } = await import("drizzle-orm/neon-http/migrator");
  const { drizzle } = await import("drizzle-orm/neon-http");

  const sql = neon(env.DATABASE_URL);
  const db = drizzle(sql);

  await migrate(db, migrationConfig);
} else {
  console.log("Migrating via native postgres adapter…");
  const { drizzle } = await import("drizzle-orm/postgres-js");
  const { migrate } = await import("drizzle-orm/postgres-js/migrator");
  const { default: postgres } = await import("postgres");

  const client = postgres();
  const db = drizzle(client);
  await migrate(db, migrationConfig);
  await client.end();
}
