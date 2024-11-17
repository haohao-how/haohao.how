import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import memoize from "lodash/memoize";
import { z } from "zod";

const readJsonAssetOrThrow = async <T extends z.ZodTypeAny>(
  asset: Asset,
  schema: T,
): Promise<z.infer<T>> => {
  const json =
    asset.localUri !== null
      ? FileSystem.readAsStringAsync(asset.localUri).then(
          (x) => JSON.parse(x) as unknown,
        )
      : fetch(asset.uri).then((response) => response.json());

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return schema.parse(await json) as z.infer<T>;
};

const loadRadicalNameMnemonics = memoize(
  async () =>
    new Map(
      await readJsonAssetOrThrow(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        Asset.fromModule(require(`./radicalNameMnemonics.jsonasset`)),
        z.array(
          z.tuple([
            z.string(),
            z.array(z.object({ mnemonic: z.string(), rationale: z.string() })),
          ]),
        ),
      ),
    ),
);

const loadWords = memoize(
  async () =>
    new Map(
      await readJsonAssetOrThrow(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        Asset.fromModule(require(`./words.jsonasset`)),
        z.array(
          z.tuple([
            z.string(),
            z.object({
              pinyin: z.string(),
              definitions: z.array(z.string()),
            }),
          ]),
        ),
      ),
    ),
);

const newLocal = `./radicals` + `.jsonasset`;
export const loadRadicals = memoize(() =>
  readJsonAssetOrThrow(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    Asset.fromModule(require(newLocal)),
    z.array(
      z.object({
        hanzi: z.array(z.string()),
        name: z.array(z.string()),
        pinyin: z.array(z.string()),
      }),
    ),
  ),
);

export const loadRadicalsByHanzi = memoize(async () => {
  return new Map(
    (await loadRadicals()).flatMap((r) => r.hanzi.map((h) => [h, r])),
  );
});

const loadRadicalStrokes = memoize(() =>
  readJsonAssetOrThrow(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    Asset.fromModule(require(`./radicalStrokes.jsonasset`)),
    z.array(
      z.object({
        strokes: z.number(),
        range: z.tuple([z.number(), z.number()]),
        characters: z.array(z.string()),
      }),
    ),
  ).then((data) => new Map(data.map((r) => [r.strokes, r.characters]))),
);

const loadRadicalPinyinMnemonics = memoize(() =>
  readJsonAssetOrThrow(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    Asset.fromModule(require(`./radicalPinyinMnemonics.jsonasset`)),
    z.record(
      z.string(),
      z.object({
        initial: z.string(),
        final: z.string(),
        tone: z.string(),
        meaning: z.string(),
        mnemonics: z.array(
          z.object({
            mnemonic: z.string(),
            strategy: z.string(),
          }),
        ),
      }),
    ),
  ).then((data) => new Map(Object.entries(data))),
);

export const allRadicals = async () => await loadRadicals();

export const allRadicalsByStrokes = async () => await loadRadicalStrokes();

export const lookupRadicalNameMnemonic = async (hanzi: string) =>
  (await loadRadicalNameMnemonics()).get(hanzi)?.[0] ?? null;

export const lookupRadicalPinyinMnemonic = async (hanzi: string) =>
  (await loadRadicalPinyinMnemonics()).get(hanzi)?.mnemonics[0] ?? null;

export const lookupWord = async (hanzi: string) =>
  (await loadWords()).get(hanzi) ?? null;

export const lookupRadicalByHanzi = async (hanzi: string) =>
  (await loadRadicalsByHanzi()).get(hanzi) ?? null;

export const lookupRadicalsByStrokes = async (strokes: number) =>
  (await loadRadicalStrokes()).get(strokes) ?? null;

export const radicalStrokes = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
];
