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
  [SkillType.HanziWordToEnglish]: `he`,
  [SkillType.HanziWordToPinyinInitial]: `hpi`,
  [SkillType.HanziWordToPinyinFinal]: `hpf`,
  [SkillType.HanziWordToPinyinTone]: `hpt`,
  [SkillType.EnglishToHanzi]: `eh`,
  [SkillType.PinyinToHanzi]: `ph`,
  [SkillType.ImageToHanzi]: `ih`,
} as const;
const SkillTypeUnmarshal = {
  [`he`]: SkillType.HanziWordToEnglish,
  [`hpi`]: SkillType.HanziWordToPinyinInitial,
  [`hpf`]: SkillType.HanziWordToPinyinFinal,
  [`hpt`]: SkillType.HanziWordToPinyinTone,
  [`eh`]: SkillType.EnglishToHanzi,
  [`ph`]: SkillType.PinyinToHanzi,
  [`ih`]: SkillType.ImageToHanzi,
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
  /** difficulty */
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
  const result = x.match(/^sr\/(.+)\/(.+)$/);
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

export const marshalSkillId = (x: Skill | MarshaledSkillId) =>
  typeof x === `string`
    ? x
    : (`${SkillTypeMarshal[x.type]}:${x.hanzi}` as MarshaledSkillId);

export const unmarshalSkillId = (x: string): Skill => {
  const result = x.match(/^(.+?):(.+)$/);
  invariant(result !== null);
  const [, marshaledSkillType, rest] = result;
  invariant(marshaledSkillType !== undefined);
  invariant(rest !== undefined);

  const skillType =
    SkillTypeUnmarshal[MarshaledSkillType.parse(marshaledSkillType)];
  return {
    type: skillType,
    hanzi: rest,
  };
};
export type MarshaledSkillReviewKey = string & z.BRAND<`SkillReviewKey`>;

// Skill state key e.g. `s/he:好`
export type MarshaledSkillStateKey = string & z.BRAND<`SkillStateKey`>;

export const marshalSkillStateKey = (x: Skill | MarshaledSkillId) => {
  return `${skillStatePrefix}${marshalSkillId(x)}` as MarshaledSkillStateKey;
};

export const unmarshalSkillStateKey = (x: string): Skill => {
  const result = x.match(/^s\/(.+)$/);
  invariant(result !== null);
  const [, skillId] = result;
  invariant(skillId !== undefined);
  return unmarshalSkillId(skillId);
};

export type Timestamp = number;

export enum IndexName {
  Null = `Null`,
  SkillStateByDue = `SkillStateByDue`,
}

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
