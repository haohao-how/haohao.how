import { bigint, inet, pgSchema, timestamp, uuid } from "drizzle-orm/pg-core";

export const schema = pgSchema("haohaoHow");

export const clickCount = schema.table("clickCount", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("sessionId").references(() => session.id),
  clickCount: bigint("clickCount", { mode: "number" }).notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const session = schema.table("session", {
  id: uuid("id").primaryKey().defaultRandom(),
  ipAddress: inet("ipAddress"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
