import { deepReadonly } from "@/util/collections";
import { invariant } from "@haohaohow/lib/invariant";
import memoize from "lodash/memoize";
import { StrictExtract } from "ts-essentials";
import { z } from "zod";

export const loadPinyinWords = memoize(async () =>
  z
    .array(z.string())
    .transform(deepReadonly)
    .parse((await import(`./pinyinWords.asset.json`)).default),
);

export const loadHanziDecomposition = memoize(async () =>
  z
    .array(z.tuple([z.string(), z.string()]))
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
      type: `LeafUnknownCharacter`;
      strokeCount: number;
    };

export function parseIds(
  ids: string,
  cursor: { index: number } = { index: 0 },
): IdsNode {
  const char = ids[cursor.index++];
  invariant(char != null);
  const charCodePoint = char.codePointAt(0);
  invariant(charCodePoint != null);

  if (charCodePoint >= /* ⿰ */ 12272 && charCodePoint <= /* ⿿ */ 12287) {
    switch (char) {
      case `⿰`: {
        const left = parseIds(ids, cursor);
        const right = parseIds(ids, cursor);
        return { type: `LeftToRight`, left, right };
      }
      case `⿱`: {
        const above = parseIds(ids, cursor);
        const below = parseIds(ids, cursor);
        return { type: `AboveToBelow`, above, below };
      }
      case `⿲`: {
        const left = parseIds(ids, cursor);
        const middle = parseIds(ids, cursor);
        const right = parseIds(ids, cursor);
        return { type: `LeftToMiddleToRight`, left, middle, right };
      }
      case `⿳`: {
        const above = parseIds(ids, cursor);
        const middle = parseIds(ids, cursor);
        const below = parseIds(ids, cursor);
        return { type: `AboveToMiddleAndBelow`, above, middle, below };
      }
      case `⿴`: {
        const surrounding = parseIds(ids, cursor);
        const surrounded = parseIds(ids, cursor);
        return { type: `FullSurround`, surrounding, surrounded };
      }
      case `⿵`: {
        const above = parseIds(ids, cursor);
        const surrounded = parseIds(ids, cursor);
        return { type: `SurroundFromAbove`, above, surrounded };
      }
      case `⿶`: {
        const below = parseIds(ids, cursor);
        const surrounded = parseIds(ids, cursor);
        return { type: `SurroundFromBelow`, below, surrounded };
      }
      case `⿷`: {
        const left = parseIds(ids, cursor);
        const surrounded = parseIds(ids, cursor);
        return { type: `SurroundFromLeft`, left, surrounded };
      }
      case `⿼`: {
        const right = parseIds(ids, cursor);
        const surrounded = parseIds(ids, cursor);
        return { type: `SurroundFromRight`, right, surrounded };
      }
      case `⿸`: {
        const upperLeft = parseIds(ids, cursor);
        const surrounded = parseIds(ids, cursor);
        return { type: `SurroundFromUpperLeft`, upperLeft, surrounded };
      }
      case `⿹`: {
        const upperRight = parseIds(ids, cursor);
        const surrounded = parseIds(ids, cursor);
        return { type: `SurroundFromUpperRight`, upperRight, surrounded };
      }
      case `⿺`: {
        const lowerLeft = parseIds(ids, cursor);
        const surrounded = parseIds(ids, cursor);
        return { type: `SurroundFromLowerLeft`, lowerLeft, surrounded };
      }
      case `⿽`: {
        const lowerRight = parseIds(ids, cursor);
        const surrounded = parseIds(ids, cursor);
        return { type: `SurroundFromLowerRight`, lowerRight, surrounded };
      }
      case `⿻`: {
        const overlay = parseIds(ids, cursor);
        const underlay = parseIds(ids, cursor);
        return { type: `Overlaid`, overlay, underlay };
      }
      case `⿾`: {
        const reflected = parseIds(ids, cursor);
        return { type: `HorizontalReflection`, reflected };
      }
      case `⿿`: {
        const rotated = parseIds(ids, cursor);
        return { type: `Rotation`, rotated };
      }
      default:
        throw new Error(`unexpected combining character ${char}`);
    }
  }

  if (isStrokeCountPlaceholder(charCodePoint)) {
    switch (char) {
      case `①`: {
        return { type: `LeafUnknownCharacter`, strokeCount: 1 };
      }
      case `②`: {
        return { type: `LeafUnknownCharacter`, strokeCount: 2 };
      }
      case `③`: {
        return { type: `LeafUnknownCharacter`, strokeCount: 3 };
      }
      case `④`: {
        return { type: `LeafUnknownCharacter`, strokeCount: 4 };
      }
      case `⑤`: {
        return { type: `LeafUnknownCharacter`, strokeCount: 5 };
      }
      case `⑥`: {
        return { type: `LeafUnknownCharacter`, strokeCount: 6 };
      }
      case `⑦`: {
        return { type: `LeafUnknownCharacter`, strokeCount: 7 };
      }
      case `⑧`: {
        return { type: `LeafUnknownCharacter`, strokeCount: 8 };
      }
      case `⑨`: {
        return { type: `LeafUnknownCharacter`, strokeCount: 9 };
      }
      case `⑩`: {
        return { type: `LeafUnknownCharacter`, strokeCount: 10 };
      }
      case `⑪`: {
        return { type: `LeafUnknownCharacter`, strokeCount: 11 };
      }
      case `⑫`: {
        return { type: `LeafUnknownCharacter`, strokeCount: 12 };
      }
      case `⑬`: {
        return { type: `LeafUnknownCharacter`, strokeCount: 13 };
      }
      case `⑭`: {
        return { type: `LeafUnknownCharacter`, strokeCount: 14 };
      }
      case `⑮`: {
        return { type: `LeafUnknownCharacter`, strokeCount: 15 };
      }
      case `⑯`: {
        return { type: `LeafUnknownCharacter`, strokeCount: 16 };
      }
      case `⑰`: {
        return { type: `LeafUnknownCharacter`, strokeCount: 17 };
      }
      case `⑱`: {
        return { type: `LeafUnknownCharacter`, strokeCount: 18 };
      }
      case `⑲`: {
        return { type: `LeafUnknownCharacter`, strokeCount: 19 };
      }
      case `⑳`: {
        return { type: `LeafUnknownCharacter`, strokeCount: 20 };
      }
      default:
        throw new Error(`unexpected stroke count placeholder ${char}`);
    }
  }

  return { type: `LeafCharacter`, character: char };
}

export function isStrokeCountPlaceholder(
  charOrCharPoint: string | number,
): boolean {
  const charCodePoint =
    typeof charOrCharPoint === `string`
      ? charOrCharPoint.codePointAt(0)
      : charOrCharPoint;
  invariant(charCodePoint != null);
  return charCodePoint >= /* ① */ 9312 && charCodePoint <= /* ⑳ */ 9331;
}

export function* walkIdsNode(
  ids: IdsNode,
): Generator<
  StrictExtract<
    IdsNode,
    { type: `LeafCharacter` } | { type: `LeafUnknownCharacter` }
  >
> {
  switch (ids.type) {
    case `LeftToRight`: {
      yield* walkIdsNode(ids.left);
      yield* walkIdsNode(ids.right);
      return;
    }
    case `AboveToBelow`: {
      yield* walkIdsNode(ids.above);
      yield* walkIdsNode(ids.below);
      return;
    }
    case `LeftToMiddleToRight`: {
      yield* walkIdsNode(ids.left);
      yield* walkIdsNode(ids.middle);
      yield* walkIdsNode(ids.right);
      return;
    }
    case `AboveToMiddleAndBelow`: {
      yield* walkIdsNode(ids.above);
      yield* walkIdsNode(ids.middle);
      yield* walkIdsNode(ids.below);
      return;
    }
    case `FullSurround`: {
      yield* walkIdsNode(ids.surrounding);
      yield* walkIdsNode(ids.surrounded);
      return;
    }
    case `SurroundFromAbove`: {
      yield* walkIdsNode(ids.above);
      yield* walkIdsNode(ids.surrounded);
      return;
    }
    case `SurroundFromBelow`: {
      yield* walkIdsNode(ids.below);
      yield* walkIdsNode(ids.surrounded);
      return;
    }
    case `SurroundFromLeft`: {
      yield* walkIdsNode(ids.left);
      yield* walkIdsNode(ids.surrounded);
      return;
    }
    case `SurroundFromRight`: {
      yield* walkIdsNode(ids.right);
      yield* walkIdsNode(ids.surrounded);
      return;
    }
    case `SurroundFromUpperLeft`: {
      yield* walkIdsNode(ids.upperLeft);
      yield* walkIdsNode(ids.surrounded);
      return;
    }
    case `SurroundFromUpperRight`: {
      yield* walkIdsNode(ids.upperRight);
      yield* walkIdsNode(ids.surrounded);
      return;
    }
    case `SurroundFromLowerLeft`: {
      yield* walkIdsNode(ids.lowerLeft);
      yield* walkIdsNode(ids.surrounded);
      return;
    }
    case `SurroundFromLowerRight`: {
      yield* walkIdsNode(ids.lowerRight);
      yield* walkIdsNode(ids.surrounded);
      return;
    }
    case `Overlaid`: {
      yield* walkIdsNode(ids.underlay);
      yield* walkIdsNode(ids.overlay);
      return;
    }
    case `HorizontalReflection`: {
      yield* walkIdsNode(ids.reflected);
      return;
    }
    case `Rotation`: {
      yield* walkIdsNode(ids.rotated);
      return;
    }
    case `LeafCharacter`:
    case `LeafUnknownCharacter`: {
      yield ids;
      return;
    }
    default:
      throw new Error(`unexpected ids node type: ${(ids as IdsNode).type}`);
  }
}

export function unicodeShortIdentifier(character: string): string {
  const codePoint = character.codePointAt(0);
  invariant(
    codePoint != null,
    `could not get code point for: ${JSON.stringify(character)}`,
  );
  return `U+${codePoint.toString(16).toUpperCase()}`;
}
