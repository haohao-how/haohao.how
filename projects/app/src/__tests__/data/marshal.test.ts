import {
  ExtractVariableNames,
  keyPathVariableNames,
  marshalSkillStateJson,
  marshalSrsStateJson,
  parseKeyPath,
  rizzle,
  RizzleIndexed,
  RizzleIndexNames,
  RizzleObject,
  RizzleObjectInput,
  RizzleObjectOutput,
  RizzlePrimitive,
  RizzleReplicacheMutators,
  RizzleReplicacheQuery,
  RizzleTypeAlias,
  unmarshalSkillStateJson,
  unmarshalSrsStateJson,
  ValueSchemaShape,
} from "@/data/marshal";
import { Skill, SkillState, SkillType, SrsState, SrsType } from "@/data/model";
import { IsEqual } from "@/util/types";
import mapValues from "lodash/mapValues";
import assert from "node:assert/strict";
import test, { suite, TestContext } from "node:test";
import {
  ReadTransaction,
  Replicache,
  ReplicacheOptions,
  TEST_LICENSE_KEY,
  WriteTransaction,
} from "replicache";
import { Prettify } from "ts-essentials";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-parameters
function typeChecks<_T = any>(..._args: unknown[]) {
  // This function is only used for type checking, so it should never be called.
}

const testReplicacheOptions = {
  name: `test`,
  licenseKey: TEST_LICENSE_KEY,
  kvStore: `mem`,
  pullInterval: null,
  logLevel: `error`,
} satisfies ReplicacheOptions<never>;

void test(`Skill`, () => {
  const skill = {
    type: SkillType.HanziWordToEnglish,
    hanzi: `火`,
  } satisfies Skill;

  const state: SkillState = {
    created: new Date(),
    srs: {
      type: SrsType.Null,
    },
    due: new Date(),
  };

  const x = [skill, state] as const;
  assert.deepEqual(x, unmarshalSkillStateJson(marshalSkillStateJson(x)));
});

void test(`SrsState`, () => {
  const value: SrsState = {
    type: SrsType.Null,
  };

  assert.deepEqual(value, unmarshalSrsStateJson(marshalSrsStateJson(value)));
});

typeChecks(`ExtractKeys`, () => {
  true satisfies IsEqual<ExtractVariableNames<`a[b]`>, `b`>;
  true satisfies IsEqual<ExtractVariableNames<`a[b][c]`>, `b` | `c`>;
  true satisfies IsEqual<ExtractVariableNames<`a[b][c][d]`>, `b` | `c` | `d`>;
});

typeChecks(`schema introspection helpers`, () => {
  const schema = { id: rizzle.string(), name: rizzle.string() };

  true satisfies IsEqual<
    ValueSchemaShape<`path/[id]`, typeof schema>,
    Pick<typeof schema, `name`>
  >;
});

function makeMockTx(t: TestContext) {
  const readTx = {
    get: t.mock.fn<ReadTransaction[`get`]>(async () => undefined),
    scan: t.mock.fn<ReadTransaction[`scan`]>(() => {
      return null as never;
    }),
    clientID: null as never,
    environment: null as never,
    location: null as never,
    has: null as never,
    isEmpty: null as never,
  } satisfies ReadTransaction;

  const writeTx = {
    ...readTx,
    set: t.mock.fn<WriteTransaction[`set`]>(async () => undefined),
    mutationID: null as never,
    reason: null as never,
    put: null as never,
    del: null as never,
  } satisfies WriteTransaction;

  return {
    ...writeTx,
    readonly: readTx,
    [Symbol.dispose]: () => {
      writeTx.get.mock.resetCalls();
      writeTx.set.mock.resetCalls();
      writeTx.scan.mock.resetCalls();
    },
  };
}

void suite(`rizzle`, () => {
  void test(`string() key and value`, async (t) => {
    const posts = rizzle.keyValue(`foo/[id]`, {
      id: rizzle.string(),
      name: rizzle.string(),
    });

    using tx = makeMockTx(t);

    await posts.get(tx, { id: `1` });
    assert.equal(tx.get.mock.callCount(), 1);
    assert.deepEqual(tx.get.mock.calls[0]?.arguments, [`foo/1`]);

    // Check that a ReadonlyJSONValue is parsed correctly.
    tx.get.mock.mockImplementationOnce(() => Promise.resolve({ name: `foo` }));
    assert.deepEqual(await posts.get(tx, { id: `1` }), { name: `foo` });

    // Check that a value is encoded correctly.
    await posts.set(tx, { id: `1` }, { name: `foo` });
    assert.equal(tx.set.mock.callCount(), 1);
    assert.deepEqual(tx.set.mock.calls[0]?.arguments, [
      `foo/1`,
      { name: `foo` },
    ]);

    typeChecks(async () => {
      // .get()
      void posts.get(tx.readonly, { id: `1` });
      // @ts-expect-error `id` is the key, not `name`
      void posts.get(tx.readonly, { name: `1` });
      {
        const post = await posts.get(tx.readonly, { id: `1` });
        true satisfies IsEqual<typeof post, { name: string } | undefined>;
      }

      // .set()
      void posts.set(tx, { id: `1` }, { name: `foo` });
      // @ts-expect-error `id` is the key, not `name`
      void posts.set(tx, { name: `1` }, { name: `foo` });
    });
  });

  void test(`object()`, async (t) => {
    using tx = makeMockTx(t);

    {
      // key alias
      const posts = rizzle.keyValue(`foo/[id]`, {
        id: rizzle.string(),
        name: rizzle.string(`n`),
      });

      await posts.get(tx, { id: `1` });
      assert.equal(tx.get.mock.callCount(), 1);
      assert.deepEqual(tx.get.mock.calls[0]?.arguments, [`foo/1`]);

      // Check that a ReadonlyJSONValue is parsed correctly.
      tx.get.mock.mockImplementationOnce(() => Promise.resolve({ n: `foo` }));
      assert.deepEqual(await posts.get(tx, { id: `1` }), { name: `foo` });

      // Check that a value is encoded correctly.
      await posts.set(tx, { id: `1` }, { name: `foo` });
      assert.equal(tx.set.mock.callCount(), 1);
      assert.deepEqual(tx.set.mock.calls[0]?.arguments, [
        `foo/1`,
        { n: `foo` },
      ]);
    }

    typeChecks(`simple, no aliases`, async () => {
      const posts = rizzle.keyValue(`foo/[id]`, {
        id: rizzle.string(),
        name: rizzle.string(),
      });

      // .get()
      void posts.get(tx.readonly, { id: `1` });
      // @ts-expect-error `id` is the key, not `name`
      void posts.get(tx.readonly, { name: `1` });
      {
        const post = await posts.get(tx.readonly, { id: `1` });
        true satisfies IsEqual<typeof post, { name: string } | undefined>;
      }

      // .set()
      void posts.set(tx, { id: `1` }, { name: `foo` });
      // @ts-expect-error `id` is the key, not `name`
      void posts.set(tx, { name: `1` }, { name: `foo` });
    });

    typeChecks(`nested with aliases`, async () => {
      const posts = rizzle.keyValue(`foo/[id]`, {
        id: rizzle.string(),
        author: rizzle.object({
          name: rizzle.string(),
          email: rizzle.string(`e`),
        }),
      });

      // .get()
      void posts.get(tx, { id: `1` });
      // @ts-expect-error `id` is the key, not `name`
      void posts.get(tx, { name: `1` });
      {
        const post = await posts.get(tx, { id: `1` });
        true satisfies IsEqual<
          typeof post,
          { author: { name: string; email: string } } | undefined
        >;
      }

      // .set()
      void posts.set(tx, { id: `1` }, { author: { name: `foo`, email: `` } });
      // @ts-expect-error `id` is the key, not `name`
      void posts.set(tx, { name: `1` }, { author: { id: `foo`, email: `` } });
      // @ts-expect-error `email` alias should not be used as the input
      void posts.set(tx, { name: `1` }, { author: { name: `foo`, e: `` } });
    });
  });

  void test(`timestamp()`, async (t) => {
    const posts = rizzle.keyValue(`foo/[id]`, {
      id: rizzle.string(),
      due: rizzle.timestamp(),
    });

    using tx = makeMockTx(t);

    await posts.get(tx, { id: `1` });
    assert.equal(tx.get.mock.callCount(), 1);
    assert.deepEqual(tx.get.mock.calls[0]?.arguments, [`foo/1`]);

    // Unmarshalling
    {
      const date = new Date(1601856000000);
      for (const [marshaled, unmarshaled] of [
        [date.toISOString(), date], // ISO8601 string
        [date.getTime(), date], // timestamp as number
        [date.getTime().toString(), date], // timestamp as string
      ]) {
        tx.get.mock.mockImplementationOnce(() =>
          Promise.resolve({ due: marshaled }),
        );
        assert.deepEqual(
          await posts.get(tx, { id: `1` }),
          {
            due: unmarshaled,
          },
          JSON.stringify([marshaled, unmarshaled]),
        );
      }
    }

    // Marshalling
    {
      const date = new Date(1601856000000);
      for (const [marshaled, unmarshaled] of [
        [date.getTime(), date], // Date
        [date.getTime(), date.getTime()], // timestamp as number
      ] as const) {
        await posts.set(tx, { id: `1` }, { due: unmarshaled });
        assert.equal(tx.set.mock.callCount(), 1);
        assert.deepEqual(tx.set.mock.calls[0]?.arguments, [
          `foo/1`,
          { due: marshaled },
        ]);
        tx.set.mock.resetCalls();
      }
    }
  });

  void test(`skillType()`, async (t) => {
    const posts = rizzle.keyValue(`foo/[id]`, {
      id: rizzle.string(),
      skill: rizzle.skillType(),
    });

    // Marshal and unmarshal round tripping
    for (const skillType of [
      SkillType.RadicalToEnglish,
      SkillType.EnglishToRadical,
      SkillType.RadicalToPinyin,
      SkillType.PinyinToRadical,
      SkillType.HanziWordToEnglish,
      SkillType.HanziWordToPinyinInitial,
      SkillType.HanziWordToPinyinFinal,
      SkillType.HanziWordToPinyinTone,
      SkillType.EnglishToHanzi,
      SkillType.PinyinToHanzi,
      SkillType.ImageToHanzi,
    ] as const) {
      using tx = makeMockTx(t);

      await posts.set(tx, { id: `1` }, { skill: skillType });
      const [, marshaledData] = tx.set.mock.calls[0]!.arguments;
      tx.get.mock.mockImplementationOnce(async () => marshaledData);
      assert.deepEqual(await posts.get(tx, { id: `1` }), {
        skill: skillType,
      });
    }
  });

  void test(`skillId()`, async (t) => {
    const posts = rizzle.keyValue(`foo/[id]`, {
      id: rizzle.string(),
      skill: rizzle.skillId(),
    });

    // Marshal and unmarshal round tripping
    for (const skill of [
      { type: SkillType.EnglishToHanzi, hanzi: `好` },
    ] as const) {
      using tx = makeMockTx(t);
      await posts.set(tx, { id: `1` }, { skill });
      const [, marshaledData] = tx.set.mock.calls[0]!.arguments;
      tx.get.mock.mockImplementationOnce(async () => marshaledData);
      assert.deepEqual(await posts.get(tx, { id: `1` }), {
        skill,
      });
    }
  });

  void test(`single key`, async (t) => {
    const posts = rizzle.keyValue(`foo/[id1]`, {
      id1: rizzle.string(),
      text: rizzle.string(),
    });

    using tx = makeMockTx(t);

    await posts.set(tx, { id1: `1` }, { text: `hello` });
    const [, marshaledData] = tx.set.mock.calls[0]!.arguments;
    tx.get.mock.mockImplementationOnce(async () => marshaledData);
    assert.deepEqual(await posts.get(tx, { id1: `1` }), {
      text: `hello`,
    });
    assert.equal(tx.get.mock.callCount(), 1);
    assert.deepEqual(tx.get.mock.calls[0]?.arguments, [`foo/1`]);
  });

  void test(`two keys`, async (t) => {
    const posts = rizzle.keyValue(`foo/[id1]/[id2]`, {
      id1: rizzle.string(),
      id2: rizzle.string(),
      text: rizzle.string(),
    });

    using tx = makeMockTx(t);

    await posts.set(tx, { id1: `1`, id2: `2` }, { text: `hello` });
    const [, marshaledData] = tx.set.mock.calls[0]!.arguments;
    tx.get.mock.mockImplementationOnce(async () => marshaledData);
    assert.deepEqual(await posts.get(tx, { id1: `1`, id2: `2` }), {
      text: `hello`,
    });
    assert.equal(tx.get.mock.callCount(), 1);
    assert.deepEqual(tx.get.mock.calls[0]?.arguments, [`foo/1/2`]);
  });

  void test(`non-string key codec`, async (t) => {
    const posts = rizzle.keyValue(`foo/[skill]`, {
      skill: rizzle.skillId(),
      text: rizzle.string(),
    });

    // Marshal and unmarshal round tripping
    for (const [skill, skillId] of [
      [{ type: SkillType.EnglishToHanzi, hanzi: `好` }, `eh:好`],
      [
        { type: SkillType.RadicalToEnglish, hanzi: `好`, name: `good` },
        `re:好:good`,
      ],
      [
        { type: SkillType.RadicalToPinyin, hanzi: `好`, pinyin: `hǎo` },
        `rp:好:hǎo`,
      ],
    ] as const) {
      using tx = makeMockTx(t);
      await posts.set(tx, { skill }, { text: `hello` });
      const [, marshaledData] = tx.set.mock.calls[0]!.arguments;
      tx.get.mock.mockImplementationOnce(async () => marshaledData);
      assert.deepEqual(await posts.get(tx, { skill }), {
        text: `hello`,
      });
      assert.equal(tx.get.mock.callCount(), 1);
      assert.deepEqual(tx.get.mock.calls[0]?.arguments, [`foo/${skillId}`]);
    }
  });

  void test(`enum()`, async (t) => {
    enum Colors {
      RED,
      BLUE,
    }

    const posts = rizzle.keyValue(`foo/[id]`, {
      id: rizzle.string(),
      color: rizzle.enum(Colors, {
        [Colors.RED]: `r`,
        [Colors.BLUE]: `b`,
      }),
    });

    // Marshal and unmarshal round tripping
    for (const color of [Colors.BLUE, Colors.RED]) {
      using tx = makeMockTx(t);

      await posts.set(tx, { id: `1` }, { color });
      const [, marshaledData] = tx.set.mock.calls[0]!.arguments;
      tx.get.mock.mockImplementationOnce(async () => marshaledData);
      // Make sure the enum isn't just being marshaled to its runtime value,
      // these are too easily to change accidentally so instead there should be
      // a separate explicit marshaled value.
      assert.notEqual(Object.values(marshaledData as object), [color]);
      assert.deepEqual(await posts.get(tx, { id: `1` }), {
        color,
      });
    }
  });

  void test(`object() with alias`, async (t) => {
    const posts = rizzle.keyValue(`foo/[id]`, {
      id: rizzle.string(),
      author: rizzle.object({
        name: rizzle.string(),
        email: rizzle.string(`e`),
        id: rizzle.number(`i`).indexed(`byAuthorId`),
      }),
    });

    using tx = makeMockTx(t);

    // Marshal and unmarshal round tripping
    await posts.set(
      tx,
      { id: `1` },
      { author: { name: `foo`, email: `f@o`, id: 1 } },
    );
    const [, marshaledData] = tx.set.mock.calls[0]!.arguments;
    assert.deepEqual(marshaledData, {
      author: { name: `foo`, e: `f@o`, i: 1 },
    });

    tx.get.mock.mockImplementationOnce(async () => marshaledData);
    assert.deepEqual(await posts.get(tx, { id: `1` }), {
      author: { name: `foo`, email: `f@o`, id: 1 },
    });
  });

  void test(`object()`, async (t) => {
    const posts = rizzle.keyValue(`foo/[id]`, {
      id: rizzle.string(),
      author: rizzle.object({
        name: rizzle.string(),
      }),
    });

    using tx = makeMockTx(t);

    // Marshal and unmarshal round tripping
    await posts.set(tx, { id: `1` }, { author: { name: `foo` } });
    const [, marshaledData] = tx.set.mock.calls[0]!.arguments;
    assert.deepEqual(marshaledData, { author: { name: `foo` } });

    tx.get.mock.mockImplementationOnce(async () => marshaledData);
    assert.deepEqual(await posts.get(tx, { id: `1` }), {
      author: { name: `foo` },
    });
  });

  void test(`object indexes`, () => {
    {
      const posts = rizzle.keyValue(`foo/[id]`, {
        id: rizzle.string(),
        author: rizzle.object({
          name: rizzle.string().indexed(`byAuthorName`),
        }),
      });

      assert.deepEqual(posts._def.valueType._getIndexes(), {
        byAuthorName: {
          allowEmpty: false,
          jsonPointer: `/author/name`,
        },
      });
      assert.deepEqual(posts.getIndexes(), {
        byAuthorName: {
          allowEmpty: false,
          prefix: `foo/`,
          jsonPointer: `/author/name`,
        },
      });
    }
  });

  void test(`parseKeyPath`, () => {
    assert.deepEqual(parseKeyPath(`foo/$[id]`, `foo/$1`), { id: `1` });
    assert.deepEqual(parseKeyPath(`^foo/$[id]`, `^foo/$1`), { id: `1` });
    assert.deepEqual(parseKeyPath(`foo/[id]`, `foo/1`), { id: `1` });
    assert.deepEqual(parseKeyPath(`foo/[id1]/[id2]`, `foo/1/2`), {
      id1: `1`,
      id2: `2`,
    });
  });

  void test(`mutator()`, async () => {
    const fn = rizzle
      .mutator({
        id: rizzle.string(),
        rank: rizzle.number(`r`),
      })
      .alias(`cp`);

    assert.deepEqual(fn._def.alias, `cp`);
  });

  void test(`replicache()`, async (t) => {
    const schema = {
      posts: rizzle.keyValue(`p/[id]`, {
        id: rizzle.string(),
        rank: rizzle.number(`r`).indexed(`byRank`),
      }),
      createPost: rizzle
        .mutator({
          id: rizzle.string(),
          rank: rizzle.number(`r`),
        })
        .alias(`cp`),
      createPost2: rizzle
        .mutator({
          id: rizzle.string(),
          rank: rizzle.number(`r`),
        })
        .alias(`cp2`),
    };

    const createPost2: RizzleReplicacheMutators<
      typeof schema
    >[`createPost2`] = async (db, { id, rank }) => {
      true satisfies IsEqual<typeof db.tx, WriteTransaction>;
      true satisfies IsEqual<typeof id, string>;
      true satisfies IsEqual<typeof rank, number>;

      typeChecks(async () => {
        // native replicache tx API
        await db.tx.set(`p/${id}`, { r: rank });

        // rizzle convenience API
        await db.posts.get({ id });
        await db.posts.set({ id }, { rank });

        // @ts-expect-error there's no rank2 in the schema
        await db.posts.set({ id }, { rank2: 2 });
      });
    };

    // Only mutators are included (i.e. not `posts`)
    true satisfies IsEqual<
      keyof RizzleReplicacheMutators<typeof schema>,
      `createPost` | `createPost2`
    >;
    // Only key-value are included (i.e. not `createPost`)
    true satisfies IsEqual<keyof RizzleReplicacheQuery<typeof schema>, `posts`>;

    let checkPointsReached = 0;

    await using db = rizzle.replicache(
      testReplicacheOptions,
      schema,
      {
        async createPost(db, options) {
          true satisfies IsEqual<typeof db.tx, WriteTransaction>;
          true satisfies IsEqual<typeof options, { id: string; rank: number }>;
          assert.deepEqual(await db.posts.get({ id: `2` }), undefined);
          assert.deepEqual(options, { id: `1`, rank: 5 });
          await db.posts.set({ id: options.id }, { rank: options.rank });
          checkPointsReached++;
        },
        createPost2,
        // @ts-expect-error there's no createPost3 in the schema
        createPost3: createPost2,
      },
      (options) => {
        assert.deepEqual(
          mapValues(options.mutators, (v) => typeof v),
          { cp: `function`, cp2: `function` },
        );
        assert.deepEqual(options.indexes, {
          "posts.byRank": {
            allowEmpty: false,
            jsonPointer: `/r`,
            prefix: `p/`,
          },
        });
        checkPointsReached++;

        return new Replicache(options);
      },
    );

    await db.mutate.createPost({ id: `1`, rank: 5 });
    true satisfies IsEqual<
      ReturnType<typeof db.mutate.createPost>,
      Promise<void>
    >;

    {
      //
      // Index scans
      //
      using tx = makeMockTx(t);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tx.scan.mock.mockImplementationOnce((options: any): any => {
        checkPointsReached++;
        assert.deepEqual(options, {
          indexName: `posts.byRank`,
          start: undefined,
        });
        return {
          async *entries() {
            const value = [[5, `p/1`], { r: 5 }];
            yield await Promise.resolve(value);
          },
        };
      }, 0);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tx.scan.mock.mockImplementationOnce((options: any): any => {
        checkPointsReached++;
        assert.deepEqual(options, {
          indexName: `posts.byRank`,
          start: {
            exclusive: true,
            key: 5,
          },
        });
        return {
          async *entries() {
            return;
          },
        };
      }, 1);

      const results = [];
      for await (const post of db.query.posts.byRank(tx)) {
        results.push(post);
      }
      assert.deepEqual(results, [[{ id: `1` }, { rank: 5 }]]);
    }

    {
      //
      // kv .get()
      //
      using tx = makeMockTx(t);

      tx.get.mock.mockImplementationOnce(async (x: unknown) =>
        x === `p/1` ? { r: 5 } : undefined,
      );

      const post = await db.query.posts.get(tx, { id: `1` });
      assert.deepEqual(post, { rank: 5 });
    }

    {
      //
      // kv .set()
      //
      using tx = makeMockTx(t);

      tx.get.mock.mockImplementationOnce(async (x: unknown) =>
        x === `p/1` ? { r: 5 } : undefined,
      );

      const post = await db.query.posts.get(tx, { id: `1` });
      assert.deepEqual(post, { rank: 5 });
    }

    assert.equal(checkPointsReached, 4);
  });

  void test(`replicache() mutator tx`, async () => {
    const schema = {
      counter: rizzle.keyValue(`counter/[id]`, {
        id: rizzle.string(),
        count: rizzle.number(`c`),
      }),
      incrementCounter: rizzle
        .mutator({
          id: rizzle.string(),
        })
        .alias(`ic`),
    };

    await using db = rizzle.replicache(testReplicacheOptions, schema, {
      async incrementCounter(db, options) {
        const { id } = options;
        const existingCount = await db.counter.get({ id });

        await db.counter.set(
          { id },
          { count: (existingCount?.count ?? 0) + 1 },
        );
      },
    });

    await db.mutate.incrementCounter({ id: `1` });
    assert.deepEqual(
      await db.replicache.query((tx) => db.query.counter.get(tx, { id: `1` })),
      { count: 1 },
    );
    await db.mutate.incrementCounter({ id: `1` });
    assert.deepEqual(
      await db.replicache.query((tx) => db.query.counter.get(tx, { id: `1` })),
      { count: 2 },
    );
  });

  void test(`replicache() index scan`, async () => {
    const schema = {
      text: rizzle.keyValue(`text/[id]`, {
        id: rizzle.string(),
        body: rizzle.string(`b`).indexed(`byCount`),
      }),
      appendText: rizzle
        .mutator({
          id: rizzle.string(),
          text: rizzle.string(),
        })
        .alias(`at`),
    };

    await using db = rizzle.replicache(testReplicacheOptions, schema, {
      async appendText(db, options) {
        const { id } = options;
        const existing = await db.text.get({ id });

        await db.text.set(
          { id },
          { body: (existing?.body ?? ``) + options.text },
        );
      },
    });

    await db.mutate.appendText({ id: `1`, text: `aaa` });
    await db.mutate.appendText({ id: `2`, text: `bbb` });

    await db.replicache.query(async (tx) => {
      const results = [];
      for await (const counter of db.query.text.byCount(tx)) {
        results.push(counter);
      }
      assert.deepEqual(results, [
        [{ id: `1` }, { body: `aaa` }],
        [{ id: `2` }, { body: `bbb` }],
      ]);
    });
  });

  void test(`number()`, async (t) => {
    const posts = rizzle.keyValue(`foo/[id]`, {
      id: rizzle.string(),
      count: rizzle.number(`c`),
    });

    using tx = makeMockTx(t);

    // Marshal and unmarshal round tripping
    await posts.set(tx, { id: `1` }, { count: 5 });
    const [, marshaledData] = tx.set.mock.calls[0]!.arguments;
    assert.deepEqual(marshaledData, { c: 5 });

    tx.get.mock.mockImplementationOnce(async () => marshaledData);
    assert.deepEqual(await posts.get(tx, { id: `1` }), {
      count: 5,
    });
  });

  typeChecks(`RizzleIndexNames<>`, () => {
    // Outer wrapping is RizzleIndexed.
    true satisfies IsEqual<
      RizzleIndexNames<
        RizzleObject<{
          id: RizzlePrimitive<string, string>;
          date: RizzleIndexed<RizzlePrimitive<Date, string>, `byDate`>;
          name: RizzleIndexed<RizzlePrimitive<Date, string>, `byName`>;
        }>
      >,
      `byDate` | `byName`
    >;

    // Inner wrapping is RizzleIndexed.
    true satisfies IsEqual<
      Prettify<
        RizzleIndexNames<
          RizzleObject<{
            id: RizzlePrimitive<string, string>;
            date: RizzleTypeAlias<
              RizzleIndexed<RizzlePrimitive<Date, string>, `byDate`>
            >;
          }>
        >
      >,
      `byDate`
    >;
  });

  typeChecks<RizzleObjectInput<never>>(() => {
    type RawShape = {
      id: RizzlePrimitive<string, string>;
      date: RizzlePrimitive<Date, string>;
    };

    true satisfies IsEqual<
      RizzleObjectInput<RawShape>,
      { id: string; date: Date }
    >;

    true satisfies IsEqual<
      RizzleObject<RawShape>[`_input`],
      { id: string; date: Date }
    >;
  });

  typeChecks<RizzleObjectOutput<never>>(() => {
    type RawShape = {
      id: RizzlePrimitive<string, string>;
      date: RizzlePrimitive<Date, string>;
    };

    true satisfies IsEqual<
      RizzleObjectOutput<RawShape>,
      { id: string; date: string }
    >;

    true satisfies IsEqual<
      RizzleObject<RawShape>[`_output`],
      { id: string; date: string }
    >;
  });
});

void test(keyPathVariableNames.name, () => {
  assert.deepEqual(keyPathVariableNames(`foo/[id]`), [`id`]);
  assert.deepEqual(keyPathVariableNames(`foo/[id]/[bar]`), [`id`, `bar`]);
});
