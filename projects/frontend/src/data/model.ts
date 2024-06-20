import z from "zod";

export enum SrsType {
  // TODO remove values, move to `codec`
  Null = "0",
  FsrsFourPointFive = "1",
}

export const srsTypeSchema = z.nativeEnum(SrsType);

export interface SrsNullState {
  type: SrsType.Null;
}

export interface SrsFourPointFiveState {
  type: SrsType.FsrsFourPointFive;
  stability: number;
  difficulty: number;
}

export type SrsState = SrsNullState | SrsFourPointFiveState;

export interface Review {
  created: Date;
  srs: SrsState;
  due: Date;
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

export type HanziKeyedSkill = z.infer<typeof hanziKeyedSkillSchema>;

export type Skill = HanziKeyedSkill;

export const skillTypeSchema = z.nativeEnum(SkillType);

export const hanziKeyedSkillSchema = z.object({
  type: skillTypeSchema,
  hanzi: z.string(),
});

export const skillUnscopedIdSchema = z.string().brand<"SkillUnscopedId">();
export type SkillUnscopedId = z.infer<typeof skillUnscopedIdSchema>;

export const skillIdSchema = z.string().brand<"SkillId">();
export type SkillId = z.infer<typeof skillIdSchema>;

export enum FourUpQuizFlag {
  WeakWord,
}

export interface MultipleChoiceQuestion {
  prompt: string;
  answer: string;
  flag?: FourUpQuizFlag;
  choices: readonly string[];
}

export enum QuizDeckItemType {
  MultipleChoice,
  OneCorrectPair,
}

export interface OneCorrectPairQuestion {
  prompt: string;
  groupA: readonly string[];
  groupB: readonly string[];
  answer: readonly [groupA: string, groupB: string];
}

export interface MultipleChoiceQuestionDeckItem {
  type: QuizDeckItemType.MultipleChoice;
  question: MultipleChoiceQuestion;
}

export interface OneCorrectPairQuestionDeckItem {
  type: QuizDeckItemType.OneCorrectPair;
  question: OneCorrectPairQuestion;
  skill: Skill;
}

export type DeckItem =
  | MultipleChoiceQuestionDeckItem
  | OneCorrectPairQuestionDeckItem;
