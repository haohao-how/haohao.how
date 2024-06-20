import { invariant } from "@/util/invariant";
import z from "zod";
import {
  HanziKeyedSkill,
  Review,
  SkillId,
  SkillUnscopedId,
  SrsState,
  SrsType,
  skillTypeSchema,
  srsTypeSchema,
} from "./model";

export const compactSrsStateSchema = z.discriminatedUnion("t", [
  z.object({
    t /* type */: z.literal(srsTypeSchema.enum.Null),
  }),
  z.object({
    t /* type */: z.literal(srsTypeSchema.enum.FsrsFourPointFive),
    s /* stability */: z.number(),
    d /* difficulty */: z.number(),
  }),
]);

export const compactReviewSchema = z.object({
  c /* created */: z.string().datetime(),
  s /* srs */: compactSrsStateSchema,

  d /* difficulty */: z.string().datetime(),
});

export type CompactReview = z.infer<typeof compactReviewSchema>;

export const decodeCompactReview = (x: CompactReview): Review => ({
  created: z.coerce.date().parse(x.c),
  srs: decodeCompactSrsState(x.s),
  due: z.coerce.date().parse(x.d),
});

export const encodeSrsState = (x: SrsState): CompactSrsState => {
  switch (x.type) {
    case SrsType.Null:
      return {
        t: x.type,
      };
    case SrsType.FsrsFourPointFive:
      return {
        t: x.type,
        s: x.stability,
        d: x.difficulty,
      };
  }
};

export type CompactSrsState = z.infer<typeof compactSrsStateSchema>;

export const decodeCompactSrsState = (x: CompactSrsState): SrsState => {
  switch (x.t) {
    case SrsType.Null:
      return {
        type: x.t,
      };
    case SrsType.FsrsFourPointFive:
      return {
        type: x.t,
        stability: x.s,
        difficulty: x.d,
      };
  }
};

export const encodeReview = (x: Review): CompactReview => ({
  c: x.created.toISOString(),
  s: encodeSrsState(x.srs),
  d: x.due.toISOString(),
});

const hanziKeyedSkillDescriptorToUnscopedId = (x: HanziKeyedSkill) =>
  `${x.type}/${x.hanzi}` as SkillUnscopedId;

export const hanziKeyedSkillDescriptorToId = (x: HanziKeyedSkill) =>
  `/s/${hanziKeyedSkillDescriptorToUnscopedId(x)}` as SkillId;

export const decodeHanziKeyedSkillKey = (x: string) => {
  const result = x.match(/^\/s\/([^\/]+)\/([^\/]+)$/);
  invariant(result !== null);
  const [, rawType, rawHanzi] = result;
  invariant(rawType !== undefined);
  invariant(rawHanzi !== undefined);
  return {
    type: skillTypeSchema.parse(rawType),
    hanzi: rawHanzi,
  };
};
