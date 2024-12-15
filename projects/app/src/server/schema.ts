import * as p from "drizzle-orm/pg-core";
import { customAlphabet } from "nanoid";

const alphabet = `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`;
const length = 12;

const nanoid = customAlphabet(alphabet, length);

export const schema = p.pgSchema(`haohaohow`);

export const user = schema.table(`user`, {
  id: p.text(`id`).primaryKey().$defaultFn(nanoid),
});

export const authSession = schema.table(`authSession`, {
  id: p.text(`id`).primaryKey(),
  userId: p
    .text(`userId`)
    .notNull()
    .references(() => user.id),
  expiresAt: p
    .timestamp(`expiresAt`, {
      mode: `date`,
      withTimezone: true,
    })
    .notNull(),
});

export const authOAuth2 = schema.table(
  `authOAuth2`,
  {
    id: p.text(`id`).primaryKey().$defaultFn(nanoid),
    userId: p
      .text(`userId`)
      .references(() => user.id)
      .notNull(),
    provider: p.text(`provider`).notNull(),
    /**
     * The ID that the provider uses to identify the user.
     */
    providerUserId: p.text(`providerUserId`).notNull(),
    createdAt: p.timestamp(`timestamp`).defaultNow().notNull(),
  },
  (t) => [p.unique().on(t.provider, t.providerUserId)],
);

export const skillRating = schema.table(`skillRating`, {
  id: p.text(`id`).primaryKey(),
  userId: p
    .text(`userId`)
    .references(() => user.id)
    .notNull(),
  skillId: p.text(`skillId`).notNull(),
  rating: p.integer(`rating`).notNull(),
  createdAt: p.timestamp(`timestamp`).defaultNow().notNull(),
});

export const skillState = schema.table(
  `skillState`,
  {
    id: p.text(`id`).primaryKey().$defaultFn(nanoid),
    userId: p
      .text(`userId`)
      .references(() => user.id)
      .notNull(),
    skillId: p.text(`skillId`).notNull(),
    srs: p.json(`srs`),
    dueAt: p.timestamp(`dueAt`).notNull(),
    createdAt: p.timestamp(`createdAt`).defaultNow().notNull(),
  },
  (t) => [p.unique().on(t.userId, t.skillId)],
);

export const replicacheClientGroup = schema.table(`replicacheClientGroup`, {
  // The CVRs are stored keyed under a random unique ID which becomes the cookie
  // sent to Replicache.
  id: p.text(`id`).primaryKey(),
  userId: p
    .text(`userId`)
    .references(() => user.id)
    .notNull(),
  // Replicache requires that cookies are ordered within a client group.
  // To establish this order we simply keep a counter.
  cvrVersion: p.integer(`cvrVersion`).notNull(),
  updatedAt: p.timestamp(`timestamp`).defaultNow().notNull(),
});

export const replicacheClient = schema.table(`replicacheClient`, {
  // The CVRs are stored keyed under a random unique ID which becomes the cookie
  // sent to Replicache.
  id: p.text(`id`).primaryKey(),
  clientGroupId: p
    .text(`clientGroupId`)
    .references(() => replicacheClientGroup.id)
    .notNull(),
  lastMutationId: p.integer(`lastMutationId`).notNull(),
  updatedAt: p.timestamp(`timestamp`).defaultNow().notNull(),
});
