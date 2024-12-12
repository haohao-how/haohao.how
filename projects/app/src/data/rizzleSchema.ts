import { Rating } from "@/util/fsrs";
import memoize from "lodash/memoize";
import { z } from "zod";
import { MarshaledSkillId } from "./marshal";
import { Skill, SkillType, SrsType } from "./model";
import { invalid, r, RizzlePrimitive } from "./rizzle";

export const rSkillType = r.enum(SkillType, {
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
});

export const rFsrsRating = r.enum(Rating, {
  [Rating.Again]: `1`,
  [Rating.Hard]: `2`,
  [Rating.Good]: `3`,
  [Rating.Easy]: `4`,
});

export const rSkillId = memoize(() =>
  RizzlePrimitive.create(
    z.custom<Skill | MarshaledSkillId>().transform((x) => {
      if (typeof x === `string`) {
        return x;
      }

      const skillTypeM = rSkillType.getMarshal().parse(x.type);
      switch (x.type) {
        // Radical skills
        case SkillType.RadicalToEnglish:
        case SkillType.EnglishToRadical:
          return `${skillTypeM}:${x.hanzi}:${x.name}` as MarshaledSkillId;
        case SkillType.RadicalToPinyin:
        case SkillType.PinyinToRadical:
          return `${skillTypeM}:${x.hanzi}:${x.pinyin}` as MarshaledSkillId;
        // Hanzi skills
        case SkillType.HanziWordToEnglish:
        case SkillType.HanziWordToPinyinInitial:
        case SkillType.HanziWordToPinyinFinal:
        case SkillType.HanziWordToPinyinTone:
        case SkillType.EnglishToHanzi:
        case SkillType.PinyinToHanzi:
        case SkillType.ImageToHanzi:
          return `${skillTypeM}:${x.hanzi}` as MarshaledSkillId;
      }
    }),
    z.string().transform((x, ctx): Skill => {
      const result = /^(.+?):(.+)$/.exec(x);
      if (result === null) {
        return invalid(ctx, `doesn't match *:* pattern`);
      }

      const [, marshaledSkillType, rest] = result;
      if (marshaledSkillType == null) {
        return invalid(ctx, `couldn't parse skill type (before :)`);
      }
      if (rest == null) {
        return invalid(ctx, `couldn't parse skill params (after :)`);
      }

      const skillType_ = rSkillType.getUnmarshal().parse(marshaledSkillType);

      switch (skillType_) {
        case SkillType.RadicalToEnglish:
        case SkillType.EnglishToRadical: {
          const result = /^(.+):(.+)$/.exec(rest);
          if (result == null) {
            return invalid(ctx, `couldn't parse ${marshaledSkillType}: params`);
          }
          const [, hanzi, name] = result;
          if (hanzi == null) {
            return invalid(ctx, `couldn't parse ${marshaledSkillType}: hanzi`);
          }
          if (name == null) {
            return invalid(ctx, `couldn't parse ${marshaledSkillType}: name`);
          }
          return { type: skillType_, hanzi, name };
        }
        case SkillType.RadicalToPinyin:
        case SkillType.PinyinToRadical: {
          const result = /^(.+):(.+)$/.exec(rest);
          if (result == null) {
            return invalid(ctx, `couldn't parse ${marshaledSkillType}: params`);
          }
          const [, hanzi, pinyin] = result;
          if (hanzi == null) {
            return invalid(ctx, `couldn't parse ${marshaledSkillType}: hanzi`);
          }
          if (pinyin == null) {
            return invalid(ctx, `couldn't parse ${marshaledSkillType}: pinyin`);
          }
          return { type: skillType_, hanzi, pinyin };
        }
        case SkillType.HanziWordToEnglish:
        case SkillType.HanziWordToPinyinInitial:
        case SkillType.HanziWordToPinyinFinal:
        case SkillType.HanziWordToPinyinTone:
        case SkillType.EnglishToHanzi:
        case SkillType.PinyinToHanzi:
        case SkillType.ImageToHanzi:
          return { type: skillType_, hanzi: rest };
      }
    }),
  ),
);

const rSrsType = memoize(() =>
  r.enum(SrsType, {
    [SrsType.Null]: `0`,
    [SrsType.FsrsFourPointFive]: `1`,
  }),
);

const rSrsState = memoize(
  () =>
    // r.discriminatedUnion(`type`, [
    //   r.object({
    //     type: r.literal(SrsType.Null),
    //   }),
    r.object({
      type: r.literal(SrsType.FsrsFourPointFive, rSrsType()),
      stability: r.number(),
      difficulty: r.number(),
    }),
  // ]),
);

// export const counter = keyValue(`counter`, {
// TODO: doesn't support non-object keys.
// });

export const skillReview = r.keyValue(`sr/[skill]/[when]`, {
  skill: rSkillId(),
  when: r.datetime(),

  rating: rFsrsRating.alias(`r`),
});

export const skillState = r.keyValue(`s/[skill]`, {
  skill: rSkillId(),

  created: r.timestamp().alias(`c`),
  srs: rSrsState().nullable().alias(`s`),
  due: r.timestamp().alias(`d`).indexed(`byDue`),
});

export const addSkillState = r.mutator({
  skill: rSkillId().alias(`s`),
  now: r.timestamp().alias(`n`),
});

export const schema = { skillReview, skillState, addSkillState };

// export const pinyinInitialAssociation = rizzle.keyValue(`pi/[initial]`, {
//   initial: rizzle.string(),
//   name: rizzle.string().alias(`n`),
// });
