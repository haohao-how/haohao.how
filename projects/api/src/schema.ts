import { integer, pgSchema, text, timestamp } from "drizzle-orm/pg-core";
import { customAlphabet } from "nanoid";

const alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const length = 12;

const nanoid = customAlphabet(alphabet, length);

export function generatePublicId() {
  return nanoid();
}

export const schema = pgSchema("haohaohow");

export const user = schema.table("user", {
  id: text("id").primaryKey().$defaultFn(nanoid),
});

export const skillRating = schema.table("skillRating", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .references(() => user.id)
    .notNull(),
  skillId: text("skillId").notNull(),
  rating: integer("rating").notNull(),
  createdAt: timestamp("timestamp").defaultNow().notNull(),
});
