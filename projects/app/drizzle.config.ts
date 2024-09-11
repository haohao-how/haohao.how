import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: `./src/server/schema.ts`,
  out: `./drizzle`,
  dialect: `postgresql`,
  dbCredentials: {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    url: process.env.NEON_DATABASE_URL!,
  },
});
