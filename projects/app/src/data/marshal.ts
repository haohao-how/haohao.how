import { iterTake } from "@/util/collections";
import { invariant } from "@haohaohow/lib/invariant";
import {
  IndexDefinitions,
  ReadonlyJSONValue,
  ReadTransaction,
} from "replicache";
import z from "zod";
import {
  Skill,
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
// Public API, these don't expose the compressed shape in their types so the
// implementation shouldn't leak into the rest of the code.
//

// Skill
export const unmarshalSkillStateJson = ([key, value]: readonly [
  key: string,
  value: OpaqueJSON,
]): [Skill, SkillStateValue] => [
  parseSkillStateKey(key),
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

// SrsState
export const unmarshalSrsStateJson = (value: OpaqueJSON): SrsState | null =>
  MarshaledSrsState.transform(unmarshalSrsState).parse(value);
export const marshalSrsStateJson = (x: SrsState | null) =>
  marshalSrsState(x) as OpaqueJSON;

// Skill ID e.g. `he:好`
export type MarshaledSkillId = string & z.BRAND<`SkillId`>;

// Skill state key e.g. `s/he:好`
export type MarshaledSkillStateKey = string & z.BRAND<`SkillStateKey`>;

export const marshalSkillId = (x: Skill) =>
  `${SkillTypeMarshal[x.type]}:${x.hanzi}` as MarshaledSkillId;

export const marshalSkillStateKey = (x: Skill | MarshaledSkillId) => {
  const id = typeof x === `string` ? x : marshalSkillId(x);
  return `${skillStatePrefix}${id}` as MarshaledSkillStateKey;
};

export const skillStatePrefix = `s/`;

export const parseSkillStateKey = (x: string): Skill => {
  const result = x.match(/^s\/(.+)$/);
  invariant(result !== null);
  const [, skillId] = result;
  invariant(skillId !== undefined);
  return parseSkillId(skillId);
};

export const parseSkillId = (x: string): Skill => {
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
  const results = limit ? await iterTake(iter, limit) : await iter.toArray();
  const unmarshal = indexUnmarshalers[indexName];

  return (
    results
      // Strip off the secondary key, put it back in the normal "no index" mode
      // of [key, value].
      .map(([[, key], value]) => unmarshal([key, value]) as Unmarshaled)
  );
}
