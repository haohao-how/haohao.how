import {
  makeDrizzleMutationHandler,
  Mutation,
  mutationSchema,
} from "@/data/rizzle";
import { rSkillId, schema } from "@/data/rizzleSchema";
import { invariant } from "@haohaohow/lib/invariant";
import makeDebug from "debug";
import { basename } from "node:path";
import { z } from "zod";
import { replicacheClient, replicacheClientGroup, skillState } from "../schema";
import type { Drizzle } from "./db";

const debug = makeDebug(basename(import.meta.filename));

const pushRequestSchema = z
  .object({
    profileID: z.string(),
    clientGroupID: z.string(),
    pushVersion: z.literal(1),
    schemaVersion: z.string(),
    mutations: z.array(mutationSchema),
  })
  .strict();

export async function push(tx: Drizzle, userId: string, requestBody: unknown) {
  const push = pushRequestSchema.parse(requestBody);

  invariant(push.schemaVersion === `3`);

  for (const mutation of push.mutations) {
    try {
      await processMutation(tx, userId, push.clientGroupID, mutation, false);
    } catch {
      await processMutation(tx, userId, push.clientGroupID, mutation, true);
    }
  }
}

// Implements the push algorithm from
// https://doc.replicache.dev/strategies/row-version#push
async function processMutation(
  tx: Drizzle,
  userId: string,
  clientGroupId: string,
  mutation: Mutation,
  // 1: `let errorMode = false`. In JS, we implement this step naturally
  // as a param. In case of failure, caller will call us again with `true`.
  errorMode: boolean,
): Promise<void> {
  // 2: beginTransaction
  await tx.transaction(async (tx) => {
    // let affected: Affected = {listIDs: [], userIDs: []};

    debug(
      `Processing mutation errorMode=%o %o`,
      errorMode,
      JSON.stringify(mutation, null, ``),
    );

    // 3: `getClientGroup(body.clientGroupID)`
    // 4: Verify requesting user owns cg (in function)
    const clientGroup = await getClientGroup(tx, clientGroupId, userId);
    // 5: `getClient(mutation.clientID)`
    // 6: Verify requesting client group owns requested client
    const baseClient = await getClient(tx, mutation.clientID, clientGroupId);

    // 7: init nextMutationID
    const nextMutationId = baseClient.lastMutationId + 1;

    // 8: rollback and skip if already processed.
    if (mutation.id < nextMutationId) {
      debug(`Mutation ${mutation.id} has already been processed - skipping`);
      return;
      // return affected;
    }

    // 9: Rollback and error if from future.
    if (mutation.id > nextMutationId) {
      throw new Error(`Mutation ${mutation.id} is from the future - aborting`);
    }

    const t1 = Date.now();

    if (!errorMode) {
      try {
        // 10(i): Run business logic
        // 10(i)(a): xmin column is automatically updated by Postgres for any
        //   affected rows.
        // affected =
        await mutate(tx, userId, mutation);
      } catch (e) {
        // 10(ii)(a-c): log error, abort, and retry
        debug(`Error executing mutation: ${JSON.stringify(mutation)}`, e);
        throw e;
      }
    }

    // 11-12: put client and client group
    const nextClient = {
      id: mutation.clientID,
      clientGroupId,
      lastMutationId: nextMutationId,
    };

    await putClientGroup(tx, clientGroup);
    await putClient(tx, nextClient);

    debug(`Processed mutation in`, Date.now() - t1);
    // return affected;
  });
}

export interface ClientRecord {
  id: string;
  clientGroupId: string;
  lastMutationId: number;
}

export interface ClientGroupRecord {
  id: string;
  userId: string;
  cvrVersion: number;
}

export async function putClient(db: Drizzle, client: ClientRecord) {
  const {
    id,
    clientGroupId: clientGroupId,
    lastMutationId: lastMutationId,
  } = client;

  await db
    .insert(replicacheClient)
    .values({
      id,
      clientGroupId,
      lastMutationId,
    })
    .onConflictDoUpdate({
      target: replicacheClient.id,
      set: { lastMutationId, updatedAt: new Date() },
    });
}

export async function putClientGroup(
  db: Drizzle,
  clientGroup: ClientGroupRecord,
) {
  const { id, userId, cvrVersion } = clientGroup;

  await db
    .insert(replicacheClientGroup)
    .values({ id, userId, cvrVersion })
    .onConflictDoUpdate({
      target: replicacheClientGroup.id,
      set: { userId, cvrVersion, updatedAt: new Date() },
    });
}

export async function getClientGroup(
  db: Drizzle,
  clientGroupId: string,
  userId: string,
): Promise<ClientGroupRecord> {
  const r = await db.query.replicacheClientGroup.findFirst({
    where: (p, { eq }) => eq(p.id, clientGroupId),
  });

  if (!r) {
    return {
      id: clientGroupId,
      userId,
      cvrVersion: 0,
    };
  }

  if (r.userId !== userId) {
    throw new Error(`Authorization error - user does not own client group`);
  }

  return {
    id: clientGroupId,
    userId: r.userId,
    cvrVersion: r.cvrVersion,
  };
}

export async function getClient(
  db: Drizzle,
  clientId: string,
  clientGroupId: string,
): Promise<ClientRecord> {
  const r = await db.query.replicacheClient.findFirst({
    where: (p, { eq }) => eq(p.id, clientId),
  });

  if (!r) {
    return {
      id: clientId,
      clientGroupId: ``,
      lastMutationId: 0,
    };
  }

  if (r.clientGroupId !== clientGroupId) {
    throw new Error(
      `Authorization error - client does not belong to client group`,
    );
  }

  return {
    id: r.id,
    clientGroupId: r.clientGroupId,
    lastMutationId: r.lastMutationId,
  };
}

const handleMutation = makeDrizzleMutationHandler<typeof schema, Drizzle>(
  schema,
  {
    async addSkillState(tx, userId, { skill, now }) {
      const skillId = rSkillId().getMarshal().parse(skill);
      await tx
        .insert(skillState)
        .values({
          userId,
          skillId,
          srs: null,
          dueAt: now,
          createdAt: now,
        })
        .onConflictDoNothing();
    },
  },
);

async function mutate(
  db: Drizzle,
  userID: string,
  mutation: Mutation,
): Promise<unknown> {
  await handleMutation(db, userID, mutation);
  return;
}
