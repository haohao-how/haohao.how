import { bigint, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

export const clickCount = pgTable("clickCount", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("sessionId"),
  clickCount: bigint("clickCount", { mode: "number" }).notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
