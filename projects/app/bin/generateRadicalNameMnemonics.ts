import { invariant } from "@haohaohow/lib/invariant";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import OpenAI from "openai";
import { z } from "zod";
import {
  allRadicalPrimaryForms,
  allRadicals,
} from "../src/dictionary/dictionary.js";
import { jsonStringifyIndentOneLevel } from "../src/util/json.js";

const dbLocation = import.meta.filename.replace(/\.[^.]+$/, `.db`);
console.log(`Using db: ${dbLocation}`);
const db = new DatabaseSync(dbLocation);

db.exec(`
  CREATE TABLE IF NOT EXISTS data2(
    radical TEXT PRIMARY KEY,
    json TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  ) STRICT
`);

// Create a prepared statement to insert data into the database.
const insert = db.prepare(`INSERT INTO data2 (radical, json) VALUES (?, ?)`);
const queryOne = db.prepare(`SELECT * FROM data2 WHERE radical = ?`);
const queryAll = db.prepare(`SELECT * FROM data2`);

const schema = z.object({
  name: z.string(),
  meaning: z.string(),
  mnemonics: z.array(
    z.object({
      mnemonic: z.string(),
      rationale: z.string(),
    }),
  ),
});

const openai = new OpenAI();

for (const {
  hanzi: [char],
  name: [name],
} of await allRadicals()) {
  invariant(char != null);
  const result = queryOne.get(char) as
    | { radical: string; json: string; created_at: string }
    | undefined;
  if (result) {
    console.log(`Skipping ${char} (cached)`);
    continue;
  }

  const completion = await openai.chat.completions.create({
    model: `gpt-4o-mini`,
    messages: [
      {
        role: `system`,
        content: `You are a Chinese tutor helping English students learn Chinese.`,
      },
      {
        role: `user`,
        content: `
The task is to create some high quality mnemonics for Chinese characters. Characteristics of high quality mnemonics are:

- It includes the character's name and creates a strong association to the character.
- It considers aspects that make it uniquely to avoid confusion with other similar characters.
- It includes similar-looking characters if their meaning is relevant and helpful for remembering.
- It is short and concise, ideally just one sentence.
- It doesn't include the character ${JSON.stringify(char)} itself.

For example if the character is "玉" a good mnemonic would be:

  > Imagine a beautiful jade jewel attached to the base of a king's crown".

This is good because it ties together the meaning of the character, the character's visual appearance, and the related character 王.

---

Now you need to come up with a good mnemonic for the Chinese radical ${JSON.stringify(char)} (meaning ${JSON.stringify(name?.[0])}).

Here's some steps you could follow:

1. Give the English name of the Chinese radical ${JSON.stringify(char)} and explain its meaning.
2. What characters look similar that beginners might confuse it with?
3. Describe the visual appearance of ${JSON.stringify(char)}, emphasise distinctive elements.
4. Then brainstorm 10 mnemonics that combine everything together and adhere to the high quality characteristics.

Output in the format:

{
  "name": string,
  "meaning": string,
  "mnemonics": {
    "mnemonic": string,
    "rationale": string
  }[]
}
`,
      },
    ],
  });

  let rawJson = completion.choices[0]?.message.content;

  if (rawJson == null) {
    console.error(`Failed to get response for ${char} (${name})`);
    console.log(`Skipping…`);
    continue;
  }

  rawJson = rawJson
    // fix strings ending in smart quote
    .replace(/”\n/g, `"\n`)
    // fix lines ending in double quote that are missing a trailing comma
    .replace(/"(\n\s+")/g, `",$1`);

  let json;
  try {
    json = schema.parse(JSON.parse(rawJson));
  } catch (e) {
    console.error(e);
    console.error(`Failed to parse JSON:`, rawJson);
    console.log(`Skipping…`);
    continue;
  }

  console.log(
    `Success for ${char} (${name}), mnemonics:\n${json.mnemonics.map((m) => `  - ${m.mnemonic}\n    (${m.rationale})`).join(`\n`)}`,
  );

  insert.run(char, JSON.stringify(json));
}

{
  const rows = queryAll.all() as {
    radical: string;
    json: string;
    created_at: string;
  }[];

  const primaryRadicalSet = new Set(await allRadicalPrimaryForms());

  // generate a typescript file with the mnemonics
  const ts = jsonStringifyIndentOneLevel(
    rows
      .filter((row) => primaryRadicalSet.has(row.radical))
      .map((row) => {
        const mns = (JSON.parse(row.json) as z.TypeOf<typeof schema>).mnemonics;
        return [row.radical, mns];
      }),
  );

  // Write ts to disk using async node fs APIs
  await writeFile(
    join(
      import.meta.dirname,
      `../src/dictionary/radicalNameMnemonics.asset.json`,
    ),
    ts,
    `utf8`,
  );
}
