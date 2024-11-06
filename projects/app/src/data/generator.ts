import { definitionLookup } from "@/dictionary/hanzi";
import { Radical, radicalLookupByHanzi, radicals } from "@/dictionary/radicals";
import { hsk1Words, hsk2Words, hsk3Words } from "@/dictionary/words";
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
      const english =
        definitionLookup(skill.hanzi)?.[0] ??
        // HACK: missing definitions from hanzijs
        {
          // hsk1
          车上: {
            definition: `on the bus`,
            pinyin: `chē shàng`,
          },
          看到: {
            definition: `to see`,
            pinyin: `kàn dào`,
          },
          请坐: {
            definition: `please sit`,
            pinyin: `qǐng zuò`,
          },
          真的: {
            definition: `really`,
            pinyin: `zhēn de`,
          },
          // hsk2
          不太: {
            definition: `not very`,
            pinyin: `bù tài`,
          },
          好人: {
            definition: `good person`,
            pinyin: `hǎo rén`,
          },
          见过: {
            definition: `have seen`,
            pinyin: `jiàn guò`,
          },
          拿到: {
            definition: `to get`,
            pinyin: `ná dào`,
          },
          全国: {
            definition: `whole country`,
            pinyin: `quán guó`,
          },
          送到: {
            definition: `to deliver`,
            pinyin: `sòng dào`,
          },
        }[skill.hanzi];
      invariant(
        english !== undefined,
        `couldn't find an english translation for ${skill.hanzi}`,
      );
      const rowCount = 5;
      const wrong = getOtherWords(skill.hanzi, (rowCount - 1) * 2);

      const answer = {
        type: `word`,
        hanzi: skill.hanzi,
        definition: english.definition,
      } satisfies OneCorrectPairQuestionWordAnswer;

      if (wrong.length < 3) {
        // eslint-disable-next-line no-console
        console.error(
          `couldn't generate enough options for HanziWordToEnglish`,
        );
      }

      const [wrongA, wrongB] = evenHalve(
        wrong.map((r) => {
          const definition = definitionLookup(r)?.[0]?.definition;
          if (definition == null) {
            // eslint-disable-next-line no-console
            console.error(`couldn't find a definition for ${r}`);
            // invariant(english != null, `couldn't find a definition for ${r}`);
          }
          return {
            type: `word`,
            hanzi: r,
            definition: definition ?? `<no definition for ${r}>`,
          } satisfies OneCorrectPairQuestionWordAnswer;
        }),
      );

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

  return [...result];
}
