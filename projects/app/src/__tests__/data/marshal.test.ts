import {
  ExtractVariableNames,
  KeyPathSchemaShape,
  keyPathVariableNames,
  marshalSkillStateJson,
  marshalSrsStateJson,
  rizzle,
  RizzleObjectInput,
  RizzleObjectOutput,
  RizzlePrimitive,
  unmarshalSkillStateJson,
  unmarshalSrsStateJson,
  ValueSchemaShape,
} from "@/data/marshal";
import { Skill, SkillState, SkillType, SrsState, SrsType } from "@/data/model";
import assert from "node:assert";
import test, { suite, TestContext } from "node:test";
import { ReadTransaction, WriteTransaction } from "replicache";
import { Prettify } from "ts-essentials";

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
  assert.deepStrictEqual(x, unmarshalSkillStateJson(marshalSkillStateJson(x)));
});

void test(`SrsState`, () => {
  const value: SrsState = {
    type: SrsType.Null,
  };

  assert.deepStrictEqual(
    value,
    unmarshalSrsStateJson(marshalSrsStateJson(value)),
  );
});

// Utility type to check if two types are identical

type AssertEqual<T, U> =
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  (<G>() => G extends T ? 1 : 2) extends <G>() => G extends U ? 1 : 2
    ? true
    : false | /* debug intellisense hint */ Prettify<T>;

void test.skip(`AssertEqual`, () => {
  true satisfies AssertEqual<`a`, `a`>;
  false satisfies AssertEqual<`a`, `b`>;

  true satisfies AssertEqual<`a` | undefined, `a` | undefined>;
  true satisfies AssertEqual<`a` | null, `a` | null>;
});

void test.skip(`ExtractKeys`, () => {
  true satisfies AssertEqual<ExtractVariableNames<`a[b]`>, `b`>;
  true satisfies AssertEqual<ExtractVariableNames<`a[b][c]`>, `b` | `c`>;
  true satisfies AssertEqual<
    ExtractVariableNames<`a[b][c][d]`>,
    `b` | `c` | `d`
  >;
});

void test.skip(`schema introspection helpers`, () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const schema = { id: rizzle.string(), name: rizzle.string() };

  true satisfies AssertEqual<
    KeyPathSchemaShape<`path/[id]`, typeof schema>,
    Pick<typeof schema, `id`>
  >;

  true satisfies AssertEqual<
    ValueSchemaShape<`path/[id]`, typeof schema>,
    Pick<typeof schema, `name`>
  >;

  // true satisfies AssertEqual<
  //   SchemaShapeUnmarshaled<typeof schema>,
  //   { id: string; name: string }
  // >;
});

function makeMockTx(t: TestContext) {
  const mockRtx = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    get: t.mock.fn((id: string) =>
      Promise.resolve<object | undefined>(undefined),
    ),
  };
  const mockWtx = {
    ...mockRtx,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    set: t.mock.fn((id: string, data: unknown) =>
      Promise.resolve<object | undefined>(undefined),
    ),
  };

  return {
    mockRtx,
    mockWtx,
    rtx: mockRtx as unknown as ReadTransaction,
    wtx: mockWtx as unknown as WriteTransaction,
    mockTx: mockWtx,
    tx: mockWtx as unknown as WriteTransaction,
  };
}

void suite(`rizzle`, () => {
  void test(`string key and value`, async (t) => {
    const posts = rizzle.schema(`foo/[id]`, {
      id: rizzle.string(),
      name: rizzle.string(),
    });

    const { mockTx, tx } = makeMockTx(t);

    await posts.get(tx, { id: `1` });
    assert.equal(mockTx.get.mock.callCount(), 1);
    assert.deepEqual(mockTx.get.mock.calls[0]?.arguments, [`foo/1`]);

    // Check that a ReadonlyJSONValue is parsed correctly.
    mockTx.get.mock.mockImplementationOnce(() =>
      Promise.resolve({ name: `foo` }),
    );
    assert.deepEqual(await posts.get(tx, { id: `1` }), { name: `foo` });

    // Check that a value is encoded correctly.
    await posts.set(tx, { id: `1` }, { name: `foo` });
    assert.equal(mockTx.set.mock.callCount(), 1);
    assert.deepEqual(mockTx.set.mock.calls[0]?.arguments, [
      `foo/1`,
      { name: `foo` },
    ]);
  });

  void test(`object key alias`, async (t) => {
    const posts = rizzle.schema(`foo/[id]`, {
      id: rizzle.string(),
      name: rizzle.string(`n`),
    });

    const { mockTx, tx } = makeMockTx(t);

    await posts.get(tx, { id: `1` });
    assert.equal(mockTx.get.mock.callCount(), 1);
    assert.deepEqual(mockTx.get.mock.calls[0]?.arguments, [`foo/1`]);

    // Check that a ReadonlyJSONValue is parsed correctly.
    mockTx.get.mock.mockImplementationOnce(() => Promise.resolve({ n: `foo` }));
    assert.deepEqual(await posts.get(tx, { id: `1` }), { name: `foo` });

    // Check that a value is encoded correctly.
    await posts.set(tx, { id: `1` }, { name: `foo` });
    assert.equal(mockTx.set.mock.callCount(), 1);
    assert.deepEqual(mockTx.set.mock.calls[0]?.arguments, [
      `foo/1`,
      { n: `foo` },
    ]);
  });

  void test(`timestamp`, async (t) => {
    const posts = rizzle.schema(`foo/[id]`, {
      id: rizzle.string(),
      due: rizzle.timestamp(),
    });

    const { mockTx, tx } = makeMockTx(t);

    await posts.get(tx, { id: `1` });
    assert.equal(mockTx.get.mock.callCount(), 1);
    assert.deepEqual(mockTx.get.mock.calls[0]?.arguments, [`foo/1`]);

    // Unmarshalling
    {
      const date = new Date(1601856000000);
      for (const [marshaled, unmarshaled] of [
        [date.toISOString(), date], // ISO8601 string
        [date.getTime(), date], // timestamp as number
        [date.getTime().toString(), date], // timestamp as string
      ]) {
        mockTx.get.mock.mockImplementationOnce(() =>
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
        assert.equal(mockTx.set.mock.callCount(), 1);
        assert.deepEqual(mockTx.set.mock.calls[0]?.arguments, [
          `foo/1`,
          { due: marshaled },
        ]);
        mockTx.set.mock.resetCalls();
      }
    }
  });

  void test(`skillType`, async (t) => {
    const posts = rizzle.schema(`foo/[id]`, {
      id: rizzle.string(),
      skill: rizzle.skillType(),
    });

    const { mockTx, tx } = makeMockTx(t);

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
      await posts.set(tx, { id: `1` }, { skill: skillType });
      const [, marshaledData] = mockTx.set.mock.calls[0]!.arguments;
      mockTx.get.mock.mockImplementationOnce(() =>
        Promise.resolve(marshaledData as object),
      );
      assert.deepEqual(await posts.get(tx, { id: `1` }), {
        skill: skillType,
      });

      mockTx.get.mock.resetCalls();
      mockTx.set.mock.resetCalls();
    }
  });

  void test(`skillId value`, async (t) => {
    const posts = rizzle.schema(`foo/[id]`, {
      id: rizzle.string(),
      skill: rizzle.skillId(),
    });

    const { mockTx, tx } = makeMockTx(t);

    // Marshal and unmarshal round tripping
    for (const skill of [
      { type: SkillType.EnglishToHanzi, hanzi: `好` },
    ] as const) {
      await posts.set(tx, { id: `1` }, { skill });
      const [, marshaledData] = mockTx.set.mock.calls[0]!.arguments;
      mockTx.get.mock.mockImplementationOnce(() =>
        Promise.resolve(marshaledData as object),
      );
      assert.deepEqual(await posts.get(tx, { id: `1` }), {
        skill,
      });

      mockTx.get.mock.resetCalls();
      mockTx.set.mock.resetCalls();
    }
  });

  void test(`single key`, async (t) => {
    const posts = rizzle.schema(`foo/[id1]`, {
      id1: rizzle.string(),
      text: rizzle.string(),
    });

    const { mockTx, tx } = makeMockTx(t);

    await posts.set(tx, { id1: `1` }, { text: `hello` });
    const [, marshaledData] = mockTx.set.mock.calls[0]!.arguments;
    mockTx.get.mock.mockImplementationOnce(() =>
      Promise.resolve(marshaledData as object),
    );
    assert.deepEqual(await posts.get(tx, { id1: `1` }), {
      text: `hello`,
    });
    assert.equal(mockTx.get.mock.callCount(), 1);
    assert.deepEqual(mockTx.get.mock.calls[0]?.arguments, [`foo/1`]);

    mockTx.get.mock.resetCalls();
    mockTx.set.mock.resetCalls();
  });

  void test(`two keys`, async (t) => {
    const posts = rizzle.schema(`foo/[id1]/[id2]`, {
      id1: rizzle.string(),
      id2: rizzle.string(),
      text: rizzle.string(),
    });

    const { mockTx, tx } = makeMockTx(t);

    await posts.set(tx, { id1: `1`, id2: `2` }, { text: `hello` });
    const [, marshaledData] = mockTx.set.mock.calls[0]!.arguments;
    mockTx.get.mock.mockImplementationOnce(() =>
      Promise.resolve(marshaledData as object),
    );
    assert.deepEqual(await posts.get(tx, { id1: `1`, id2: `2` }), {
      text: `hello`,
    });
    assert.equal(mockTx.get.mock.callCount(), 1);
    assert.deepEqual(mockTx.get.mock.calls[0]?.arguments, [`foo/1/2`]);

    mockTx.get.mock.resetCalls();
    mockTx.set.mock.resetCalls();
  });

  void test(`non-string key codec`, async (t) => {
    const posts = rizzle.schema(`foo/[skill]`, {
      skill: rizzle.skillId(),
      text: rizzle.string(),
    });

    const { mockTx, tx } = makeMockTx(t);

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
      await posts.set(tx, { skill }, { text: `hello` });
      const [, marshaledData] = mockTx.set.mock.calls[0]!.arguments;
      mockTx.get.mock.mockImplementationOnce(() =>
        Promise.resolve(marshaledData as object),
      );
      assert.deepEqual(await posts.get(tx, { skill }), {
        text: `hello`,
      });
      assert.equal(mockTx.get.mock.callCount(), 1);
      assert.deepEqual(mockTx.get.mock.calls[0]?.arguments, [`foo/${skillId}`]);

      mockTx.get.mock.resetCalls();
      mockTx.set.mock.resetCalls();
    }
  });

  void test(`enum`, async (t) => {
    enum Colors {
      RED,
      BLUE,
    }

    const posts = rizzle.schema(`foo/[id]`, {
      id: rizzle.string(),
      color: rizzle.enum(Colors, {
        [Colors.RED]: `r`,
        [Colors.BLUE]: `b`,
      }),
    });

    const { mockTx, tx } = makeMockTx(t);

    // Marshal and unmarshal round tripping
    for (const color of [Colors.BLUE, Colors.RED]) {
      await posts.set(tx, { id: `1` }, { color });
      const [, marshaledData] = mockTx.set.mock.calls[0]!.arguments;
      mockTx.get.mock.mockImplementationOnce(() =>
        Promise.resolve(marshaledData as object),
      );
      // Make sure the enum isn't just being marshaled to its runtime value,
      // these are too easily to change accidentally so instead there should be
      // a separate explicit marshaled value.
      assert.notEqual(Object.values(marshaledData as object), [color]);
      assert.deepStrictEqual(await posts.get(tx, { id: `1` }), {
        color,
      });

      mockTx.get.mock.resetCalls();
      mockTx.set.mock.resetCalls();
    }
  });

  void test(`object`, async (t) => {
    const posts = rizzle.schema(`foo/[id]`, {
      id: rizzle.string(),
      author: rizzle.object({
        name: rizzle.string(),
        email: rizzle.string(`e`),
      }),
    });

    const { mockTx, tx } = makeMockTx(t);

    // Marshal and unmarshal round tripping
    await posts.set(tx, { id: `1` }, { author: { name: `foo`, email: `f@o` } });
    const [, marshaledData] = mockTx.set.mock.calls[0]!.arguments;
    assert.deepEqual(marshaledData, { author: { name: `foo`, e: `f@o` } });

    mockTx.get.mock.mockImplementationOnce(() =>
      Promise.resolve(marshaledData as object),
    );
    assert.deepStrictEqual(await posts.get(tx, { id: `1` }), {
      author: { name: `foo`, email: `f@o` },
    });

    mockTx.get.mock.resetCalls();
    mockTx.set.mock.resetCalls();
  });

  void test(`object()`, async (t) => {
    const posts = rizzle.schema(`foo/[id]`, {
      id: rizzle.string(),
      author: rizzle.object({
        name: rizzle.string(),
      }),
    });

    const { mockTx, tx } = makeMockTx(t);

    // Marshal and unmarshal round tripping
    await posts.set(tx, { id: `1` }, { author: { name: `foo` } });
    const [, marshaledData] = mockTx.set.mock.calls[0]!.arguments;
    assert.deepEqual(marshaledData, { author: { name: `foo` } });

    mockTx.get.mock.mockImplementationOnce(() =>
      Promise.resolve(marshaledData as object),
    );
    assert.deepStrictEqual(await posts.get(tx, { id: `1` }), {
      author: { name: `foo` },
    });

    mockTx.get.mock.resetCalls();
    mockTx.set.mock.resetCalls();
  });

  void test(`object indexes`, () => {
    {
      const posts = rizzle.schema(`foo/[id]`, {
        id: rizzle.string(),
        author: rizzle.object({
          name: rizzle.string().indexed(`byAuthorName`),
        }),
      });

      assert.deepEqual(posts.valueCodec._getIndexes(), {
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

    {
      const posts = rizzle.schema(`foo/[id]`, {
        id: rizzle.string(),
        author: rizzle
          .object({
            name: rizzle.string().alias(`n`).indexed(`byAuthorName`),
          })
          .alias(`a`),
      });
      assert.deepEqual(posts.getIndexes(), {
        byAuthorName: {
          allowEmpty: false,
          prefix: `foo/`,
          jsonPointer: `/a/n`,
        },
      });
    }

    // await posts.scan.byAuthorName(tx, 20)

    // set(tx, { id: `1` }, { author: { name: `foo`, email: `f@o` } });
    // const [, marshaledData] = mockTx.set.mock.calls[0]!.arguments;
    // assert.deepEqual(marshaledData, { author: { name: `foo`, e: `f@o` } });

    // mockTx.get.mock.mockImplementationOnce(() =>
    //   Promise.resolve(marshaledData as object),
    // );
    // assert.deepStrictEqual(await posts.get(tx, { id: `1` }), {
    //   author: { name: `foo`, email: `f@o` },
    // });
  });

  void test(`number`, async (t) => {
    const posts = rizzle.schema(`foo/[id]`, {
      id: rizzle.string(),
      count: rizzle.number(`c`),
    });

    const { mockTx, tx } = makeMockTx(t);

    // Marshal and unmarshal round tripping
    await posts.set(tx, { id: `1` }, { count: 5 });
    const [, marshaledData] = mockTx.set.mock.calls[0]!.arguments;
    assert.deepEqual(marshaledData, { c: 5 });

    mockTx.get.mock.mockImplementationOnce(() =>
      Promise.resolve(marshaledData as object),
    );
    assert.deepStrictEqual(await posts.get(tx, { id: `1` }), {
      count: 5,
    });

    mockTx.get.mock.resetCalls();
    mockTx.set.mock.resetCalls();
  });

  void suite.skip(`static type checks`, () => {
    void test(`RizzleObjectInput / RizzleObjectOutput`, () => {
      {
        const rawShape = null as unknown as {
          id: RizzlePrimitive<string, string>;
          date: RizzlePrimitive<Date, string>;
        };

        true satisfies AssertEqual<
          RizzleObjectInput<typeof rawShape>,
          { id: string; date: Date }
        >;

        true satisfies AssertEqual<
          RizzleObjectOutput<typeof rawShape>,
          { id: string; date: string }
        >;

        {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const obj = rizzle.object(rawShape);
          true satisfies AssertEqual<
            (typeof obj)[`_input`],
            { id: string; date: Date }
          >;
          true satisfies AssertEqual<
            (typeof obj)[`_output`],
            { id: string; date: string }
          >;
        }
      }
    });

    void test(`object() string key and value`, async () => {
      const posts = rizzle.schema(`foo/[id]`, {
        id: rizzle.string(),
        name: rizzle.string(),
      });

      const rtx = null as unknown as ReadTransaction;
      const wtx = null as unknown as WriteTransaction;

      // .get()
      void posts.get(rtx, { id: `1` });
      // @ts-expect-error `id` is the key, not `name`
      void posts.get(rtx, { name: `1` });
      {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const post = await posts.get(rtx, { id: `1` });
        true satisfies AssertEqual<typeof post, { name: string } | undefined>;
      }

      // .set()
      void posts.set(wtx, { id: `1` }, { name: `foo` });
      // @ts-expect-error `id` is the key, not `name`
      void posts.set(wtx, { name: `1` }, { name: `foo` });
    });

    void test(`string key and value`, async () => {
      const posts = rizzle.schema(`foo/[id]`, {
        id: rizzle.string(),
        name: rizzle.string(),
      });

      const rtx = null as unknown as ReadTransaction;
      const wtx = null as unknown as WriteTransaction;

      // .get()
      void posts.get(rtx, { id: `1` });
      // @ts-expect-error `id` is the key, not `name`
      void posts.get(rtx, { name: `1` });
      {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const post = await posts.get(rtx, { id: `1` });
        true satisfies AssertEqual<typeof post, { name: string } | undefined>;
      }

      // .set()
      void posts.set(wtx, { id: `1` }, { name: `foo` });
      // @ts-expect-error `id` is the key, not `name`
      void posts.set(wtx, { name: `1` }, { name: `foo` });
    });

    void test(`object`, async () => {
      const tx = null as unknown as WriteTransaction;
      const posts = rizzle.schema(`foo/[id]`, {
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const post = await posts.get(tx, { id: `1` });
        true satisfies AssertEqual<
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

    void test(`object with aliases`, async () => {
      const tx = null as unknown as WriteTransaction;
      const posts = rizzle.schema(`foo/[id]`, {
        id: rizzle.string(),
        author: rizzle.object({
          name: rizzle.string(`n`),
        }),
      });

      // .get()
      void posts.get(tx, { id: `1` });
      // @ts-expect-error `id` is the key, not `name`
      void posts.get(tx, { name: `1` });
      {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const post = await posts.get(tx, { id: `1` });
        true satisfies AssertEqual<
          typeof post,
          { author: { name: string } } | undefined
        >;
      }

      // .set()
      void posts.set(tx, { id: `1` }, { author: { name: `foo` } });
      // @ts-expect-error `id` is the key, not `name`
      void posts.set(tx, { name: `1` }, { author: { id: `foo` } });
    });
  });
});

void test(keyPathVariableNames.name, () => {
  assert.deepStrictEqual(keyPathVariableNames(`foo/[id]`), [`id`]);
  assert.deepStrictEqual(keyPathVariableNames(`foo/[id]/[bar]`), [`id`, `bar`]);
});
