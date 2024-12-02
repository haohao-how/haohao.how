import { invariant } from "@haohaohow/lib/invariant";
import makeDebug from "debug";
import assert from "node:assert";
import { join } from "node:path";
import yargs from "yargs";
import { loadHanziDecomposition } from "../src/dictionary/dictionary.js";
import { mergeMaps, sortComparatorString } from "../src/util/collections.js";
import { jsonStringifyIndentOneLevel } from "../src/util/json.js";
import { makeDbCache } from "./util/cache.js";
import { fetchWithCache } from "./util/fetch.js";
import { writeUtf8FileIfChanged } from "./util/fs.js";

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

const dbCache = makeDbCache(import.meta.filename, `fetch_cache`, debug);

const updates = new Map<string, string[]>();

// TODO: use https://github.com/cjkvi/cjkvi-ids/blob/master/ids-ext-cdef.txt for better licence?

const rawJson = await fetchWithCache(
  // `https://raw.githubusercontent.com/cjkvi/cjkvi-ids/refs/heads/master/ids.txt`,
  `https://raw.githubusercontent.com/cjkvi/cjkvi-ids/refs/heads/master/ids-ext-cdef.txt`,
  { dbCache },
);

let i = 0;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const tagLookup = {
  A: `Adobe Japan 1-6`,
  G: `China`,
  H: `Hong Kong`,
  J: `Japan`,
  K: `Korea`,
  M: `Macau`,
  O: `Obsolete`,
  S: `Singapore`,
  T: `Taiwan`,
  V: `Vietnam`,
  U: `Unicode`,
  X: `Virtual shape`,
};

for (const line of rawJson.split(`\n`)) {
  debug(`parsing line: %O`, line);

  if (line.startsWith(`#`) || line === ``) {
    continue;
  }

  const [unicodeShortIdentifier, character, ...decompositions] =
    line.split(`\t`);

  invariant(unicodeShortIdentifier != null);
  invariant(character != null);
  invariant(decompositions.length > 0);

  assert.match(unicodeShortIdentifier, /^U\+/);

  // Convert the U+ identifier to a Unicode character
  const codePoint = parseInt(unicodeShortIdentifier.replace(`U+`, ``), 16);
  const characterFromCodePoint = String.fromCodePoint(codePoint);

  assert.equal(character, characterFromCodePoint);

  const parsedDecompositions = [];

  for (const decomposition of decompositions) {
    const result = /^(?<ids>.+?)(\[(?<tags>.+?)\])?$/.exec(decomposition);
    invariant(
      result?.groups != null,
      `unknown decomposition syntax: ${decomposition}`,
    );
    const { ids, tags } = result.groups;
    invariant(ids != null);
    if (tags != null) {
      assert.match(tags, /[AGHJKMOSTUVX]+/);
    }
    parsedDecompositions.push({ ids, tags: tags?.split(``) });
  }

  const seenTags = new Set<string>();
  for (const { tags } of parsedDecompositions) {
    if (tags != null) {
      for (const tag of tags) {
        invariant(!seenTags.has(tag), `duplicate tag ${tag}`);
        seenTags.add(tag);
      }
    }
  }

  if (parsedDecompositions.length > 1) {
    debug(`multiple decompositions: %O`, parsedDecompositions);
  }

  // invariant(unicodeShortIdentifier.startsWith(`U+`));
  // invariant(character != null);
  // invariant(character.length > 0);
  // invariant(character.length < 3);
  // assert.equal(
  //   character.length,
  //   1,
  //   `character ${unicodeShortIdentifier} '${character}' length is not 1`,
  // );
  // invariant(character.length === 1);
  invariant(decompositions.length > 0);

  if (typeof line === `string`) {
    i++;
  }
}

console.log(`there are ${i} lines`);

if (argv[`force-write`] || updates.size > 0) {
  const existingData = await loadHanziDecomposition();

  const updatedData = [...mergeMaps(existingData, updates).entries()]
    // Sort the map for minimal diffs in PR
    .sort(sortComparatorString(([key]) => key));

  await writeUtf8FileIfChanged(
    join(
      import.meta.dirname,
      `../src/dictionary/hanziDecomposition.asset.json`,
    ),
    jsonStringifyIndentOneLevel(updatedData),
  );
}
