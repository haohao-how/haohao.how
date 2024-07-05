/* eslint-disable no-console */
import { z } from "zod";

import { Drizzle, transact } from "./db.js";
import { replicacheClient, replicacheClientGroup } from "./schema.js";

const mutationSchema = z.object({
  id: z.number(),
  clientID: z.string(),
  name: z.string(),
  args: z.any(), // TODO: change from any
});

type Mutation = z.infer<typeof mutationSchema>;

const pushRequestSchema = z.object({
  clientGroupID: z.string(),
  mutations: z.array(mutationSchema),
});

export async function push(userID: string, requestBody: unknown) {
  // eslint-disable-next-line no-console
  console.log(`Processing push`, JSON.stringify(requestBody, null, ``));

  const push = pushRequestSchema.parse(requestBody);

  const t0 = Date.now();

  for (const mutation of push.mutations) {
    try {
      await processMutation(userID, push.clientGroupID, mutation, false);
    } catch (e) {
      await processMutation(userID, push.clientGroupID, mutation, true);
    }
  }

  console.log(`Processed all mutations in`, Date.now() - t0);
}

// Implements the push algorithm from
// https://doc.replicache.dev/strategies/row-version#push
async function processMutation(
  userID: string,
  clientGroupID: string,
  mutation: Mutation,
  // 1: `let errorMode = false`. In JS, we implement this step naturally
  // as a param. In case of failure, caller will call us again with `true`.
  errorMode: boolean,
): Promise<void> {
  // 2: beginTransaction
  await transact(async (db) => {
    // let affected: Affected = {listIDs: [], userIDs: []};

    console.log(
      `Processing mutation`,
      errorMode ? `errorMode` : ``,
      JSON.stringify(mutation, null, ``),
    );

    // 3: `getClientGroup(body.clientGroupID)`
    // 4: Verify requesting user owns cg (in function)
    const clientGroup = await getClientGroup(db, clientGroupID, userID);
    // 5: `getClient(mutation.clientID)`
    // 6: Verify requesting client group owns requested client
    const baseClient = await getClient(db, mutation.clientID, clientGroupID);

    // 7: init nextMutationID
    const nextMutationID = baseClient.lastMutationID + 1;

    // 8: rollback and skip if already processed.
    if (mutation.id < nextMutationID) {
      console.log(
        `Mutation ${mutation.id} has already been processed - skipping`,
      );
      return;
      // return affected;
    }

    // 9: Rollback and error if from future.
    if (mutation.id > nextMutationID) {
      throw new Error(`Mutation ${mutation.id} is from the future - aborting`);
    }

    const t1 = Date.now();

    if (!errorMode) {
      try {
        // 10(i): Run business logic
        // 10(i)(a): xmin column is automatically updated by Postgres for any
        //   affected rows.
        // affected =
        await mutate(db, userID, mutation);
      } catch (e) {
        // 10(ii)(a-c): log error, abort, and retry
        console.error(
          `Error executing mutation: ${JSON.stringify(mutation)}`,
          e,
        );
        throw e;
      }
    }

    // 11-12: put client and client group
    const nextClient = {
      id: mutation.clientID,
      clientGroupID,
      lastMutationID: nextMutationID,
    };

    await putClientGroup(db, clientGroup);
    await putClient(db, nextClient);

    console.log(`Processed mutation in`, Date.now() - t1);
    // return affected;
  });
}

export interface ClientRecord {
  id: string;
  clientGroupID: string;
  lastMutationID: number;
}

export interface ClientGroupRecord {
  id: string;
  userID: string;
  cvrVersion: number;
}

export async function putClient(db: Drizzle, client: ClientRecord) {
  const { id, clientGroupID, lastMutationID } = client;

  await db
    .insert(replicacheClient)
    .values({
      id,
      clientGroupId: clientGroupID,
      lastMutationId: lastMutationID,
    })
    .onConflictDoUpdate({
      target: replicacheClient.id,
      set: { lastMutationId: lastMutationID, updatedAt: new Date() },
    });
}

export async function putClientGroup(
  db: Drizzle,
  clientGroup: ClientGroupRecord,
) {
  const { id, userID, cvrVersion } = clientGroup;

  await db
    .insert(replicacheClientGroup)
    .values({ id, userId: userID, cvrVersion })
    .onConflictDoUpdate({
      target: replicacheClientGroup.id,
      set: { userId: userID, cvrVersion, updatedAt: new Date() },
    });
}

export async function getClientGroup(
  db: Drizzle,
  clientGroupID: string,
  userID: string,
): Promise<ClientGroupRecord> {
  const r = await db.query.replicacheClientGroup.findFirst({
    where: (p, { eq }) => eq(p.id, clientGroupID),
  });

  if (!r) {
    return {
      id: clientGroupID,
      userID,
      cvrVersion: 0,
    };
  }

  if (r.userId !== userID) {
    throw new Error(`Authorization error - user does not own client group`);
  }

  return {
    id: clientGroupID,
    userID: r.userId,
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
      clientGroupID: ``,
      lastMutationID: 0,
    };
  }

  if (r.clientGroupId !== clientGroupId) {
    throw new Error(
      `Authorization error - client does not belong to client group`,
    );
  }

  return {
    id: r.id,
    clientGroupID: r.clientGroupId,
    lastMutationID: r.lastMutationId,
  };
}

// eslint-disable-next-line @typescript-eslint/require-await
async function mutate(
  db: Drizzle,
  userID: string,
  mutation: Mutation,
): Promise<unknown> {
  db;
  userID;
  mutation;
  throw new Error(`not yet implemented`);
}
