import { invariant } from "@haohaohow/lib/invariant";
import type { Definition } from "hanzi";

type HanziModule = typeof import("hanzi");

let hanzi: HanziModule;

function lazyHanzi(): HanziModule {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (hanzi === undefined) {
    hanzi = require(`hanzi`) as HanziModule;
    hanzi.start();
  }

  return hanzi;
}

/**
 * To use the hanzi module you need to call `start` before using other APIs.
 * This function wraps the functions to lazily call `start()`.
 * @param name
 * @returns
 */
function autoStart<K extends keyof HanziModule>(name: K) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((...args: any[]) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
    lazyHanzi()[name](...(args as [any]))) as HanziModule[K];
}

export const preload = () => lazyHanzi();
export const decompose = autoStart(`decompose`);

export const definitionLookup = autoStart(`definitionLookup`);

export type SimpleDefinition = Pick<Definition, `pinyin` | `definition`>;

export const simpleDefinitionLookup = (hanzi: string): SimpleDefinition => {
  const result = definitionLookup(hanzi, `s`)?.[0] ?? missingDefinitions[hanzi];
  invariant(result !== undefined, `couldn't find a definition for ${hanzi}`);
  return result;
};

// HACK: missing definitions from hanzijs
const missingDefinitions: Record<string, SimpleDefinition> = {
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
};

// TODO:
// - decomposeMany
// - ifComponentExists
// - dictionarySearch
// - getExamples
// - getPinyin
// - segment
// - getCharacterFrequency
// - determinePhoneticRegularity
// - getRadicalMeaning
// - getCharactersWithComponent
// - getPhoneticSet
// - getCharacterInFrequencyListByPosition
