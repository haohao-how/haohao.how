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

export interface SkillBase {
  created: Date;
  /** When null, it means it's never been reviewed. */
  srs: SrsState | null;
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

export interface HanziSkill extends SkillBase {
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

export type HanziSkillKey = Pick<HanziSkill, `type` | `hanzi`>;

export type Skill = HanziSkill;

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
