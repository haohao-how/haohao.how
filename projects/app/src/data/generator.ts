import { Character, characterLookupByHanzi } from "@/dictionary/characters";
import { wordLookupByHanzi } from "@/dictionary/words";
import { invariant } from "@haohaohow/lib/invariant";
import shuffle from "lodash/shuffle";
import { Question, QuestionType, Skill, SkillType } from "./model";

// generate a question to test a skill
export function generateQuestionForSkill(skill: Skill): Question {
  switch (skill.type) {
    case SkillType.HanziWordToEnglish: {
      const english = wordLookupByHanzi.get(skill.hanzi);
      invariant(english !== undefined, `couldn't find an english translation`);
      const rowCount = 5;
      const wrongHanzi = getOtherHanzi(skill.hanzi, rowCount - 1);
      const wrongEnglish = getOtherNonMatchingEnglishTranslations([
        skill.hanzi,
        ...wrongHanzi,
      ]).slice(0, wrongHanzi.length);

      if (wrongHanzi.length < 3 || wrongEnglish.length < 3) {
        // eslint-disable-next-line no-console
        console.error(
          `couldn't generate enough options for HanziWordToEnglish`,
        );
      }

      return {
        type: QuestionType.OneCorrectPair,
        prompt: `Match a radical with its name`,
        groupA: shuffle([skill.hanzi, ...wrongHanzi]),
        groupB: shuffle([english.name, ...wrongEnglish.map((x) => x.name)]),
        answer: [skill.hanzi, english.name],
        hint: characterLookupByHanzi.get(skill.hanzi)?.mnemonic,
        missingAnswers: [
          ...wrongHanzi.map((h) => {
            const w = wordLookupByHanzi.get(h);
            return w != null ? ([h, w.name] as const) : null;
          }),
          ...wrongEnglish.map((x) => [x.char, x.name] as const),
        ].filter((x) => x != null),
        skill,
      };
    }
    default:
      throw new Error(`todo: not implemented`);
  }
}

function getOtherHanzi(hanzi: string, count: number): string[] {
  const result = new Set<string>();

  for (const h of shuffle([...characterLookupByHanzi.keys()])) {
    if (!result.has(h) && hanzi !== h) {
      result.add(h);
    }
    if (result.size === count) {
      break;
    }
  }

  return [...result];
}

function getOtherNonMatchingEnglishTranslations(hanzis: string[]): Character[] {
  const result = new Set<Character>();
  const forbidden = new Set(
    hanzis.flatMap((h): string[] => {
      const char = characterLookupByHanzi.get(h);
      const word = wordLookupByHanzi.get(h);
      return [
        char?.name ?? ``,
        ...(char?.nameAlts ?? []),
        word?.name ?? ``,
        ...(word?.nameAlts ?? []),
      ];
    }),
  );

  while (result.size < hanzis.length) {
    for (const c of shuffle([...characterLookupByHanzi.values()])) {
      if (!forbidden.has(c.name)) {
        result.add(c);
      }
      if (result.size === hanzis.length) {
        break;
      }
    }
  }

  return [...result];
}
