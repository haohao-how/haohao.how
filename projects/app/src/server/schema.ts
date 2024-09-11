import {
  integer,
  pgSchema,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { customAlphabet } from "nanoid";

const alphabet = `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`;
const length = 12;

const nanoid = customAlphabet(alphabet, length);

export const schema = pgSchema(`haohaohow`);

export const user = schema.table(`user`, {
  id: text(`id`).primaryKey().$defaultFn(nanoid),
});

export const authSession = schema.table(`authSession`, {
  id: text(`id`).primaryKey(),
  userId: text(`userId`)
    .notNull()
    .references(() => user.id),
  expiresAt: timestamp(`expiresAt`, {
    mode: `date`,
    withTimezone: true,
  }).notNull(),
});

export const authOAuth2 = schema.table(
  `authOAuth2`,
  {
    id: text(`id`).primaryKey().$defaultFn(nanoid),
    userId: text(`userId`)
      .references(() => user.id)
      .notNull(),
    provider: text(`provider`).notNull(),
    /**
     * The ID that the provider uses to identify the user.
     */
    providerUserId: text(`providerUserId`).notNull(),
    createdAt: timestamp(`timestamp`).defaultNow().notNull(),
  },
  (t) => ({
    oneUserPerProviderUser: unique().on(t.provider, t.providerUserId),
  }),
);

export const skillRating = schema.table(`skillRating`, {
  id: text(`id`).primaryKey(),
  userId: text(`userId`)
    .references(() => user.id)
    .notNull(),
  skillId: text(`skillId`).notNull(),
  rating: integer(`rating`).notNull(),
  createdAt: timestamp(`timestamp`).defaultNow().notNull(),
});

export const replicacheClientGroup = schema.table(`replicacheClientGroup`, {
  // The CVRs are stored keyed under a random unique ID which becomes the cookie
  // sent to Replicache.
  id: text(`id`).primaryKey(),
  userId: text(`userId`)
    .references(() => user.id)
    .notNull(),
  // Replicache requires that cookies are ordered within a client group.
  // To establish this order we simply keep a counter.
  cvrVersion: integer(`cvrVersion`).notNull(),
  updatedAt: timestamp(`timestamp`).defaultNow().notNull(),
});

export const replicacheClient = schema.table(`replicacheClient`, {
  // The CVRs are stored keyed under a random unique ID which becomes the cookie
  // sent to Replicache.
  id: text(`id`).primaryKey(),
  clientGroupId: text(`clientGroupId`)
    .references(() => replicacheClientGroup.id)
    .notNull(),
  lastMutationId: integer(`lastMutationId`).notNull(),
  updatedAt: timestamp(`timestamp`).defaultNow().notNull(),
});
