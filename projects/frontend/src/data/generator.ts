import { wordLookupByWord } from "@/dictionary/words";
import { invariant } from "@/util/invariant";
import { DeckItem, QuizDeckItemType, Skill, SkillType } from "./model";

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
