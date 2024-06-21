import type z from "zod";

export enum SrsType {
  Null,
  FsrsFourPointFive,
}

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
  HanziWordToEnglish,
  HanziWordToPinyinInitial,
  HanziWordToPinyinFinal,
  HanziWordToPinyinTone,
  EnglishToHanzi,
  PinyinToHanzi,
  ImageToHanzi,
}

// export type HanziKeyedSkill = z.infer<typeof hanziKeyedSkillSchema>;

export interface HanziKeyedSkill {
  type: SkillType;
  hanzi: string;
}

export type Skill = HanziKeyedSkill;

export type SkillKey = string & z.BRAND<"SkillKey">;

export enum QuestionFlag {
  WeakWord,
}

export enum QuestionType {
  MultipleChoice,
  OneCorrectPair,
}

export interface MultipleChoiceQuestion {
  type: QuestionType.MultipleChoice;
  prompt: string;
  answer: string;
  flag?: QuestionFlag;
  choices: readonly string[];
}

export interface OneCorrectPairQuestion {
  type: QuestionType.OneCorrectPair;
  prompt: string;
  groupA: readonly string[];
  groupB: readonly string[];
  answer: readonly [groupA: string, groupB: string];
  flag?: QuestionFlag;
  skill: Skill;
}

export type Question = MultipleChoiceQuestion | OneCorrectPairQuestion;
