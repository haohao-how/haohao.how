import { invariant } from "@haohaohow/lib/invariant";
import makeDebug from "debug";
import { join } from "node:path";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import yargs from "yargs";
import { z } from "zod";
import {
  loadMmPinyinChart,
  loadMnemonicThemeChoices,
} from "../src/dictionary/dictionary.js";
import {
  deepTransform,
  merge,
  sortComparatorString,
} from "../src/util/collections.js";
import { makeDbCache } from "./util/cache.js";
import { writeUtf8FileIfChanged } from "./util/fs.js";
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
  .version(false)
  .strict()
  .parseAsync();

if (argv.debug) {
  makeDebug.enable(`${debug.namespace},${debug.namespace}:*`);
}

const pinyinChart = await loadMmPinyinChart();

const dbCache = makeDbCache(import.meta.filename, `openai_chat_cache`, debug);

const openAiSchema = z.object({
  result: z.array(
    z.object({
      pinyinInitial: z.string(),
      characterSuggestions: z.array(
        z.object({ fullName: z.string(), description: z.string() }),
      ),
    }),
  ),
});

const openai = new OpenAI();

const updates = new Map<string, Map<string, Map<string, string>>>();

const themes = {
  WesternCultureFamousWomen: {
    noun: `person`,
    description: `famous females in western culture (e.g. actresses, influencers, celebrities, politicians, etc)`,
  },
  WesternCultureFamousMen: {
    noun: `person`,
    description: `famous males in western culture (e.g. actors, influencers, celebrities, politicians, etc)`,
  },
  GreekMythologyCharacter: {
    noun: `character`,
    description: `Greco-Roman mythology characters (e.g. gods, heroes, monsters, etc)`,
  },
  AnimalSpecies: {
    noun: `animal`,
    description: `animal species (e.g. zebra, dog, orangutan, etc)`,
  },
} as const;

const themeIds = Object.keys(themes) as (keyof typeof themes)[];

const themeAssociations = {
  [`-i`]: `WesternCultureFamousWomen`,
  [`-u`]: `AnimalSpecies`,
  [`-ü`]: `GreekMythologyCharacter`,
  [`basic`]: `WesternCultureFamousMen`,
  // other options
  // male musician
  // female musician
  // male actor
  // female actress
  // male historical politican
  // female historial politician
} satisfies Record<string, keyof typeof themes>;

// example tone associations
// 1: window
// 2: inner door
// 3: inside
// 4: outer door
// 5: toilet
// 6: outside.

const groupIds = Object.keys(
  themeAssociations,
) as (keyof typeof themeAssociations)[];

for (const groupId of groupIds) {
  if (argv.update && !argv.update.includes(groupId)) {
    continue;
  }

  for (const themeId of themeIds) {
    const group = pinyinChart.initialGrouping[groupId];
    invariant(group != null, `Missing group for ${groupId}`);

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
I'm creating a mnemonic system to help me remember Pinyin initials. For each Pinyin initial I want to pick a ${themes[themeId].noun} to associate it with. (then I'll create short stories about the ${themes[themeId].noun} to help remember the pinyin). 

I've split the initials into groups and assigned a unique theme to each:

${Object.entries(themes)
  .map(
    ([themeId, theme]) =>
      `- Theme ID: ${JSON.stringify(themeId)}\n  Theme Description: ${theme.description}`,
  )
  .join(`\n`)}

There are some important constraints:

- I need to imagine each ${themes[themeId].noun} visually in my mind, so they should feature in news/movies/tv/videos.
- It should be obvious which theme/group each ${themes[themeId].noun} fits into, so avoid ambiguous ones.
- It's important that I pick a ${themes[themeId].noun} that is meaningful to me, so I want to have a lot of choices to select from.

I want to start with group ${JSON.stringify(groupId)} using theme ${JSON.stringify(themeId)}. The items in this group are:

${group.initials.map((i) => `- ${JSON.stringify(i)}`).join(`\n`)}

For each item, give me 20 ${themes[themeId].noun} to choose from.
`,
          },
        ],
        response_format: zodResponseFormat(openAiSchema, `schema`),
      },
      { dbCache, openai, debug },
    );

    try {
      const r = openAiSchema.parse(JSON.parse(rawJson));
      updates.set(
        themeId,
        new Map(
          r.result.map(
            (x) =>
              [
                x.pinyinInitial,
                new Map(
                  x.characterSuggestions.map(
                    (c) => [c.fullName, c.description] as const,
                  ),
                ),
              ] as const,
          ),
        ),
      );
      console.log(`result for ${groupId} (${themeId}):`);
      console.log(JSON.stringify(r, null, 2));
    } catch (e) {
      console.error(`Failed to parse response for ${groupId}, skipping…`, e);
      continue;
    }
  }
}

if (argv[`force-write`] || updates.size > 0) {
  const existingData = await loadMnemonicThemeChoices();

  const updatedData = deepTransform(merge(existingData, updates), (x) =>
    x instanceof Map
      ? Object.fromEntries(
          [...x.entries()].sort(sortComparatorString(([k]) => k as string)),
        )
      : x,
  );

  await writeUtf8FileIfChanged(
    join(
      import.meta.dirname,
      `../src/dictionary/mnemonicThemeChoices.asset.json`,
    ),
    JSON.stringify(updatedData, null, 1),
  );
}
