import { invariant } from "@/util/invariant";
import { ReadonlyJSONValue } from "replicache";
import z from "zod";
import {
  HanziKeyedSkill,
  Review,
  SkillKey,
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
const MarshaledSrsState = z.discriminatedUnion(`t`, [
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
]);
type MarshaledSrsState = z.infer<typeof MarshaledSrsState>;

const marshalSrsState = (x: SrsState): MarshaledSrsState => {
  switch (x.type) {
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

const unmarshalSrsState = (x: MarshaledSrsState): SrsState => {
  switch (x.t) {
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
// Review
//
const MarshaledReview = z.object({
  /** created */
  c: z.string().datetime(),
  /** srs */
  s: MarshaledSrsState,
  /** difficulty */
  d: z.string().datetime(),
});
type MarshaledReview = z.infer<typeof MarshaledReview>;

const marshalReview = (x: Review): MarshaledReview => ({
  c: x.created.toISOString(),
  s: marshalSrsState(x.srs),
  d: x.due.toISOString(),
});

const unmarshalReview = (x: MarshaledReview): Review => ({
  created: z.coerce.date().parse(x.c),
  srs: unmarshalSrsState(x.s),
  due: z.coerce.date().parse(x.d),
});

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
// Public API, these don't expose the compressed shape in their types so the
// implementation shouldn't leak into the rest of the code.
//

// Review
export const unmarshalReviewJson = (value: OpaqueJSON): Review =>
  MarshaledReview.transform(unmarshalReview).parse(value);
export const marshalReviewJson = (x: Review) => marshalReview(x) as OpaqueJSON;

// SrsState
export const unmarshalSrsStateJson = (value: OpaqueJSON): SrsState =>
  MarshaledSrsState.transform(unmarshalSrsState).parse(value);
export const marshalSrsStateJson = (x: SrsState) =>
  marshalSrsState(x) as OpaqueJSON;

// Skill key
export const hanziKeyedSkillToKey = (x: HanziKeyedSkill) =>
  `/s/${SkillTypeMarshal[x.type]}/${x.hanzi}` as SkillKey;

export const parseHanziKeyedSkillKey = (x: string) => {
  const result = x.match(/^\/s\/([^\/]+)\/([^\/]+)$/);
  invariant(result !== null);
  const [, rawType, rawHanzi] = result;
  invariant(rawType !== undefined);
  invariant(rawHanzi !== undefined);
  return {
    type: SkillTypeUnmarshal[MarshaledSkillType.parse(rawType)],
    hanzi: rawHanzi,
  };
};
