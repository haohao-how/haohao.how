import { wordLookupByWord } from "@/dictionary/words";
import { invariant } from "@/util/invariant";
import { Question, QuestionType, Skill, SkillType } from "./model";

// generate a question to test a skill
export function generateQuestionForSkill(skill: Skill): Question {
  switch (skill.type) {
    case SkillType.HanziWordToEnglish: {
      const english = wordLookupByWord.get(skill.hanzi);
      invariant(english !== undefined, `couldn't find an english translation`);
      return {
        type: QuestionType.OneCorrectPair,
        // SingleHanziWordToEnglish,
        prompt: `Translate this`,
        groupA: [
          skill.hanzi, // TODO: 3 other items
          `x`,
          `y`,
          `z`,
        ],
        groupB: [
          english.name,
          // TODO: 3 other items
          `xx`,
          `yy`,
          `zz`,
        ],
        answer: [skill.hanzi, english.name],
        skill,
      };
    }
    default:
      throw new Error(`todo: not implemented`);
  }
}
