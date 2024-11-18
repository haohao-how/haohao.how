import memoize from "lodash/memoize";
import { z } from "zod";

export const loadRadicalNameMnemonics = memoize(
  async () =>
    new Map(
      z
        .array(
          z.tuple([
            z.string(),
            z.array(z.object({ mnemonic: z.string(), rationale: z.string() })),
          ]),
        )
        .parse((await import(`./radicalNameMnemonics.asset.json`)).default),
    ),
);

export const allHsk1Words = memoize(async () =>
  z.array(z.string()).parse((await import(`./hsk1Words.asset.json`)).default),
);

export const allHsk2Words = memoize(async () =>
  z.array(z.string()).parse((await import(`./hsk2Words.asset.json`)).default),
);

export const allHsk3Words = memoize(async () =>
  z.array(z.string()).parse((await import(`./hsk3Words.asset.json`)).default),
);

export const loadWords = memoize(
  async () =>
    new Map(
      z
        .array(
          z.tuple([
            z.string(),
            z.object({
              pinyin: z.string(),
              definitions: z.array(z.string()),
            }),
          ]),
        )
        .parse((await import(`./words.asset.json`)).default),
    ),
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
    .parse((await import(`./radicals.asset.json`)).default),
);

export const loadRadicalsByHanzi = memoize(async () => {
  return new Map(
    (await loadRadicals()).flatMap((r) => r.hanzi.map((h) => [h, r])),
  );
});

const loadRadicalStrokes = memoize(
  async () =>
    new Map(
      z
        .array(
          z.object({
            strokes: z.number(),
            range: z.tuple([z.number(), z.number()]),
            characters: z.array(z.string()),
          }),
        )
        .parse((await import(`./radicalStrokes.asset.json`)).default)
        .map((r) => [r.strokes, r]),
    ),
);

const loadRadicalPinyinMnemonics = memoize(
  async () =>
    new Map(
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
        .parse((await import(`./radicalPinyinMnemonics.asset.json`)).default),
    ),
);

export const allRadicals = async () => await loadRadicals();

export const allRadicalsByStrokes = async () => await loadRadicalStrokes();

export const lookupRadicalNameMnemonic = async (hanzi: string) =>
  (await loadRadicalNameMnemonics()).get(hanzi)?.[0] ?? null;

export const lookupRadicalPinyinMnemonic = async (hanzi: string) =>
  (await loadRadicalPinyinMnemonics()).get(hanzi)?.[0] ?? null;

export const lookupWord = async (hanzi: string) =>
  (await loadWords()).get(hanzi) ?? null;

export const lookupRadicalByHanzi = async (hanzi: string) =>
  (await loadRadicalsByHanzi()).get(hanzi) ?? null;

export const lookupRadicalsByStrokes = async (strokes: number) =>
  (await loadRadicalStrokes()).get(strokes) ?? null;

export const radicalStrokes = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
];
