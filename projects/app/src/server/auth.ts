import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia, TimeSpan } from "lucia";
import { Drizzle } from "./db";
import { authSession, user } from "./schema";

export function getLucia(db: Drizzle) {
  const adapter = new DrizzlePostgreSQLAdapter(db, authSession, user);
  return new Lucia(adapter, {
    sessionExpiresIn: new TimeSpan(365, `d`),
  });
}
