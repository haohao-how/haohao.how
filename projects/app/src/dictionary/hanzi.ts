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
