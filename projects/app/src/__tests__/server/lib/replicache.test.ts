import { MarshaledSkillId } from "@/data/marshal";
import { SkillType } from "@/data/model";
import * as r from "@/data/rizzleSchema";
import { computeCvrEntities, pull, push } from "@/server/lib/replicache";
import * as schema from "@/server/schema";
import { invariant } from "@haohaohow/lib/invariant";
import { sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import assert from "node:assert/strict";
import { test } from "node:test";
import { withDbTest, withTxTest } from "./db";

void test(`push()`, async (t) => {
  const txTest = withTxTest(t);

  await txTest(`handles no mutations`, async (tx) => {
    await push(tx, `1`, {
      profileId: ``,
      clientGroupId: ``,
      pushVersion: 1,
      schemaVersion: `3`,
      mutations: [],
    });
  });

  await txTest(`rejects unknown schema version`, async (tx) => {
    await assert.rejects(
      push(tx, `1`, {
        profileId: ``,
        clientGroupId: ``,
        pushVersion: 1,
        schemaVersion: `2`,
        mutations: [],
      }),
    );
  });

  await txTest(
    `only allows a client group if it matches the user`,
    async (tx) => {
      const mut = {
        id: 1,
        name: `noop`,
        args: {},
        timestamp: 10123,
        clientId: `c0f86dc7-4d49-4f37-a25b-4d06c9f1cb37`,
      };

      // Create a user
      const [user1, user2] = await tx
        .insert(schema.user)
        .values([{ id: `1` }, { id: `2` }])
        .returning();
      invariant(user1 != null && user2 != null);

      // Create a client group
      const [clientGroup] = await tx
        .insert(schema.replicacheClientGroup)
        .values([
          {
            id: `1`,
            userId: user1.id,
            cvrVersion: 1,
          },
        ])
        .returning();
      invariant(clientGroup != null);

      // User 2 doesn't own the clientGroup
      await assert.rejects(
        push(tx, user2.id, {
          profileId: ``,
          clientGroupId: clientGroup.id,
          pushVersion: 1,
          schemaVersion: `3`,
          mutations: [mut],
        }),
      );

      // User 1 does own the clientGroup
      await push(tx, user1.id, {
        profileId: ``,
        clientGroupId: clientGroup.id,
        pushVersion: 1,
        schemaVersion: `3`,
        mutations: [mut],
      });
    },
  );

  await txTest(
    `creates a client group and client if one doesn't exist`,
    async (tx) => {
      const clientId = `clientid`;
      const clientGroupId = `clientgroupid`;

      // Create a user
      const [user] = await tx
        .insert(schema.user)
        .values([{ id: `1` }])
        .returning();
      invariant(user != null);

      const mut = {
        id: 1,
        name: `noop`,
        args: {},
        timestamp: 1,
        clientId,
      };

      await push(tx, user.id, {
        profileId: ``,
        clientGroupId,
        pushVersion: 1,
        schemaVersion: `3`,
        mutations: [mut],
      });

      const client = await tx.query.replicacheClient.findFirst({
        where: (t, { eq }) => eq(t.id, clientId),
      });
      assert.equal(client?.id, clientId);

      const clientGroup = await tx.query.replicacheClientGroup.findFirst({
        where: (t, { eq }) => eq(t.id, clientGroupId),
      });
      assert.equal(clientGroup?.id, clientGroupId);
    },
  );

  await txTest(`addSkillState() should insert to the db`, async (tx) => {
    const clientId = `clientid`;
    const clientGroupId = `clientgroupid`;

    // Create a user
    const [user] = await tx
      .insert(schema.user)
      .values([{ id: `1` }])
      .returning();
    invariant(user != null);

    const now = new Date();

    const mut = {
      id: 1,
      name: `addSkillState`,
      args: r.addSkillState.marshalArgs({
        skill: {
          type: SkillType.EnglishToHanzi,
          hanzi: `我`,
        },
        now,
      }),
      timestamp: 1,
      clientId,
    };

    await push(tx, user.id, {
      profileId: ``,
      clientGroupId,
      pushVersion: 1,
      schemaVersion: `3`,
      mutations: [mut],
    });

    const skillState = await tx.query.skillState.findFirst({
      where: (t, { eq }) => eq(t.userId, user.id),
    });
    assert.ok(skillState != null);
    assert.deepEqual(skillState.dueAt, now);
    assert.deepEqual(skillState.createdAt, now);
    assert.equal(skillState.srs, null);
    assert.equal(
      skillState.skillId,
      r.rSkillId().marshal({
        type: SkillType.EnglishToHanzi,
        hanzi: `我`,
      }),
    );
  });

  await txTest.todo(`skips already processed mutations`);
  await txTest.todo(`does not process mutations from the future`);
  await txTest.todo(`mutations return affected row IDs for CVR`);
  await txTest.todo(`invalid mutations must still increment lastMutationID`);
  await txTest.todo(`returns correct error for invalid schema version`);
});

void test(`pull()`, async (t) => {
  const txTest = withTxTest(t);

  await txTest.todo(`doesn't create non-existant client or client group`);

  await txTest(`null cookie, returns skillState patches`, async (tx) => {
    const clientGroupId = nanoid();

    // Create a user
    const [user] = await tx
      .insert(schema.user)
      .values([{ id: `1` }])
      .returning();
    invariant(user != null);

    const now = new Date();

    const [skillState] = await tx
      .insert(schema.skillState)
      .values([
        {
          userId: user.id,
          dueAt: now,
          srs: null,
          skillId: r.rSkillId().marshal({
            type: SkillType.EnglishToHanzi,
            hanzi: `我`,
          }),
        },
      ])
      .returning();
    invariant(skillState != null);

    const result = await pull(tx, user.id, {
      profileId: ``,
      clientGroupId,
      pullVersion: 1,
      schemaVersion: `3`,
      cookie: null,
    });

    assert.partialDeepStrictEqual(result, {
      cookie: {
        order: 1,
      },
      lastMutationIDChanges: {},
      patch: [
        { op: `clear` },
        {
          op: `put`,
          key: r.skillState.marshalKey({
            skill: skillState.skillId as MarshaledSkillId,
          }),
          value: r.skillState.marshalValue({
            created: skillState.createdAt,
            srs: null,
            due: skillState.dueAt,
          }),
        },
      ],
    });
  });
});

void test(`dbTest() examples`, async (t) => {
  const dbTest = withDbTest(t);

  await dbTest(`should work with inline fixtures 1`, async (db) => {
    await db.insert(schema.user).values([{ id: `1` }]);

    // Your test logic here
    const users = await db.select().from(schema.user);
    assert.equal(users.length, 1);
  });
});

void test(`computeCvr()`, async (t) => {
  const txTest = withTxTest(t);

  await txTest(`works for non-existant user and client group`, async (tx) => {
    assert.deepEqual(await computeCvrEntities(tx, `1`, ``), {
      skillState: {},
      client: {},
    });
  });

  await txTest(`works for user`, async (tx) => {
    const [user] = await tx
      .insert(schema.user)
      .values([{ id: `1` }])
      .returning();
    invariant(user != null);

    assert.deepEqual(await computeCvrEntities(tx, user.id, ``), {
      skillState: {},
      client: {},
    });
  });

  await txTest(`only includes results for the user`, async (tx) => {
    const [user1, user2] = await tx
      .insert(schema.user)
      .values([{ id: `1` }, { id: `2` }])
      .returning();
    invariant(user1 != null && user2 != null);

    const [user1SkillState] = await tx
      .insert(schema.skillState)
      .values([
        {
          userId: user1.id,
          skillId: r.rSkillId().marshal({
            type: SkillType.EnglishToHanzi,
            hanzi: `我`,
          }),
          srs: null,
          dueAt: new Date(),
          createdAt: new Date(),
        },
        {
          userId: user2.id,
          skillId: r.rSkillId().marshal({
            type: SkillType.EnglishToHanzi,
            hanzi: `我`,
          }),
          srs: null,
          dueAt: new Date(),
          createdAt: new Date(),
        },
      ])
      .returning({
        id: schema.skillState.skillId,
        version: sql<string>`${schema.skillState}.xmin`,
      });
    invariant(user1SkillState != null);

    assert.deepEqual(await computeCvrEntities(tx, user1.id, ``), {
      client: {},
      skillState: { [user1SkillState.id]: user1SkillState.version },
    });
  });
});
