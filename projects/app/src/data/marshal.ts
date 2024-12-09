import { iterTake } from "@/util/collections";
import { Rating } from "@/util/fsrs";
import { invariant } from "@haohaohow/lib/invariant";
import {
  IndexDefinitions,
  ReadonlyJSONValue,
  ReadTransaction,
} from "replicache";
import z from "zod";
import {
  Skill,
  SkillReview as SkillReviewValue,
  SkillState as SkillStateValue,
  SkillType,
  SrsState,
  SrsType,
} from "./model";

export type OpaqueJSON = ReadonlyJSONValue;

export type Timestamp = number;

//
// SrsType
//
const SrsTypeMarshal = {
  [SrsType.Null]: `0`,
  [SrsType.FsrsFourPointFive]: `1`,
} as const;
const SrsTypeUnmarshal = {
  [`0`]: SrsType.Null,
  [`1`]: SrsType.FsrsFourPointFive,
} as const;

//
// SrsState
//
const MarshaledSrsState = z
  .discriminatedUnion(`t`, [
    z.object({
      /** type */
      t: z.literal(SrsTypeMarshal[SrsType.Null]),
    }),
    z.object({
      /** type */
      t: z.literal(SrsTypeMarshal[SrsType.FsrsFourPointFive]),
      /** stability */
      s: z.number(),
      /** difficulty */
      d: z.number(),
    }),
  ])
  .nullable();
type MarshaledSrsState = z.infer<typeof MarshaledSrsState>;

const marshalSrsState = (x: SrsState | null): MarshaledSrsState => {
  switch (x?.type) {
    case undefined:
      return null;
    case SrsType.Null:
      return {
        t: SrsTypeMarshal[x.type],
      };
    case SrsType.FsrsFourPointFive:
      return {
        t: SrsTypeMarshal[x.type],
        s: x.stability,
        d: x.difficulty,
      };
  }
};

const unmarshalSrsState = (x: MarshaledSrsState): SrsState | null => {
  switch (x?.t) {
    case undefined:
      return null;
    case SrsTypeMarshal[SrsType.Null]:
      return {
        type: SrsTypeUnmarshal[x.t],
      };
    case SrsTypeMarshal[SrsType.FsrsFourPointFive]:
      return {
        type: SrsTypeUnmarshal[x.t],
        stability: x.s,
        difficulty: x.d,
      };
  }
};

//
// SkillType
//
const SkillTypeMarshal = {
  [SkillType.RadicalToEnglish]: `re`,
  [SkillType.EnglishToRadical]: `er`,
  [SkillType.RadicalToPinyin]: `rp`,
  [SkillType.PinyinToRadical]: `pr`,
  [SkillType.HanziWordToEnglish]: `he`,
  [SkillType.HanziWordToPinyinInitial]: `hpi`,
  [SkillType.HanziWordToPinyinFinal]: `hpf`,
  [SkillType.HanziWordToPinyinTone]: `hpt`,
  [SkillType.EnglishToHanzi]: `eh`,
  [SkillType.PinyinToHanzi]: `ph`,
  [SkillType.ImageToHanzi]: `ih`,
} as const;
const SkillTypeUnmarshal = {
  [SkillTypeMarshal[SkillType.RadicalToEnglish]]: SkillType.RadicalToEnglish,
  [SkillTypeMarshal[SkillType.EnglishToRadical]]: SkillType.EnglishToRadical,
  [SkillTypeMarshal[SkillType.RadicalToPinyin]]: SkillType.RadicalToPinyin,
  [SkillTypeMarshal[SkillType.PinyinToRadical]]: SkillType.PinyinToRadical,
  [SkillTypeMarshal[SkillType.HanziWordToEnglish]]:
    SkillType.HanziWordToEnglish,
  [SkillTypeMarshal[SkillType.HanziWordToPinyinInitial]]:
    SkillType.HanziWordToPinyinInitial,
  [SkillTypeMarshal[SkillType.HanziWordToPinyinFinal]]:
    SkillType.HanziWordToPinyinFinal,
  [SkillTypeMarshal[SkillType.HanziWordToPinyinTone]]:
    SkillType.HanziWordToPinyinTone,
  [SkillTypeMarshal[SkillType.EnglishToHanzi]]: SkillType.EnglishToHanzi,
  [SkillTypeMarshal[SkillType.PinyinToHanzi]]: SkillType.PinyinToHanzi,
  [SkillTypeMarshal[SkillType.ImageToHanzi]]: SkillType.ImageToHanzi,
} as const;

const MarshaledSkillType = z.enum(
  Object.keys(SkillTypeUnmarshal) as [keyof typeof SkillTypeUnmarshal],
);

//
// Skill
//
const MarshaledSkillStateValue = z.object({
  /** created */
  c: z.string().datetime(),
  /** srs */
  s: MarshaledSrsState,
  /** due */
  d: z.string().datetime(),
});
export type MarshaledSkillStateValue = z.infer<typeof MarshaledSkillStateValue>;

export type MarshaledSkillStateValueJsonPath =
  `/${keyof MarshaledSkillStateValue}`;

export const marshalSkillStateValue = (
  x: SkillStateValue,
): MarshaledSkillStateValue => ({
  c: x.created.toISOString(),
  s: marshalSrsState(x.srs),
  d: x.due.toISOString(),
});

export const unmarshalSkillStateValue = (
  v: MarshaledSkillStateValue,
): SkillStateValue => ({
  created: z.coerce.date().parse(v.c),
  srs: unmarshalSrsState(v.s),
  due: z.coerce.date().parse(v.d),
});

//
// Skill Review
//
const MarshaledSkillReviewValue = z.object({
  /** rating */
  r: z.nativeEnum(Rating),
});
export type MarshaledSkillReviewValue = z.infer<
  typeof MarshaledSkillReviewValue
>;

export const marshalSkillReviewValue = (
  x: SkillReviewValue,
): MarshaledSkillReviewValue => ({
  r: x.rating,
});

export const unmarshalSkillReviewValue = (
  v: MarshaledSkillReviewValue,
): SkillReviewValue => ({
  rating: v.r,
});

//
// Public API, these don't expose the compressed shape in their types so the
// implementation shouldn't leak into the rest of the code.
//

// Skill State
export const unmarshalSkillStateJson = ([key, value]: readonly [
  key: string,
  value: OpaqueJSON,
]): [Skill, SkillStateValue] => [
  unmarshalSkillStateKey(key),
  MarshaledSkillStateValue.transform(unmarshalSkillStateValue).parse(value),
];
export const marshalSkillStateJson = ([skill, state]: readonly [
  Skill,
  SkillStateValue,
]) =>
  [
    marshalSkillStateKey(skill),
    marshalSkillStateValue(state) as OpaqueJSON,
  ] as const;

//
// Skill Review (`sr/${skillId}/${nowTimestamp}`)
//
export type SkillReviewKey = [Skill, Date];
export const unmarshalSkillReviewJson = ([key, value]: readonly [
  key: string,
  value: OpaqueJSON,
]): [SkillReviewKey, SkillReviewValue] => [
  unmarshalSkillReviewKey(key),
  MarshaledSkillReviewValue.transform(unmarshalSkillReviewValue).parse(value),
];
export const marshalSkillReviewJson = ([[skillId, timestamp], state]: readonly [
  SkillReviewKey,
  SkillReviewValue,
]) =>
  [
    marshalSkillReviewKey(skillId, timestamp),
    marshalSkillReviewValue(state) as OpaqueJSON,
  ] as const;
export const skillReviewPrefix = `sr/`;
export const marshalSkillReviewKey = (
  skill: Skill | MarshaledSkillId,
  date: Date | Timestamp,
): MarshaledSkillReviewKey => {
  return `${skillReviewPrefix}${marshalSkillId(skill)}/${typeof date === `number` ? date : date.getTime()}` as MarshaledSkillReviewKey;
};
export const unmarshalSkillReviewKey = (x: string): [Skill, Date] => {
  const result = /^sr\/(.+)\/(.+)$/.exec(x);
  invariant(result !== null);
  const [, skillId, timestamp] = result;
  invariant(skillId !== undefined);
  invariant(timestamp !== undefined);
  return [
    unmarshalSkillId(skillId),
    new Date(z.coerce.number().parse(timestamp)),
  ];
};

//
// SrsState
//
export const unmarshalSrsStateJson = (value: OpaqueJSON): SrsState | null =>
  MarshaledSrsState.transform(unmarshalSrsState).parse(value);
export const marshalSrsStateJson = (x: SrsState | null) =>
  marshalSrsState(x) as OpaqueJSON;

// Skill ID e.g. `he:好`
export type MarshaledSkillId = string & z.BRAND<`SkillId`>;

export const skillStatePrefix = `s/`;

export const marshalSkillId = (x: Skill | MarshaledSkillId) => {
  if (typeof x === `string`) {
    return x;
  }
  switch (x.type) {
    // Radical skills
    case SkillType.RadicalToEnglish:
    case SkillType.EnglishToRadical:
      return `${SkillTypeMarshal[x.type]}:${x.hanzi}:${x.name}` as MarshaledSkillId;
    case SkillType.RadicalToPinyin:
    case SkillType.PinyinToRadical:
      return `${SkillTypeMarshal[x.type]}:${x.hanzi}:${x.pinyin}` as MarshaledSkillId;
    // Hanzi skills
    case SkillType.HanziWordToEnglish:
    case SkillType.HanziWordToPinyinInitial:
    case SkillType.HanziWordToPinyinFinal:
    case SkillType.HanziWordToPinyinTone:
    case SkillType.EnglishToHanzi:
    case SkillType.PinyinToHanzi:
    case SkillType.ImageToHanzi:
      return `${SkillTypeMarshal[x.type]}:${x.hanzi}` as MarshaledSkillId;
  }
};

export const unmarshalSkillId = (x: string): Skill => {
  const result = /^(.+?):(.+)$/.exec(x);
  invariant(result !== null);
  const [, marshaledSkillType, rest] = result;
  invariant(marshaledSkillType !== undefined);
  invariant(rest !== undefined);

  const skillType =
    SkillTypeUnmarshal[MarshaledSkillType.parse(marshaledSkillType)];

  switch (skillType) {
    case SkillType.RadicalToEnglish:
    case SkillType.EnglishToRadical: {
      const result = /^(.+):(.+)$/.exec(rest);
      invariant(result !== null);
      const [, hanzi, name] = result;
      invariant(hanzi !== undefined);
      invariant(name !== undefined);
      return { type: skillType, hanzi, name };
    }
    case SkillType.RadicalToPinyin:
    case SkillType.PinyinToRadical: {
      const result = /^(.+):(.+)$/.exec(rest);
      invariant(result !== null);
      const [, hanzi, pinyin] = result;
      invariant(hanzi !== undefined);
      invariant(pinyin !== undefined);
      return { type: skillType, hanzi, pinyin };
    }
    case SkillType.HanziWordToEnglish:
    case SkillType.HanziWordToPinyinInitial:
    case SkillType.HanziWordToPinyinFinal:
    case SkillType.HanziWordToPinyinTone:
    case SkillType.EnglishToHanzi:
    case SkillType.PinyinToHanzi:
    case SkillType.ImageToHanzi:
      return { type: skillType, hanzi: rest };
  }
};
export type MarshaledSkillReviewKey = string & z.BRAND<`SkillReviewKey`>;

// Skill state key e.g. `s/he:好`
export type MarshaledSkillStateKey = string & z.BRAND<`SkillStateKey`>;

export const marshalSkillStateKey = (x: Skill | MarshaledSkillId) => {
  return `${skillStatePrefix}${marshalSkillId(x)}` as MarshaledSkillStateKey;
};

export const unmarshalSkillStateKey = (x: string): Skill => {
  const result = /^s\/(.+)$/.exec(x);
  invariant(result !== null);
  const [, skillId] = result;
  invariant(skillId !== undefined);
  return unmarshalSkillId(skillId);
};

export enum IndexName {
  Null = `Null`,
  SkillStateByDue = `SkillStateByDue`,
}

// export const setPinyinInitialAssociation = rizzle.mutator(
//   `spia`,
//   {
//     initial: rizzle.string().alias(`i`),
//     name: rizzle.string().alias(`n`),
//   },
//   async (tx, { initial, name }) => {
//     const quantity = options?.quantity ?? 1;
//     const counter = await pinyinInitialAssociation.set(
//       tx,
//       { initial },
//       { name },
//     );
//   },
// );

// setPinyinInitialAssociation();

export const indexes = {
  [IndexName.Null]: {
    allowEmpty: true,
    prefix: `///`,
    jsonPointer: `/d` satisfies MarshaledSkillStateValueJsonPath,
  },
  [IndexName.SkillStateByDue]: {
    allowEmpty: false,
    prefix: skillStatePrefix,
    jsonPointer: `/d` satisfies MarshaledSkillStateValueJsonPath,
  },
} satisfies IndexDefinitions;

export const indexUnmarshalers = {
  [IndexName.Null]: () => null,
  [IndexName.SkillStateByDue]: unmarshalSkillStateJson,
};

export async function indexScan<
  I extends IndexName,
  Unmarshaled = ReturnType<(typeof indexUnmarshalers)[I]>,
>(tx: ReadTransaction, indexName: I, limit?: number): Promise<Unmarshaled[]> {
  // Work around https://github.com/rocicorp/replicache/issues/1039
  const iter = tx.scan({ indexName }).entries();
  const results =
    limit != null ? await iterTake(iter, limit) : await iter.toArray();
  const unmarshal = indexUnmarshalers[indexName];

  return (
    results
      // Strip off the secondary key, put it back in the normal "no index" mode
      // of [key, value].
      .map(([[, key], value]) => unmarshal([key, value]) as Unmarshaled)
  );
}

export async function* legacyIndexScanIter<
  I extends IndexName,
  Unmarshaled = ReturnType<(typeof indexUnmarshalers)[I]>,
>(tx: ReadTransaction, indexName: I): AsyncGenerator<Unmarshaled> {
  // HACK: convoluted workaround to fix a bug in Safari where the transaction
  // would be prematurely closed with:
  //
  // > InvalidStateError: Failed to execute 'objectStore' on 'IDBTransaction':
  // > The transaction finished.
  //
  // See also https://github.com/rocicorp/replicache/issues/486
  //
  // This approach synchronously loads a page of results at a time and then
  // releases the transaction. This is not ideal, but seems better than using
  // `.toArray()` which doesn't honor `limit` when using an index, so it would
  // load the entire index at a time (see
  // https://github.com/rocicorp/replicache/issues/1039).

  const unmarshal = indexUnmarshalers[indexName];
  const pageSize = 50;
  let page: [string, ReadonlyJSONValue][];
  let startKey: string | undefined;

  do {
    page = [];

    for await (const [[indexKey, key], value] of tx
      .scan({
        indexName,
        start:
          startKey != null ? { key: startKey, exclusive: true } : undefined,
      })
      .entries()) {
      startKey = indexKey;
      page.push([key, value]);
      if (page.length === pageSize) {
        break;
      }
    }

    for (const kv of page) {
      yield unmarshal(kv) as Unmarshaled;
    }
  } while (page.length > 0);
}

export async function* indexScanIter<K, V>(
  tx: ReadTransaction,
  indexName: string,
  unmarshalKey: (v: string) => K,
  unmarshalValue: (k: unknown) => V,
): AsyncGenerator<[K, V]> {
  // HACK: convoluted workaround to fix a bug in Safari where the transaction
  // would be prematurely closed with:
  //
  // > InvalidStateError: Failed to execute 'objectStore' on 'IDBTransaction':
  // > The transaction finished.
  //
  // See also https://github.com/rocicorp/replicache/issues/486
  //
  // This approach synchronously loads a page of results at a time and then
  // releases the transaction. This is not ideal, but seems better than using
  // `.toArray()` which doesn't honor `limit` when using an index, so it would
  // load the entire index at a time (see
  // https://github.com/rocicorp/replicache/issues/1039).

  const pageSize = 50;
  let page: [string, ReadonlyJSONValue][];
  let startKey: string | undefined;

  do {
    page = [];
    for await (const [[indexKey, key], value] of tx
      .scan({
        indexName,
        start:
          startKey != null ? { key: startKey, exclusive: true } : undefined,
      })
      .entries()) {
      startKey = indexKey;
      page.push([key, value]);
      if (page.length === pageSize) {
        break;
      }
    }

    for (const [k, v] of page) {
      yield [unmarshalKey(k), unmarshalValue(v)] as const;
    }
  } while (page.length > 0);
}
