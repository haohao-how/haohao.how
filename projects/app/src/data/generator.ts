import { simpleDefinitionLookup } from "@/dictionary/hanzi";
import { radicalLookupByHanzi, radicals } from "@/dictionary/radicals";
import { hsk1Words, hsk2Words, hsk3Words } from "@/dictionary/words";
import { invariant } from "@haohaohow/lib/invariant";
import shuffle from "lodash/shuffle";
import {
  OneCorrectPairQuestionAnswer,
  OneCorrectPairQuestionChoice,
  Question,
  QuestionType,
  Skill,
  SkillType,
} from "./model";

type BuilderChoice =
  | { radical: string }
  | { hanzi: string }
  | { pinyin: string }
  | { definition: string }
  | { name: string };

const choice = (a: BuilderChoice): OneCorrectPairQuestionChoice =>
  `radical` in a
    ? { type: `radical`, hanzi: a.radical }
    : `hanzi` in a
      ? { type: `hanzi`, hanzi: a.hanzi }
      : `pinyin` in a
        ? { type: `pinyin`, pinyin: a.pinyin }
        : `definition` in a
          ? { type: `definition`, english: a.definition }
          : { type: `name`, english: a.name };

const choicePair = (
  a: BuilderChoice,
  b: BuilderChoice,
): OneCorrectPairQuestionAnswer => ({
  a: choice(a),
  b: choice(b),
});

// generate a question to test a skill
export function generateQuestionForSkillOrThrow(skill: Skill): Question {
  switch (skill.type) {
    case SkillType.RadicalToEnglish: {
      const radical = radicalLookupByHanzi.get(skill.hanzi);
      invariant(radical !== undefined, `couldn't find a radical`);
      const rowCount = 5;
      const answer = choicePair({ radical: skill.hanzi }, { name: skill.name });
      const [wrongA, wrongB] = evenHalve(
        getOtherChoices(
          shuffle(
            radicals.flatMap((r) => {
              const result = [];
              for (const radical of r.hanzi) {
                for (const name of r.name) {
                  result.push(choicePair({ radical }, { name }));
                }
              }
              return result;
            }),
          ),
          {
            initial: [JSON.stringify(answer.a), JSON.stringify(answer.b)],
            fn: (r) => [JSON.stringify(r.a), JSON.stringify(r.b)],
          },
          (rowCount - 1) * 2,
        ),
      );

      return {
        type: QuestionType.OneCorrectPair,
        prompt: `Match a radical with its name`,
        groupA: shuffle([answer, ...wrongA]),
        groupB: shuffle([answer, ...wrongB]),
        answer,
        hint: radical.nameMnemonic,
        skill,
      };
    }
    case SkillType.RadicalToPinyin: {
      const radical = radicalLookupByHanzi.get(skill.hanzi);
      invariant(radical !== undefined, `couldn't find a radical`);
      const rowCount = 5;
      const answer = choicePair(
        { radical: skill.hanzi },
        { pinyin: skill.pinyin },
      );
      const [wrongA, wrongB] = evenHalve(
        getOtherChoices(
          shuffle(
            radicals.flatMap((r) => {
              const result = [];
              for (const radical of r.hanzi) {
                for (const pinyin of r.pinyin) {
                  result.push(choicePair({ radical }, { pinyin }));
                }
              }
              return result;
            }),
          ),
          {
            initial: [JSON.stringify(answer.a), JSON.stringify(answer.b)],
            fn: (r) => [JSON.stringify(r.a), JSON.stringify(r.b)],
          },
          (rowCount - 1) * 2,
        ),
      );

      return {
        type: QuestionType.OneCorrectPair,
        prompt: `Match a radical with its pinyin`,
        groupA: shuffle([answer, ...wrongA]),
        groupB: shuffle([answer, ...wrongB]),
        answer,
        skill,
      };
    }
    case SkillType.HanziWordToEnglish: {
      const english = simpleDefinitionLookup(skill.hanzi);
      invariant(
        english != null,
        `missing definition for hanzi word ${skill.hanzi}`,
      );
      const rowCount = 5;
      const answer = choicePair(
        { hanzi: skill.hanzi },
        { definition: english.definition },
      );
      const otherAnswers: OneCorrectPairQuestionAnswer[] = [];
      for (const hanzi of getOtherWords(skill.hanzi, (rowCount - 1) * 2)) {
        const definition = simpleDefinitionLookup(hanzi)?.definition;
        invariant(
          definition != null,
          `missing definition for other word ${hanzi}`,
        );
        otherAnswers.push(choicePair({ hanzi }, { definition }));
      }
      const [wrongA, wrongB] = evenHalve(otherAnswers);

      return {
        type: QuestionType.OneCorrectPair,
        prompt: `Match a word with its name`,
        groupA: shuffle([...wrongA, answer]),
        groupB: shuffle([...wrongB, answer]),
        answer,
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

function getOtherChoices<
  T,
  U extends [string] | [string, string] | [string, string, string],
>(choices: T[], uniqueBy: { initial: U; fn: (r: T) => U }, count: number): T[] {
  const result = new Set<T>();
  const seenKeys = uniqueBy.initial.map((x) => new Set([x]));

  for (const radical of shuffle(choices)) {
    if (!result.has(radical)) {
      const newKeys = uniqueBy.fn(radical);
      if (!newKeys.some((k, i) => seenKeys[i]?.has(k))) {
        newKeys.forEach((k, i) => seenKeys[i]?.add(k));
        result.add(radical);
      }
    }
    if (result.size === count) {
      break;
    }
  }

  invariant(
    result.size == count,
    `couldn't get enough other choices ${result.size} != ${count}`,
  );

  return [...result];
}

function getOtherWords(hanzi: string, count: number): string[] {
  const result = new Set<string>();

  // Use words from the same HSK word list if possible, so that they're more
  // likely to be familiar by being in a similar skill level. Otherwise fallback
  // all HSK words.
  const candidates = [hsk1Words, hsk2Words, hsk3Words].find((words) =>
    words.includes(hanzi),
  ) ?? [...hsk1Words, ...hsk2Words, ...hsk3Words];

  for (const char of shuffle(candidates)) {
    if (!result.has(char) && hanzi !== char) {
      result.add(char);
    }
    if (result.size === count) {
      break;
    }
  }

  invariant(
    result.size == count,
    `couldn't get enough other choices ${result.size} != ${count}`,
  );

  return [...result];
}
