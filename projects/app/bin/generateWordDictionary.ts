// eslint-disable-next-line no-restricted-imports
import hanzi from "hanzi";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { hsk1Words, hsk2Words, hsk3Words } from "../src/dictionary/words.js";
import "../src/typings/hanzi.d.ts";

hanzi.start();

interface SimpleDefinition {
  pinyin: string;
  definition: string;
}

const definitions = new Map<string, SimpleDefinition>();

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
  在家: {
    definition: `at home`,
    pinyin: `zài jiā`,
  },
  放到: {
    definition: `to put`,
    pinyin: `fàng dào`,
  },
  红酒: {
    definition: `red wine`,
    pinyin: `hóng jiǔ`,
  },
  交费: {
    definition: `to pay`,
    pinyin: `jiāo fèi`,
  },
};

const missing: string[] = [];

for (const word of [...hsk1Words, ...hsk2Words, ...hsk3Words]) {
  const result =
    hanzi.definitionLookup(word, `s`)?.[0] ?? missingDefinitions[word] ?? null;
  if (result == null) {
    missing.push(word);
    continue;
  }
  const { pinyin, definition } = result;
  definitions.set(word, { pinyin, definition });
}

if (missing.length > 0) {
  throw new Error(`Missing definitions for: ${missing.join(`,`)}`);
}

// Write ts to disk using async node fs APIs
await writeFile(
  join(import.meta.dirname, `../src/dictionary/words.jsonasset`),
  JSON.stringify([...definitions.entries()]),
  `utf8`,
);
