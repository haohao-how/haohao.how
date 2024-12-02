import { deepReadonly } from "@/util/collections";
import { invariant } from "@haohaohow/lib/invariant";
import memoize from "lodash/memoize";
import { z } from "zod";

export const loadPinyinWords = memoize(async () =>
  z
    .array(z.string())
    .transform(deepReadonly)
    .parse((await import(`./pinyinWords.asset.json`)).default),
);

export const loadHanziDecomposition = memoize(async () =>
  z
    .array(z.tuple([z.string(), z.array(z.string())]))
    .transform((x) => new Map(x))
    .transform(deepReadonly)
    .parse((await import(`./hanziDecomposition.asset.json`)).default),
);

export const loadStandardPinyinChart = memoize(async () =>
  z
    .object({
      initials: z.array(z.union([z.string(), z.array(z.string())])),
      finals: z.array(z.union([z.string(), z.array(z.string())])),
      overrides: z.record(z.tuple([z.string(), z.string()])),
    })
    .transform(({ initials, finals, overrides }) => ({
      initials: initials.map((x) => (typeof x === `string` ? [x, x] : x)),
      finals: finals.map((x) => (typeof x === `string` ? [x, x] : x)),
      overrides,
    }))
    .transform(deepReadonly)
    .parse((await import(`./standardPinyinChart.asset.json`)).default),
);

export const loadMmPinyinChart = memoize(async () =>
  z
    .object({
      initials: z.array(z.union([z.string(), z.array(z.string())])),
      finals: z.array(z.union([z.string(), z.array(z.string())])),
    })
    .transform(({ initials, finals }) => ({
      initials: initials.map((x) => (typeof x === `string` ? [x, x] : x)),
      finals: finals.map((x) => (typeof x === `string` ? [x, x] : x)),
    }))
    .transform(deepReadonly)
    .parse((await import(`./mmPinyinChart.asset.json`)).default),
);

export const loadHhPinyinChart = memoize(async () =>
  z
    .object({
      initials: z.array(z.union([z.string(), z.array(z.string())])),
      finals: z.array(z.union([z.string(), z.array(z.string())])),
    })
    .transform(({ initials, finals }) => ({
      initials: initials.map((x) => (typeof x === `string` ? [x, x] : x)),
      finals: finals.map((x) => (typeof x === `string` ? [x, x] : x)),
    }))
    .transform(deepReadonly)
    .parse((await import(`./hhPinyinChart.asset.json`)).default),
);

export const loadHmmPinyinChart = memoize(async () =>
  z
    .object({
      initials: z.array(z.union([z.string(), z.array(z.string())])),
      finals: z.array(z.union([z.string(), z.array(z.string())])),
    })
    .transform(({ initials, finals }) => ({
      initials: initials.map((x) => (typeof x === `string` ? [x, x] : x)),
      finals: finals.map((x) => (typeof x === `string` ? [x, x] : x)),
    }))
    .transform(deepReadonly)
    .parse((await import(`./hmmPinyinChart.asset.json`)).default),
);

export const loadMnemonicTheme = memoize(async () =>
  z
    .object({
      tones: z.array(z.object({ tone: z.number(), desc: z.string() })),
      initials: z.array(
        z.object({ prefix: z.string(), n: z.string(), desc: z.string() }),
      ),
      finals: z.array(
        z.object({
          suffix: z.string(),
          location: z.string(),
          rationale: z.string(),
        }),
      ),
    })
    .transform((x) => ({
      tones: new Map(x.tones.map((t) => [t.tone, t.desc])),
      initials: new Map(x.initials.map((i) => [i.prefix, i])),
      finals: new Map(x.finals.map((f) => [f.suffix, f])),
    }))
    .transform(deepReadonly)
    .parse((await import(`./mnemonicTheme.asset.json`)).default),
);

export const loadRadicalNameMnemonics = memoize(async () =>
  z
    .array(
      z.tuple([
        z.string(),
        z.array(z.object({ mnemonic: z.string(), rationale: z.string() })),
      ]),
    )
    .transform((x) => new Map(x))
    .transform(deepReadonly)
    .parse((await import(`./radicalNameMnemonics.asset.json`)).default),
);

export const allHsk1Words = memoize(async () =>
  z
    .array(z.string())
    .transform(deepReadonly)
    .parse((await import(`./hsk1Words.asset.json`)).default),
);

export const allHsk2Words = memoize(async () =>
  z
    .array(z.string())
    .transform(deepReadonly)
    .parse((await import(`./hsk2Words.asset.json`)).default),
);

export const allHsk3Words = memoize(async () =>
  z
    .array(z.string())
    .transform(deepReadonly)
    .parse((await import(`./hsk3Words.asset.json`)).default),
);

export const loadWords = memoize(async () =>
  z
    .array(
      z.tuple([
        z.string(),
        z.object({
          pinyin: z.array(z.string()),
          definitions: z.array(z.string()),
        }),
      ]),
    )
    .transform((x) => new Map(x))
    .transform(deepReadonly)
    .parse((await import(`./words.asset.json`)).default),
);

export const loadRadicals = memoize(async () =>
  z
    .array(
      z.object({
        hanzi: z.array(z.string()),
        name: z.array(z.string()),
        pinyin: z.array(z.string()),
      }),
    )
    .transform(deepReadonly)
    .parse((await import(`./radicals.asset.json`)).default),
);

export const allRadicalPrimaryForms = memoize(async () =>
  deepReadonly(
    (await allRadicals()).map((r) => {
      const first = r.hanzi[0];
      invariant(first != null);
      return first;
    }),
  ),
);

export const loadRadicalsByHanzi = memoize(async () =>
  deepReadonly(
    new Map((await loadRadicals()).flatMap((r) => r.hanzi.map((h) => [h, r]))),
  ),
);

const loadRadicalStrokes = memoize(async () =>
  z
    .array(
      z.object({
        strokes: z.number(),
        range: z.tuple([z.number(), z.number()]),
        characters: z.array(z.string()),
      }),
    )
    .transform((x) => new Map(x.map((r) => [r.strokes, r])))
    .transform(deepReadonly)
    .parse((await import(`./radicalStrokes.asset.json`)).default),
);

export const loadRadicalPinyinMnemonics = memoize(async () =>
  z
    .array(
      z.tuple([
        z.string(),
        z.array(
          z.object({
            mnemonic: z.string(),
            strategy: z.string(),
          }),
        ),
      ]),
    )
    .transform((x) => new Map(x))
    .transform(deepReadonly)
    .parse((await import(`./radicalPinyinMnemonics.asset.json`)).default),
);

export const allRadicalNormalizations = memoize(async () =>
  deepReadonly(
    new Map(
      (await loadRadicals()).flatMap(({ hanzi }) =>
        hanzi.map((h) => [h, hanzi[0]]),
      ),
    ),
  ),
);

export const normalizeRadicalOrThrow = async (
  radical: string,
): Promise<string> => {
  const result = (await allRadicalNormalizations()).get(radical);
  invariant(result != null, `couldn't find a normalization for ${radical}`);
  return result;
};

export const allRadicals = async () => await loadRadicals();

export const allRadicalsByStrokes = async () => await loadRadicalStrokes();

export const lookupRadicalNameMnemonic = async (hanzi: string) =>
  (await lookupRadicalNameMnemonics(hanzi))?.[0] ?? null;

export const lookupRadicalNameMnemonics = async (hanzi: string) =>
  (await loadRadicalNameMnemonics()).get(
    await normalizeRadicalOrThrow(hanzi),
  ) ?? null;

export const lookupRadicalPinyinMnemonic = async (hanzi: string) =>
  (await lookupRadicalPinyinMnemonics(hanzi))?.[0] ?? null;

export const lookupRadicalPinyinMnemonics = async (hanzi: string) =>
  (await loadRadicalPinyinMnemonics()).get(
    await normalizeRadicalOrThrow(hanzi),
  ) ?? null;

export const lookupWord = async (hanzi: string) =>
  (await loadWords()).get(hanzi) ?? null;

export const lookupRadicalByHanzi = async (hanzi: string) =>
  (await loadRadicalsByHanzi()).get(hanzi) ?? null;

export const lookupRadicalsByStrokes = async (strokes: number) =>
  (await loadRadicalStrokes()).get(strokes) ?? null;

export const radicalStrokes = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
];

/**
 * Converts a single pinyin word written with a tone number suffix to use a tone
 * mark instead (also converts v to ü).
 */
export function convertPinyinWithToneNumberToToneMark(pinyin: string): string {
  if (pinyin.length === 0) {
    return pinyin;
  }

  // An algorithm to find the correct vowel letter (when there is more than one) is as follows:
  //
  // 1. If there is an a or an e, it will take the tone mark
  // 2. If there is an ou, then the o takes the tone mark
  // 3. Otherwise, the second vowel takes the tone mark

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  let tone = `012345`.indexOf(pinyin[pinyin.length - 1]!);

  const pinyinLengthWithoutTone = tone > 0 ? pinyin.length - 1 : pinyin.length;

  let result = ``;
  for (let i = 0; i < pinyinLengthWithoutTone; i++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const char = pinyin[i]!;

    if (tone > 0) {
      const nextChar = pinyin[i + 1];

      if (char === `a` || char === `e`) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        result += toneMap[char][tone]!;
        tone = -1;
        continue;
      } else if (char === `o` && nextChar === `u`) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        result += toneMap[char][tone]!;
        tone = -1;
        continue;
      } else if (isPinyinVowel(char)) {
        if (isPinyinVowel(nextChar)) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          result += toneMap[char][5]! + toneMap[nextChar][tone]!;
          i++;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          result += toneMap[char][tone]!;
        }
        tone = -1;
        continue;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    result += isPinyinVowel(char) ? toneMap[char][5]! : char;
  }
  return result;
}

const toneMap = {
  a: `_āáǎàa`,
  e: `_ēéěèe`,
  i: `_īíǐìi`,
  o: `_ōóǒòo`,
  u: `_ūúǔùu`,
  v: `_ǖǘǚǜü`,
} as const;

const isPinyinVowel = (
  char: string | null | undefined,
): char is `a` | `e` | `i` | `o` | `u` | `v` => char != null && char in toneMap;

export type IdsNode =
  | {
      type: `LeftToRight`;
      left: IdsNode;
      right: IdsNode;
    }
  | {
      type: `AboveToBelow`;
      above: IdsNode;
      below: IdsNode;
    }
  | {
      type: `LeftToMiddleToRight`;
      left: IdsNode;
      middle: IdsNode;
      right: IdsNode;
    }
  | {
      type: `AboveToMiddleAndBelow`;
      above: IdsNode;
      middle: IdsNode;
      below: IdsNode;
    }
  | {
      type: `FullSurround`;
      surrounding: IdsNode;
      surrounded: IdsNode;
    }
  | {
      type: `SurroundFromAbove`;
      above: IdsNode;
      surrounded: IdsNode;
    }
  | {
      type: `SurroundFromBelow`;
      below: IdsNode;
      surrounded: IdsNode;
    }
  | {
      type: `SurroundFromLeft`;
      left: IdsNode;
      surrounded: IdsNode;
    }
  | {
      type: `SurroundFromRight`;
      right: IdsNode;
      surrounded: IdsNode;
    }
  | {
      type: `SurroundFromUpperLeft`;
      upperLeft: IdsNode;
      surrounded: IdsNode;
    }
  | {
      type: `SurroundFromUpperRight`;
      upperRight: IdsNode;
      surrounded: IdsNode;
    }
  | {
      type: `SurroundFromLowerLeft`;
      lowerLeft: IdsNode;
      surrounded: IdsNode;
    }
  | {
      type: `SurroundFromLowerRight`;
      lowerRight: IdsNode;
      surrounded: IdsNode;
    }
  | {
      type: `Overlaid`;
      overlay: IdsNode;
      underlay: IdsNode;
    }
  | {
      type: `HorizontalReflection`;
      reflected: IdsNode;
    }
  | {
      type: `Rotation`;
      rotated: IdsNode;
    }
  | {
      type: `LeafCharacter`;
      character: string;
    }
  | {
      type: `LeftUnknownCharacter`;
      strokeCount: number;
    };

export function parseIds(ids: string, startIndex = 0): [IdsNode, number] {
  let i = startIndex;
  const char = ids[i++];
  invariant(char != null);
  const charCodePoint = char.codePointAt(0);
  invariant(charCodePoint != null);

  if (charCodePoint >= /* ⿰ */ 12272 && charCodePoint <= /* ⿿ */ 12287) {
    switch (char) {
      case `⿰`: {
        const [left, leftEnd] = parseIds(ids, i);
        i = leftEnd;
        const [right, rightEnd] = parseIds(ids, i);
        i = rightEnd;
        return [{ type: `LeftToRight`, left, right }, i];
      }
      case `⿱`: {
        const [above, aboveEnd] = parseIds(ids, i);
        i = aboveEnd;
        const [below, belowEnd] = parseIds(ids, i);
        i = belowEnd;
        return [{ type: `AboveToBelow`, above, below }, i];
      }
      case `⿲`: {
        const [left, leftEnd] = parseIds(ids, i);
        i = leftEnd;
        const [middle, middleEnd] = parseIds(ids, i);
        i = middleEnd;
        const [right, rightEnd] = parseIds(ids, i);
        i = rightEnd;
        return [{ type: `LeftToMiddleToRight`, left, middle, right }, i];
      }
      case `⿳`: {
        const [above, aboveEnd] = parseIds(ids, i);
        i = aboveEnd;
        const [middle, middleEnd] = parseIds(ids, i);
        i = middleEnd;
        const [below, belowEnd] = parseIds(ids, i);
        i = belowEnd;
        return [{ type: `AboveToMiddleAndBelow`, above, middle, below }, i];
      }
      case `⿴`: {
        const [surrounding, surroundingEnd] = parseIds(ids, i);
        i = surroundingEnd;
        const [surrounded, surroundedEnd] = parseIds(ids, i);
        i = surroundedEnd;
        return [{ type: `FullSurround`, surrounding, surrounded }, i];
      }
      case `⿵`: {
        const [above, aboveEnd] = parseIds(ids, i);
        i = aboveEnd;
        const [surrounded, surroundedEnd] = parseIds(ids, i);
        i = surroundedEnd;
        return [{ type: `SurroundFromAbove`, above, surrounded }, i];
      }
      case `⿶`: {
        const [below, belowEnd] = parseIds(ids, i);
        i = belowEnd;
        const [surrounded, surroundedEnd] = parseIds(ids, i);
        i = surroundedEnd;
        return [{ type: `SurroundFromBelow`, below, surrounded }, i];
      }
      case `⿷`: {
        const [left, leftEnd] = parseIds(ids, i);
        i = leftEnd;
        const [surrounded, surroundedEnd] = parseIds(ids, i);
        i = surroundedEnd;
        return [{ type: `SurroundFromLeft`, left, surrounded }, i];
      }
      case `⿼`: {
        const [right, rightEnd] = parseIds(ids, i);
        i = rightEnd;
        const [surrounded, surroundedEnd] = parseIds(ids, i);
        i = surroundedEnd;
        return [{ type: `SurroundFromRight`, right, surrounded }, i];
      }
      case `⿸`: {
        const [upperLeft, upperLeftEnd] = parseIds(ids, i);
        i = upperLeftEnd;
        const [surrounded, surroundedEnd] = parseIds(ids, i);
        i = surroundedEnd;
        return [{ type: `SurroundFromUpperLeft`, upperLeft, surrounded }, i];
      }
      case `⿹`: {
        const [upperRight, upperRightEnd] = parseIds(ids, i);
        i = upperRightEnd;
        const [surrounded, surroundedEnd] = parseIds(ids, i);
        i = surroundedEnd;
        return [{ type: `SurroundFromUpperRight`, upperRight, surrounded }, i];
      }
      case `⿺`: {
        const [lowerLeft, lowerLeftEnd] = parseIds(ids, i);
        i = lowerLeftEnd;
        const [surrounded, surroundedEnd] = parseIds(ids, i);
        i = surroundedEnd;
        return [{ type: `SurroundFromLowerLeft`, lowerLeft, surrounded }, i];
      }
      case `⿽`: {
        const [lowerRight, lowerRightEnd] = parseIds(ids, i);
        i = lowerRightEnd;
        const [surrounded, surroundedEnd] = parseIds(ids, i);
        i = surroundedEnd;
        return [{ type: `SurroundFromLowerRight`, lowerRight, surrounded }, i];
      }
      case `⿻`: {
        const [overlay, overlayEnd] = parseIds(ids, i);
        i = overlayEnd;
        const [underlay, underlayEnd] = parseIds(ids, i);
        i = underlayEnd;
        return [{ type: `Overlaid`, overlay, underlay }, i];
      }
      case `⿾`: {
        const [reflected, reflectedEnd] = parseIds(ids, i);
        i = reflectedEnd;
        return [{ type: `HorizontalReflection`, reflected }, i];
      }
      case `⿿`: {
        const [rotated, rotatedEnd] = parseIds(ids, i);
        i = rotatedEnd;
        return [{ type: `Rotation`, rotated }, i];
      }
      default:
        throw new Error(`unexpected combining character ${char}`);
    }
  }

  if (charCodePoint >= /* ① */ 9312 && charCodePoint <= /* ⑳ */ 9331) {
    switch (char) {
      case `①`: {
        return [{ type: `LeftUnknownCharacter`, strokeCount: 1 }, i];
      }
      case `②`: {
        return [{ type: `LeftUnknownCharacter`, strokeCount: 2 }, i];
      }
      case `③`: {
        return [{ type: `LeftUnknownCharacter`, strokeCount: 3 }, i];
      }
      case `④`: {
        return [{ type: `LeftUnknownCharacter`, strokeCount: 4 }, i];
      }
      case `⑤`: {
        return [{ type: `LeftUnknownCharacter`, strokeCount: 5 }, i];
      }
      case `⑥`: {
        return [{ type: `LeftUnknownCharacter`, strokeCount: 6 }, i];
      }
      case `⑦`: {
        return [{ type: `LeftUnknownCharacter`, strokeCount: 7 }, i];
      }
      case `⑧`: {
        return [{ type: `LeftUnknownCharacter`, strokeCount: 8 }, i];
      }
      case `⑨`: {
        return [{ type: `LeftUnknownCharacter`, strokeCount: 9 }, i];
      }
      case `⑩`: {
        return [{ type: `LeftUnknownCharacter`, strokeCount: 10 }, i];
      }
      case `⑪`: {
        return [{ type: `LeftUnknownCharacter`, strokeCount: 11 }, i];
      }
      case `⑫`: {
        return [{ type: `LeftUnknownCharacter`, strokeCount: 12 }, i];
      }
      case `⑬`: {
        return [{ type: `LeftUnknownCharacter`, strokeCount: 13 }, i];
      }
      case `⑭`: {
        return [{ type: `LeftUnknownCharacter`, strokeCount: 14 }, i];
      }
      case `⑮`: {
        return [{ type: `LeftUnknownCharacter`, strokeCount: 15 }, i];
      }
      case `⑯`: {
        return [{ type: `LeftUnknownCharacter`, strokeCount: 16 }, i];
      }
      case `⑰`: {
        return [{ type: `LeftUnknownCharacter`, strokeCount: 17 }, i];
      }
      case `⑱`: {
        return [{ type: `LeftUnknownCharacter`, strokeCount: 18 }, i];
      }
      case `⑲`: {
        return [{ type: `LeftUnknownCharacter`, strokeCount: 19 }, i];
      }
      case `⑳`: {
        return [{ type: `LeftUnknownCharacter`, strokeCount: 20 }, i];
      }
      default:
        throw new Error(`unexpected stroke count placeholder ${char}`);
    }
  }

  return [{ type: `LeafCharacter`, character: char }, i];
}
