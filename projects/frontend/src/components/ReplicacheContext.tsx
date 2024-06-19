import { wordLookupByWord } from "@/data/words";
import { replicacheLicenseKey } from "@/env";
import { Rating, UpcomingReview, nextReview } from "@/util/fsrs";
import { invariant } from "@/util/invariant";
import { createContext, useContext, useMemo } from "react";
import type { MutatorDefs, WriteTransaction } from "replicache";
import { Replicache } from "replicache";
import z from "zod";
import { DeckItem, QuizDeckItemType } from "./QuizDeck";
import { experimentalCreateKVStore } from "./replicacheOptions";

interface M extends MutatorDefs {
  incrementCounter(
    tx: WriteTransaction,
    options?: { quantity?: number },
  ): Promise<void>;
  addSkill(tx: WriteTransaction, options: { skill: Skill }): Promise<void>;
  updateSkill(
    tx: WriteTransaction,
    options: { skill: Skill; rating: Rating },
  ): Promise<void>;
}

const ReplicacheContext = createContext<Replicache<M> | null>(null);

export function ReplicacheProvider({ children }: React.PropsWithChildren) {
  const rep = useMemo(
    () =>
      new Replicache<M>({
        name: "hao",
        licenseKey: replicacheLicenseKey,
        pushURL: `/api/push`,
        pullURL: `/api/pull`,
        experimentalCreateKVStore: experimentalCreateKVStore,
        mutators: {
          async incrementCounter(tx, options) {
            const quantity = options?.quantity ?? 1;
            const counter = await tx.get<number>("counter");
            await tx.set("counter", (counter ?? 0) + quantity);
          },
          async addSkill(tx, { skill }) {
            const key = hanziKeyedSkillDescriptorToId(skill);
            const s = nextReview(null, Rating.Again);
            await tx.set(
              key,
              encodeReview({
                created: new Date(),
                srs: {
                  type: SrsType.FsrsFourPointFive,
                  stability: s.stability,
                  difficulty: s.difficulty,
                },
                due: s.due,
              }),
            );
          },
          async updateSkill(tx, { skill, rating }) {
            const key = hanziKeyedSkillDescriptorToId(skill);
            const lastReviewRaw = await tx.get(key);
            const lastReview =
              lastReviewRaw !== undefined
                ? decodeCompactReview(compactReviewSchema.parse(lastReviewRaw))
                : null;
            const lastUpcomingReview =
              lastReview?.srs.type !== SrsType.FsrsFourPointFive
                ? null
                : ({
                    created: lastReview.created,
                    stability: lastReview.srs.stability,
                    difficulty: lastReview.srs.difficulty,
                    due: lastReview.due,
                  } satisfies UpcomingReview);
            const s = nextReview(lastUpcomingReview, rating);
            // eslint-disable-next-line no-console
            console.log(`updating ${key} to `, s);
            await tx.set(
              key,
              encodeReview({
                created: new Date(),
                srs: {
                  type: SrsType.FsrsFourPointFive,
                  stability: s.stability,
                  difficulty: s.difficulty,
                },
                due: s.due,
              }),
            );
          },
        },
      }),
    [],
  );

  return (
    <ReplicacheContext.Provider value={rep}>
      {children}
    </ReplicacheContext.Provider>
  );
}

export function useReplicache() {
  return useContext(ReplicacheContext);
}

export enum SrsType {
  Null = "0",
  FsrsFourPointFive = "1",
}

export const srsTypeSchema = z.nativeEnum(SrsType);

export const compactSrsStateSchema = z.discriminatedUnion("t", [
  z.object({
    t: z.literal(srsTypeSchema.enum.Null),
  }),
  z.object({
    t: z.literal(srsTypeSchema.enum.FsrsFourPointFive),
    s: z.number(),
    d: z.number(),
  }),
]);

export type CompactSrsState = z.infer<typeof compactSrsStateSchema>;

export interface SrsNullState {
  type: SrsType.Null;
}

export interface SrsFourPointFiveState {
  type: SrsType.FsrsFourPointFive;
  stability: number;
  difficulty: number;
}

export type SrsState = SrsNullState | SrsFourPointFiveState;

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

export const compactReviewSchema = z.object({
  c: z.string().datetime(),
  s: compactSrsStateSchema,

  d: z.string().datetime(),
});

export type CompactReview = z.infer<typeof compactReviewSchema>;

export interface Review {
  created: Date;
  srs: SrsState;
  due: Date;
}

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

export const encodeReview = (x: Review): CompactReview => ({
  c: x.created.toISOString(),
  s: encodeSrsState(x.srs),
  d: x.due.toISOString(),
});

const skillUnscopedId = z.string().brand<"SkillUnscopedId">();
type SkillUnscopedId = z.infer<typeof skillUnscopedId>;

const skillId = z.string().brand<"SkillId">();
type SkillId = z.infer<typeof skillId>;

// generate a question to test a skill
export function generateQuestionForSkill(skill: Skill): DeckItem {
  switch (skill.type) {
    case SkillType.HanziWordToEnglish: {
      const english = wordLookupByWord.get(skill.hanzi);
      invariant(english !== undefined, "couldn't find an english translation");
      return {
        type: QuizDeckItemType.OneCorrectPair,
        // SingleHanziWordToEnglish,
        question: {
          prompt: "Translate this",
          groupA: [
            skill.hanzi, // TODO: 3 other items
            "x",
            "y",
            "z",
          ],
          groupB: [
            english.name,
            // TODO: 3 other items
            "xx",
            "yy",
            "zz",
          ],
          answer: [skill.hanzi, english.name],
        },
        skill,
      };
    }
    default:
      throw new Error("todo: not implemented");
  }
}

export enum SkillType {
  HanziWordToEnglish = "he",
  HanziWordToPinyinInitial = "hpi",
  HanziWordToPinyinFinal = "hpf",
  HanziWordToPinyinTone = "hpt",
  EnglishToHanzi = "eh",
  PinyinToHanzi = "ph",
  ImageToHanzi = "ih",
}

const skillTypeSchema = z.nativeEnum(SkillType);

const hanziKeyedSkillSchema = z.object({
  type: skillTypeSchema,
  hanzi: z.string(),
});

export type HanziKeyedSkill = z.infer<typeof hanziKeyedSkillSchema>;

export type Skill = HanziKeyedSkill;

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
