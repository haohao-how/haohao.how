import makeDebug from "debug";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import OpenAI from "openai";
import yargs from "yargs";
import { z } from "zod";
import {
  allRadicalPrimaryForms,
  loadRadicalNameMnemonics,
  lookupRadicalByHanzi,
} from "../src/dictionary/dictionary.js";
import { mergeMaps, sortComparatorString } from "../src/util/collections.js";
import { jsonStringifyIndentOneLevel } from "../src/util/json.js";
import { makeDbCache } from "./util/cache.js";
import { openAiWithCache } from "./util/openai.js";

const debug = makeDebug(`hhh`);

const argv = await yargs(process.argv.slice(2))
  .usage(`$0 [args]`)
  .option(`update`, {
    type: `string`,
    describe: `characters to explicitly update`,
    coerce: (x: string) => x.split(`,`).filter((x) => x !== ``),
  })
  .option(`debug`, {
    type: `boolean`,
    default: false,
  })
  .option(`force-write`, {
    type: `boolean`,
    default: false,
  })
  .strict()
  .parseAsync();

if (argv.debug) {
  makeDebug.enable(`${debug.namespace},${debug.namespace}:*`);
}

const dbCache = makeDbCache(import.meta.filename, `openai_chat_cache`, debug);

const openAiSchema = z.object({
  name: z.string(),
  radical: z.string(),
  mnemonics: z.array(
    z.object({
      mnemonic: z.string(),
      reasoning_steps: z.array(z.string()),
    }),
  ),
});

const openai = new OpenAI();

const radicalsToCheck = argv.update ?? [
  ...new Set((await loadRadicalNameMnemonics()).keys()).difference(
    new Set(await allRadicalPrimaryForms()),
  ),
];

console.log(`Radicals to check: ${[...radicalsToCheck].join(`,`)}`);

const decompositions: Record<string, string> = {
  无: `⿱一尢`,
};

const updates = new Map<string, { mnemonic: string; rationale: string }[]>();

for (const hanzi of radicalsToCheck) {
  const name = (await lookupRadicalByHanzi(hanzi))?.name[0];
  if (name == null) {
    console.warn(`No name lookup data for ${hanzi}, skipping…`);
    continue;
  }

  const decomposition = decompositions[hanzi];
  if (decomposition == null) {
    console.warn(`No decomposition for ${hanzi}, skipping…`);
    continue;
  }

  const rawJson = await openAiWithCache(
    {
      model: `gpt-4o`,
      messages: [
        {
          role: `system`,
          content: `You are a Chinese tutor helping English students learn Chinese.`,
        },
        {
          role: `user`,
          content: `
Create a mnemonic to help remember that the name of the Chinese radical ${hanzi} is "${name}".

Use the following strategy:

**1. Analyze the radical components**

- The radical is composed as ${decomposition}. 
- Write a description of the layout of the sub-radicals.
- For each component, list out separately:
  - **Name:** <insert>
  - **Meaning:** <insert>
  - **Position:** <insert>
  - **Visual depictions:** (if this component was a sketch what might it be of (take into account its position relative to other components, for example 八 at the top could be a chimney, but at the bottom might be a rocket nozzle))
    - <insert description 1>
    - ...
    - <insert description 5>

**2. Best practices for mnemonics**

- Link together one of the visual depictions of each component.
- The story should be something that someone could picture in their head.
- Make it clear why (given its components) the radical's name makes sense.
- Don't make the mnemonics too long, shorter can be easier to remember.
- Be sure to include the exact name of the radical (i.e. "${name}")
- Explain the logical steps in creating the mnemonic.

---

Write 10 mnemonic variations for ${hanzi} (${name}).
`,
        },
      ],
      response_format: {
        type: `json_schema`,
        json_schema: {
          name: `radical_mnemonics`,
          schema: {
            type: `object`,
            properties: {
              radical: { type: `string` },
              name: { type: `string` },
              mnemonics: {
                type: `array`,
                items: {
                  type: `object`,
                  properties: {
                    mnemonic: { type: `string` },
                    reasoning_steps: {
                      type: `array`,
                      items: { type: `string` },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    { dbCache, openai },
  );

  try {
    const json = openAiSchema.parse(JSON.parse(rawJson));

    updates.set(
      hanzi,
      json.mnemonics.map((m) => ({
        mnemonic: m.mnemonic,
        rationale: m.reasoning_steps.join(`\n`),
      })),
    );
    console.log(
      `Success for ${hanzi} (${name}), mnemonics:\n${json.mnemonics.map((m) => `  - ${m.mnemonic}\n    Rationale:\n${m.reasoning_steps.map((x, i) => `    ${i + 1}. ${x}`).join(`\n`)}`).join(`\n`)}`,
    );
  } catch (e) {
    console.error(`Failed to parse response, skipping…`, e);
    continue;
  }
}

if (argv[`force-write`] || updates.size > 0) {
  const existingData = await loadRadicalNameMnemonics();

  const updatedData = [...mergeMaps(existingData, updates).entries()]
    // Sort the map for minimal diffs in PR
    .sort(sortComparatorString(([key]) => key));

  await writeFile(
    join(
      import.meta.dirname,
      `../src/dictionary/radicalNameMnemonics.asset.json`,
    ),
    jsonStringifyIndentOneLevel(updatedData),
    `utf8`,
  );
}
