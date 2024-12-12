import {
  ExtractVariableNames,
  keyPathVariableNames,
  parseKeyPath,
  r,
  RizzleIndexed,
  RizzleIndexNames,
  RizzleNullable,
  RizzleObject,
  RizzleObjectInput,
  RizzleObjectMarshaled,
  RizzleObjectOutput,
  RizzlePrimitive,
  RizzleReplicache,
  RizzleReplicacheMutators,
  RizzleReplicacheQuery,
  RizzleTypeAlias,
  ValueSchemaShape,
} from "@/data/rizzle";
import { IsEqual } from "@/util/types";
import mapValues from "lodash/mapValues";
import assert from "node:assert/strict";
import test, { TestContext } from "node:test";
import {
  ReadTransaction,
  Replicache,
  ReplicacheOptions,
  TEST_LICENSE_KEY,
  WriteTransaction,
} from "replicache";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-parameters
function typeChecks<_T = any>(..._args: unknown[]) {
  // This function is only used for type checking, so it should never be called.
}

function makeMockTx(t: TestContext) {
  const readTx = {
    get: t.mock.fn<ReadTransaction[`get`]>(async () => undefined),
    scan: t.mock.fn<ReadTransaction[`scan`]>(() => {
      return null as never;
    }),
    clientID: null as never,
    environment: null as never,
    location: null as never,
    has: t.mock.fn<ReadTransaction[`has`]>(async () => false),
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

const testReplicacheOptions = {
  name: `test`,
  licenseKey: TEST_LICENSE_KEY,
  kvStore: `mem`,
  pullInterval: null,
  logLevel: `error`,
} satisfies ReplicacheOptions<never>;

void test(`string() key and value`, async (t) => {
  const posts = r.keyValue(`foo/[id]`, {
    id: r.string(),
    name: r.string(),
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
  assert.deepEqual(tx.set.mock.calls[0]?.arguments, [`foo/1`, { name: `foo` }]);

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

void test(`string() .nullable()`, async (t) => {
  const posts = r.keyValue(`foo/[id]`, {
    id: r.string(),
    name: r.string().nullable().alias(`n`),
  });

  using tx = makeMockTx(t);

  tx.get.mock.mockImplementationOnce(async () => ({ n: `foo` }));
  assert.deepEqual(await posts.get(tx, { id: `1` }), { name: `foo` });

  tx.get.mock.mockImplementationOnce(async () => ({ n: null }));
  assert.deepEqual(await posts.get(tx, { id: `1` }), { name: null });

  typeChecks(async () => {
    // .get()
    {
      const x = await posts.get(tx, { id: `1` });
      true satisfies IsEqual<typeof x, { name: string | null } | undefined>;
    }

    // .set()
    void posts.set(tx, { id: `1` }, { name: `foo` });
    void posts.set(tx, { id: `1` }, { name: null });
  });
});

void test(`object() .nullable()`, async (t) => {
  const posts = r.keyValue(`foo/[id]`, {
    id: r.string(),
    name: r
      .object({
        first: r.string(),
        last: r.string(),
      })
      .nullable()
      .alias(`n`),
  });

  using tx = makeMockTx(t);

  tx.get.mock.mockImplementationOnce(async () => ({
    n: { first: `a`, last: `b` },
  }));
  assert.deepEqual(await posts.get(tx, { id: `1` }), {
    name: { first: `a`, last: `b` },
  });

  tx.get.mock.mockImplementationOnce(async () => ({ n: null }));
  assert.deepEqual(await posts.get(tx, { id: `1` }), { name: null });

  typeChecks(async () => {
    // .get()
    {
      const x = await posts.get(tx, { id: `1` });
      true satisfies IsEqual<
        typeof x,
        { name: { first: string; last: string } | null } | undefined
      >;
    }

    // .set()
    void posts.set(tx, { id: `1` }, { name: { first: `a`, last: `b` } });
    void posts.set(tx, { id: `1` }, { name: null });
  });
});

void test(`object()`, async (t) => {
  using tx = makeMockTx(t);

  {
    // key alias
    const posts = r.keyValue(`foo/[id]`, {
      id: r.string(),
      name: r.string(`n`),
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
    assert.deepEqual(tx.set.mock.calls[0]?.arguments, [`foo/1`, { n: `foo` }]);
  }

  typeChecks(`simple, no aliases`, async () => {
    const posts = r.keyValue(`foo/[id]`, {
      id: r.string(),
      name: r.string(),
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
    const posts = r.keyValue(`foo/[id]`, {
      id: r.string(),
      author: r.object({
        name: r.string(),
        email: r.string(`e`),
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
  const posts = r.keyValue(`foo/[id]`, {
    id: r.string(),
    due: r.timestamp(),
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

void test(`keyValue() one variable`, async (t) => {
  const posts = r.keyValue(`foo/[id1]`, {
    id1: r.string(),
    text: r.string(),
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

void test(`keyValue() variables requires string marshaler`, async () => {
  typeChecks(() => {
    r.keyValue(`foo/[id]`, { id: r.string() });
    r.keyValue(`foo/[id]`, { id: r.literal(`foo`, r.string()) });
    // @ts-expect-error number() doesn't marshal to a string
    r.keyValue(`foo/[id]`, { id: r.number() });
  });
});

void test(`keyValue() two variables`, async (t) => {
  const posts = r.keyValue(`foo/[id1]/[id2]`, {
    id1: r.string(),
    id2: r.string(),
    text: r.string(),
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

void test(`keyValue() non-string key codec`, async (t) => {
  const rComplex = r.primitive(
    z
      .tuple([z.string(), z.number()])
      .readonly()
      .transform((v) => v.join(`:`)),
    z.string().transform((s) => {
      const [a, b] = s.split(`:`);
      return [a, parseInt(b!, 10)] as const;
    }),
  );

  const posts = r.keyValue(`foo/[complex]`, {
    complex: rComplex,
    text: r.string(),
  });

  // Marshal and unmarshal round tripping
  for (const [unmarshaled, marshaled] of [
    [[`a`, 1], `a:1`],
    [[`c`, 3], `c:3`],
  ] as const) {
    using tx = makeMockTx(t);
    await posts.set(tx, { complex: unmarshaled }, { text: `hello` });
    const [, marshaledData] = tx.set.mock.calls[0]!.arguments;
    tx.get.mock.mockImplementationOnce(async () => marshaledData);
    assert.deepEqual(await posts.get(tx, { complex: unmarshaled }), {
      text: `hello`,
    });
    assert.equal(tx.get.mock.callCount(), 1);
    assert.deepEqual(tx.get.mock.calls[0]?.arguments, [`foo/${marshaled}`]);
  }
});

void test(`keyValue() .has()`, async (t) => {
  const posts = r.keyValue(`foo/[id]`, { id: r.string() });

  using tx = makeMockTx(t);

  // Marshal and unmarshal round tripping
  await posts.has(tx, { id: `1` });
  assert.deepEqual(tx.has.mock.calls[0]!.arguments, [`foo/1`]);

  tx.has.mock.mockImplementation(async (key) =>
    key === `foo/1` ? true : false,
  );
  assert.deepEqual(await posts.has(tx, { id: `1` }), true);
  assert.deepEqual(await posts.has(tx, { id: `2` }), false);
});

void test(`keyValue() distinguishing between input/output types`, async (t) => {
  const rCoerciveString = () =>
    r.primitive(
      // takes in a number or string
      z
        .union([z.number(), z.string()])
        .transform((v) => (typeof v === `string` ? v : v.toString())),
      // but always returns back to a string
      z.string(),
    );

  const posts = r.keyValue(`foo/[id]`, {
    id: rCoerciveString(),
    text: rCoerciveString().indexed(`byText`),
  });

  using tx = makeMockTx(t);

  // .get()
  {
    const x1 = await posts.get(tx, { id: `1` });
    true satisfies IsEqual<typeof x1, { text: string } | undefined>;
    const x2 = await posts.get(tx, { id: 1 });
    true satisfies IsEqual<typeof x2, { text: string } | undefined>;
  }

  // .has()
  await posts.has(tx, { id: `1` });
  await posts.has(tx, { id: 1 });

  // .set()
  await posts.set(tx, { id: `1` }, { text: `1` });
  await posts.set(tx, { id: 1 }, { text: 1 });

  // index scan
  typeChecks(async () => {
    const schema = { posts };
    const r = null as unknown as RizzleReplicache<typeof schema>;
    for await (const [key, value] of r.query.posts.byText(tx)) {
      true satisfies IsEqual<typeof key, { id: string }>;
      true satisfies IsEqual<typeof value, { text: string }>;
    }
  });
});

void test(`keyValue() requires variables to be declared`, () => {
  typeChecks(() => {
    r.keyValue(
      `foo/[id]`,
      // @ts-expect-error `id` is missing
      { text: r.string() },
    );
  });
});

void test(`number()`, async (t) => {
  const posts = r.keyValue(`foo/[id]`, {
    id: r.string(),
    count: r.number(`c`),
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
void test(`enum()`, async (t) => {
  enum Colors {
    RED,
    BLUE,
  }

  const posts = r.keyValue(`foo/[id]`, {
    id: r.string(),
    color: r.enum(Colors, {
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
  const posts = r.keyValue(`foo/[id]`, {
    id: r.string(),
    author: r.object({
      name: r.string(),
      email: r.string(`e`),
      id: r.number(`i`).indexed(`byAuthorId`),
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
  const posts = r.keyValue(`foo/[id]`, {
    id: r.string(),
    author: r.object({
      name: r.string(),
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

void test(`.getIndexes()`, () => {
  // no key path variables
  {
    const posts = r.keyValue(`foo`, {
      id: r.string(),
      author: r.object({
        name: r.string().indexed(`byAuthorName`),
      }),
    });
    assert.deepEqual(posts.getIndexes(), {
      byAuthorName: {
        allowEmpty: false,
        prefix: `foo`,
        jsonPointer: `/author/name`,
      },
    });
  }

  // object(.string().indexed())
  {
    const posts = r.keyValue(`foo/`, {
      id: r.string(),
      author: r.object({
        name: r.string().indexed(`byAuthorName`),
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

  // .string().indexed().nullable()
  {
    const posts = r.keyValue(`foo/[id]`, {
      id: r.string(),
      name: r.string().indexed(`byAuthorName`).nullable(),
    });

    assert.deepEqual(posts.getIndexes(), {
      byAuthorName: {
        allowEmpty: false,
        prefix: `foo/`,
        jsonPointer: `/name`,
      },
    });
  }

  // .string().alias().indexed().nullable()
  {
    const posts = r.keyValue(`foo/[id]`, {
      id: r.string(),
      name: r.string().alias(`n`).indexed(`byAuthorName`).nullable(),
    });

    assert.deepEqual(posts.getIndexes(), {
      byAuthorName: {
        allowEmpty: false,
        prefix: `foo/`,
        jsonPointer: `/n`,
      },
    });
  }

  // .string().indexed().alias()
  {
    const posts = r.keyValue(`foo/[id]`, {
      id: r.string(),
      name: r.string().indexed(`byAuthorName`).alias(`n`),
    });

    assert.deepEqual(posts.getIndexes(), {
      byAuthorName: {
        allowEmpty: false,
        prefix: `foo/`,
        jsonPointer: `/n`,
      },
    });
  }
});

void test(`${parseKeyPath.name}()`, () => {
  assert.deepEqual(parseKeyPath(`foo/$[id]`, `foo/$1`), { id: `1` });
  assert.deepEqual(parseKeyPath(`^foo/$[id]`, `^foo/$1`), { id: `1` });
  assert.deepEqual(parseKeyPath(`foo/[id]`, `foo/1`), { id: `1` });
  assert.deepEqual(parseKeyPath(`foo/[id1]/[id2]`, `foo/1/2`), {
    id1: `1`,
    id2: `2`,
  });
});

void test(`mutator()`, async () => {
  const fn = r
    .mutator({
      id: r.string(),
      rank: r.number(`r`),
    })
    .alias(`cp`);

  assert.deepEqual(fn._def.alias, `cp`);
});

typeChecks<RizzleReplicacheMutators<never>>(
  `allows writing mutator implementations separately`,
  async () => {
    const schema = {
      posts: r.keyValue(`p/[id]`, {
        id: r.string(),
        rank: r.number(`r`).indexed(`byRank`),
      }),
      createPost: r
        .mutator({
          id: r.string(),
          rank: r.number(`r`),
        })
        .alias(`cp`),
    };

    const createPost: RizzleReplicacheMutators<
      typeof schema
    >[`createPost`] = async (db, options) => {
      true satisfies IsEqual<typeof db.tx, WriteTransaction>;
      true satisfies IsEqual<typeof options, { id: string; rank: number }>;

      typeChecks(async () => {
        const { id, rank } = options;
        // native replicache tx API
        await db.tx.set(`p/${id}`, { r: rank });

        // rizzle convenience API
        await db.posts.get({ id });
        await db.posts.set({ id }, { rank });

        // @ts-expect-error there's no rank2 in the schema
        await db.posts.set({ id }, { rank2: 2 });
      });
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    createPost;
  },
);

typeChecks<RizzleReplicacheMutators<never>>(async () => {
  const schema = {
    posts: r.keyValue(`p/[id]`, { id: r.string() }),
    createPost: r.mutator({ id: r.string() }),
  };

  // Only mutators are included
  true satisfies IsEqual<
    keyof RizzleReplicacheMutators<typeof schema>,
    `createPost`
  >;
});

typeChecks<RizzleReplicacheQuery<never>>(async () => {
  const schema = {
    posts: r.keyValue(`p/[id]`, { id: r.string() }),
    createPost: r.mutator({ id: r.string() }),
  };

  // Only key-value are included
  true satisfies IsEqual<keyof RizzleReplicacheQuery<typeof schema>, `posts`>;
});

void test(`replicache()`, async (t) => {
  const schema = {
    posts: r.keyValue(`p/[id]`, {
      id: r.string(),
      rank: r.number(`r`).indexed(`byRank`),
    }),
    createPost: r
      .mutator({
        id: r.string(),
        rank: r.number(`r`),
      })
      .alias(`cp`),
  };

  let checkPointsReached = 0;

  await using db = r.replicache(
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
    },
    (options) => {
      assert.deepEqual(
        mapValues(options.mutators, (v) => typeof v),
        { cp: `function` },
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
    // keyValue() .has()
    //
    using tx = makeMockTx(t);

    tx.has.mock.mockImplementation(async (x: unknown) => x === `p/1`);

    assert.equal(await db.query.posts.has(tx, { id: `1` }), true);
    assert.equal(await db.query.posts.has(tx, { id: `2` }), false);
  }

  {
    //
    // keyValue() .get()
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
    // keyValue() .set()
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

void test(`replicache() disallows unknown mutator implementations`, async () => {
  const schema = {
    posts: r.keyValue(`p/[id]`, { id: r.string() }),
    createPost: r.mutator({ id: r.string() }),
  };

  // Only mutators are included (i.e. not `posts`)
  true satisfies IsEqual<
    keyof RizzleReplicacheMutators<typeof schema>,
    `createPost`
  >;
  // Only key-value are included (i.e. not `createPost`)
  true satisfies IsEqual<keyof RizzleReplicacheQuery<typeof schema>, `posts`>;

  typeChecks(async () => {
    r.replicache(testReplicacheOptions, schema, {
      async createPost() {
        // stub
      },
      // @ts-expect-error there's no createPost2 in the schema
      async createPost2() {
        // stub
      },
    });
  });
});

void test(`replicache() mutator tx`, async () => {
  const schema = {
    counter: r.keyValue(`counter/[id]`, {
      id: r.string(),
      count: r.number(`c`),
    }),
    incrementCounter: r
      .mutator({
        id: r.string(),
      })
      .alias(`ic`),
  };

  await using db = r.replicache(testReplicacheOptions, schema, {
    async incrementCounter(db, options) {
      const { id } = options;
      const existingCount = await db.counter.get({ id });

      await db.counter.set({ id }, { count: (existingCount?.count ?? 0) + 1 });
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
    text: r.keyValue(`text/[id]`, {
      id: r.string(),
      body: r.string(`b`).indexed(`byCount`),
    }),
    appendText: r
      .mutator({
        id: r.string(),
        text: r.string(),
      })
      .alias(`at`),
  };

  await using db = r.replicache(testReplicacheOptions, schema, {
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
  const posts = r.keyValue(`foo/[id]`, {
    id: r.string(),
    count: r.number(`c`),
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

void test(`literal()`, async (t) => {
  typeChecks(async () => {
    r.literal(1, r.number());
    r.literal(``, r.string());
    // @ts-expect-error string isn't compatible with number
    r.literal(`abc`, r.number());

    using tx = makeMockTx(t);

    {
      const kv = r.keyValue(`foo`, { number: r.literal(1, r.number()) });

      // .set()
      await kv.set(tx, { id: `1` }, { number: 1 });
      // @ts-expect-error 2 isn't literally 1
      await kv.set(tx, { id: `1` }, { number: 2 });

      // .get()
      const v1 = await kv.get(tx, { id: `1` });
      true satisfies IsEqual<typeof v1, { number: 1 } | undefined>;
    }

    {
      const kv = r.keyValue(`foo`, { string: r.literal(`1`, r.string()) });

      // .set()
      await kv.set(tx, { id: `1` }, { string: `1` });
      // @ts-expect-error '2' isn't literally '1'
      await kv.set(tx, { id: `1` }, { string: `2` });

      // .get()
      const v1 = await kv.get(tx, { id: `1` });
      true satisfies IsEqual<typeof v1, { string: `1` } | undefined>;
    }
  });

  const posts = r.keyValue(`foo/[id]`, {
    id: r.string(),
    count: r.literal(5, r.number()).alias(`c`),
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

typeChecks<RizzleIndexNames<never>>(() => {
  // .string().indexed(…)
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

  // .string().indexed(…).alias()
  true satisfies IsEqual<
    RizzleIndexNames<
      RizzleObject<{
        id: RizzlePrimitive<string, string>;
        date: RizzleTypeAlias<
          RizzleIndexed<RizzlePrimitive<Date, string>, `byDate`>
        >;
      }>
    >,
    `byDate`
  >;

  // .string().indexed(…).nullable()
  true satisfies IsEqual<
    RizzleIndexNames<
      RizzleObject<{
        id: RizzlePrimitive<string, string>;
        date: RizzleNullable<
          RizzleIndexed<RizzlePrimitive<Date, string>, `byDate`>
        >;
      }>
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

typeChecks<RizzleObjectMarshaled<never>>(() => {
  type RawShape = {
    id: RizzlePrimitive<string, number, string>;
    date: RizzlePrimitive<Date, number, string>;
  };

  true satisfies IsEqual<
    RizzleObjectMarshaled<RawShape>,
    { id: number; date: number }
  >;

  true satisfies IsEqual<
    RizzleObject<RawShape>[`_marshaled`],
    { id: number; date: number }
  >;
});

typeChecks<RizzleObjectOutput<never>>(() => {
  type RawShape = {
    id: RizzlePrimitive<string, number, string>;
    date: RizzlePrimitive<Date, number, string>;
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

void test(`${keyPathVariableNames.name}()`, () => {
  assert.deepEqual(keyPathVariableNames(`foo/[id]`), [`id`]);
  assert.deepEqual(keyPathVariableNames(`foo/[id]/[bar]`), [`id`, `bar`]);
});

typeChecks<ExtractVariableNames<never>>(() => {
  true satisfies IsEqual<ExtractVariableNames<`a[b]`>, `b`>;
  true satisfies IsEqual<ExtractVariableNames<`a[b][c]`>, `b` | `c`>;
  true satisfies IsEqual<ExtractVariableNames<`a[b][c][d]`>, `b` | `c` | `d`>;
});

typeChecks(`schema introspection helpers`, () => {
  const schema = { id: r.string(), name: r.string() };

  true satisfies IsEqual<
    ValueSchemaShape<`path/[id]`, typeof schema>,
    Pick<typeof schema, `name`>
  >;
});