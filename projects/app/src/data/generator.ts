import { Character, characterLookupByHanzi } from "@/dictionary/characters";
import { Radical, radicalLookupByHanzi, radicals } from "@/dictionary/radicals";
import { wordLookupByHanzi } from "@/dictionary/words";
import { invariant } from "@haohaohow/lib/invariant";
import shuffle from "lodash/shuffle";
import {
  OneCorrectPairQuestionRadicalAnswer,
  OneCorrectPairQuestionWordAnswer,
  Question,
  QuestionType,
  Skill,
  SkillType,
} from "./model";

// generate a question to test a skill
export function generateQuestionForSkill(skill: Skill): Question {
  switch (skill.type) {
    case SkillType.RadicalToEnglish: {
      const radical = radicalLookupByHanzi.get(skill.hanzi);
      invariant(radical !== undefined, `couldn't find a radical`);
      const rowCount = 5;
      const wrong = getOtherRadicals(skill.hanzi, (rowCount - 1) * 2);

      const answer = {
        type: `radical`,
        hanzi: skill.hanzi,
        name: skill.name,
      } satisfies OneCorrectPairQuestionRadicalAnswer;

      if (wrong.length < 3) {
        // eslint-disable-next-line no-console
        console.error(`couldn't generate enough options for RadicalToEnglish`);
      }

      const [wrongA, wrongB] = evenHalve(
        wrong.map((r) => {
          const hanzi = shuffle(r.hanzi)[0];
          const name = shuffle(r.name)[0];
          invariant(
            hanzi != null && name != null,
            `couldn't find hanzi or name`,
          );
          return {
            type: `radical`,
            hanzi,
            name,
          } satisfies OneCorrectPairQuestionRadicalAnswer;
        }),
      );

      return {
        type: QuestionType.OneCorrectPair,
        prompt: `Match a radical with its name`,
        groupA: shuffle([answer, ...wrongA]),
        groupB: shuffle([answer, ...wrongB]),
        answer,
        hint: radical.mnemonic,
        skill,
      };
    }
    case SkillType.HanziWordToEnglish: {
      const english = wordLookupByHanzi.get(skill.hanzi);
      invariant(english !== undefined, `couldn't find an english translation`);
      const rowCount = 5;
      const wrong = getOtherHanzi(skill.hanzi, (rowCount - 1) * 2);

      const answer = {
        type: `word`,
        hanzi: skill.hanzi,
        name: english.name,
      } satisfies OneCorrectPairQuestionWordAnswer;

      if (wrong.length < 3) {
        // eslint-disable-next-line no-console
        console.error(
          `couldn't generate enough options for HanziWordToEnglish`,
        );
      }

      const [wrongA, wrongB] = evenHalve(
        wrong.map((r) => {
          const name = shuffle([r.name, ...(r.nameAlts ?? [])])[0];
          invariant(name != null, `couldn't find name`);
          return {
            type: `word`,
            hanzi: r.char,
            name,
          } satisfies OneCorrectPairQuestionWordAnswer;
        }),
      );

      return {
        type: QuestionType.OneCorrectPair,
        prompt: `Match a word with its name`,
        groupA: shuffle([...wrongA, answer]),
        groupB: shuffle([...wrongB, answer]),
        answer,
        hint: characterLookupByHanzi.get(skill.hanzi)?.mnemonic,
        skill,
      };
    }
    default:
      throw new Error(`todo: not implemented`);
  }
}

function evenHalve<T>(items: T[]): [T[], T[]] {
  const splitIndex = Math.floor(items.length / 2);
  const a = items.slice(0, splitIndex);
  const b = items.slice(splitIndex, splitIndex + a.length);
  return [a, b];
}

function getOtherRadicals(hanzi: string, count: number): Radical[] {
  const result = new Set<Radical>();

  for (const radical of shuffle(radicals)) {
    if (!result.has(radical) && !radical.hanzi.includes(hanzi)) {
      result.add(radical);
    }
    if (result.size === count) {
      break;
    }
  }

  return [...result];
}

function getOtherHanzi(hanzi: string, count: number): Character[] {
  const result = new Set<Character>();

  for (const [h, char] of shuffle([...characterLookupByHanzi])) {
    if (!result.has(char) && hanzi !== h) {
      result.add(char);
    }
    if (result.size === count) {
      break;
    }
  }

  return [...result];
}
