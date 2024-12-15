import { SkillType } from "@/data/model";
import { addSkillState, rSkillId } from "@/data/rizzleSchema";
import { push } from "@/server/lib/push";
import * as schema from "@/server/schema";
import { invariant } from "@haohaohow/lib/invariant";
import assert from "node:assert/strict";
import { test } from "node:test";
import { withDbTest, withTxTest } from "./db";

void test(`${push.name}()`, async (t) => {
  const txTest = withTxTest(t);

  await txTest(`handles no mutations`, async (tx) => {
    await push(tx, `1`, {
      profileID: ``,
      clientGroupID: ``,
      pushVersion: 1,
      schemaVersion: `3`,
      mutations: [],
    });
  });

  await txTest(`rejects unknown schema version`, async (tx) => {
    await assert.rejects(
      push(tx, `1`, {
        profileID: ``,
        clientGroupID: ``,
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
        clientID: `c0f86dc7-4d49-4f37-a25b-4d06c9f1cb37`,
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
          profileID: ``,
          clientGroupID: clientGroup.id,
          pushVersion: 1,
          schemaVersion: `3`,
          mutations: [mut],
        }),
      );

      // User 1 does own the clientGroup
      await push(tx, user1.id, {
        profileID: ``,
        clientGroupID: clientGroup.id,
        pushVersion: 1,
        schemaVersion: `3`,
        mutations: [mut],
      });
    },
  );

  await txTest(
    `creates a client group and client if one doesn't exist`,
    async (tx) => {
      const clientID = `clientid`;
      const clientGroupID = `clientgroupid`;

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
        clientID,
      };

      await push(tx, user.id, {
        profileID: ``,
        clientGroupID,
        pushVersion: 1,
        schemaVersion: `3`,
        mutations: [mut],
      });

      const client = await tx.query.replicacheClient.findFirst({
        where: (t, { eq }) => eq(t.id, clientID),
      });
      assert.equal(client?.id, clientID);

      const clientGroup = await tx.query.replicacheClientGroup.findFirst({
        where: (t, { eq }) => eq(t.id, clientGroupID),
      });
      assert.equal(clientGroup?.id, clientGroupID);
    },
  );

  await txTest(`addSkillState() should insert to the db`, async (tx) => {
    const clientID = `clientid`;
    const clientGroupID = `clientgroupid`;

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
      args: addSkillState.marshal({
        skill: {
          type: SkillType.EnglishToHanzi,
          hanzi: `我`,
        },
        now,
      }),
      timestamp: 1,
      clientID,
    };

    await push(tx, user.id, {
      profileID: ``,
      clientGroupID,
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
      rSkillId().getMarshal().parse({
        type: SkillType.EnglishToHanzi,
        hanzi: `我`,
      }),
    );
  });

  await txTest.todo(`skips already processed mutations`);
  await txTest.todo(`does not process mutations from the future`);
  await txTest.todo(`mutations return affected row IDs for CVR`);
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
