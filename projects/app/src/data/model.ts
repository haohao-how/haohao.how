import { Rating } from "@/util/fsrs";

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

// TODO: "SkillUpcomingReview" maybe?
export interface SkillState {
  // TODO: this shoudl be "last reviewed"
  created: Date;
  /** When null, it means it's never been reviewed. */
  srs: SrsState | null;
  due: Date;
}

export interface SkillReview {
  rating: Rating;
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

export interface HanziSkill {
  type:
    | SkillType.HanziWordToEnglish
    | SkillType.HanziWordToPinyinInitial
    | SkillType.HanziWordToPinyinFinal
    | SkillType.HanziWordToPinyinTone
    | SkillType.EnglishToHanzi
    | SkillType.PinyinToHanzi
    | SkillType.ImageToHanzi;
  hanzi: string;
}

/** Data that forms the unique key for a skill */
export type Skill = HanziSkill;

export enum QuestionFlag {
  WeakWord,
  PreviousMistake,
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
  hint?: string;
  missingAnswers?: readonly (readonly [groupA: string, groupB: string])[];
  flag?: QuestionFlag;
  skill: Skill;
}

export type Question = MultipleChoiceQuestion | OneCorrectPairQuestion;
