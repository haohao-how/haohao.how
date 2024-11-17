import chunk from "lodash/chunk.js";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import OpenAI from "openai";
import { z } from "zod";

const radicals = JSON.parse(
  await readFile(
    join(import.meta.dirname, `../src/dictionary/radicals.jsonasset`),
    `utf8`,
  ),
) as { hanzi: string[]; name: string[] }[];

const dbLocation = import.meta.filename.replace(/\.[^.]+$/, `.db`);
console.log(`Using db: ${dbLocation}`);
const db = new DatabaseSync(dbLocation);

db.exec(`
  CREATE TABLE IF NOT EXISTS data(
    radical TEXT PRIMARY KEY,
    json TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  ) STRICT
`);

// Create a prepared statement to insert data into the database.
const insert = db.prepare(`INSERT INTO data (radical, json) VALUES (?, ?)`);
const queryOne = db.prepare(`SELECT * FROM data WHERE radical = ?`);
const queryAll = db.prepare(`SELECT * FROM data`);

const characterSchema = z.object({
  character: z.string(),
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
});

const batchResponse = z.array(characterSchema);

const openai = new OpenAI();

let maxRequests = 100;

// Make a list of all the radicals that aren't cached.
const radicalsToQuery = [];
for (const {
  hanzi,
  name: [name],
} of radicals) {
  for (const char of hanzi) {
    const result = queryOne.get(char) as
      | { radical: string; json: string; created_at: string }
      | undefined;
    if (result) {
      console.log(`Skipping ${char} (cached)`);
      continue;
    } else {
      radicalsToQuery.push({ char, name });
    }
  }
}

for (const batch of chunk(radicalsToQuery, 5)) {
  if (--maxRequests == 0) {
    break;
  }

  const chars = batch.map((b) => b.char);

  const completion = await openai.chat.completions.create({
    model: `gpt-4o-mini`,
    messages: [
      {
        role: `system`,
        content: `You are a Chinese tutor helping English students learn Chinese. Only respond in valid parsable JSON format.`,
      },
      {
        role: `user`,
        content: `
Create high-quality mnemonics for a Chinese character using the following detailed strategy. The mnemonics must encode the character's **pinyin initial**, **final**, **tone**, and **meaning**, while incorporating its **visual appearance**. Use the provided associations for initials and finals to ensure consistency. Follow these steps:

---

### **1. Theme and Associations**
Use a **Nature theme**:
- **Initials**: Represented by a person or pop-culture character based on the initial.
- **Finals**: Represented by a location, place, or environment based on the final.
- **Tone**: Encoded using an action, emotion, or motion:
  - **Tone 1 (flat)**: Calm, steady, or horizontal actions.
  - **Tone 2 (rising)**: Ascending, uplifting, or climbing actions.
  - **Tone 3 (fall-rise)**: Dipping and rising, bouncing, or scooping actions.
  - **Tone 4 (falling)**: Sharp, sudden, or downward actions.
  - **Tone 5 (neutral)**: Light, fleeting, or resting actions (e.g., "skipping lightly," "hovering gently," or "a quick pause").

---

### **2. Associations for Initials**
| Initial | Person/Pop-Culture Character |
|---------|-------------------------------|
| **b**   | Bilbo Baggins                |
| **p**   | Pocahontas                   |
| **m**   | Moana                        |
| **f**   | Frodo                        |
| **d**   | David Attenborough           |
| **t**   | Tarzan                       |
| **n**   | Nemo                         |
| **l**   | Legolas                      |
| **g**   | Gandalf                      |
| **k**   | King Kong                    |
| **h**   | Hagrid                       |
| **j**   | Jane Goodall                 |
| **q**   | Quasimodo                    |
| **x**   | Xena                         |
| **zh**  | Zeus                         |
| **ch**  | Chun-Li                      |
| **sh**  | Shrek                        |
| **r**   | Robin Hood                   |
| **z**   | Zorro                        |
| **c**   | Captain Planet               |
| **s**   | Simba                        |
| **y**   | Yoda                         |
| **w**   | Wonder Woman                 |

---

### **3. Associations for Finals**
| Final   | Location/Environment         |
|---------|-------------------------------|
| **-a**  | Savanna                      |
| **-o**  | Volcano                      |
| **-e**  | Glacier                      |
| **-ai** | Island                       |
| **-ei** | Cliffside                    |
| **-ao** | Waterfall                    |
| **-ou** | Canyon                       |
| **-an** | Wetlands                     |
| **-en** | Forest                       |
| **-ang**| Jungle                       |
| **-eng**| Mountain                     |
| **-ong**| Lagoon                       |
| **-i**  | Valley                       |
| **-u**  | Desert                       |
| **-ü**  | Rainforest                   |
| **-ian**| Meadow                       |
| **-uan**| Sand Dune                    |
| **-üan**| Bay                          |
| **-in** | Tundra                       |
| **-un** | Ocean                        |
| **-ün** | Misty Hills                  |
| **-ang**| Volcano Crater               |
| **-eng**| Steppe                       |
| **-ong**| Oasis                        |
| **-er** | Riverbend                    |

---

### **4. Structure of the Mnemonic**
Each mnemonic must:
1. Include a **vivid person or character** for the pinyin initial.
2. Reference a **location or environment** for the pinyin final.
3. Use an **action or motion** that matches the pinyin tone, including tone 5's neutral/light emphasis.
4. Incorporate the **character's meaning** as the central concept.
5. Reference the **visual appearance** of the character to aid recognition.
6. Be concise, memorable, and easy to visualize.

---

Generate mnemonics for the characters ${JSON.stringify(chars)}

---

Output in only JSON (no markdown wrapper) using the shape:

[
  {
    "character": "<insert character or radical>"
    "initial": "<insert initial and its association>",
    "final": "<insert final and its association>",
    "tone": "<insert tone and its description>",
    "meaning": "<insert meaning>",
    "mnemonics": [
      {
        "mnemonic": "<insert mnemonic>",
        "strategy": "<insert explanation of strategy>"
      }
      <insert 4 more variations>
    ]
  },
  ...
]
`,
      },
    ],
  });

  const batchDescription = chars.join(`,`);
  let rawJson = completion.choices[0]?.message.content;

  if (rawJson == null) {
    console.error(`Failed to get response for ${batchDescription}`);
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
    json = batchResponse.parse(JSON.parse(rawJson));
  } catch (e) {
    console.error(e);
    console.error(`Failed to parse JSON:`, rawJson);
    console.log(`Skipping…`);
    continue;
  }

  for (const result of json) {
    console.log(
      `Success for ${result.character}, mnemonics:\n${result.mnemonics.map((m) => `  - ${m.mnemonic}\n    (${m.strategy})`).join(`\n`)}`,
    );

    insert.run(result.character, JSON.stringify(result));
  }
}

{
  const rows = queryAll.all() as {
    radical: string;
    json: string;
    created_at: string;
  }[];

  // generate a typescript file with the mnemonics
  const ts = `[
  ${rows
    .map((row) => {
      const mns = characterSchema.parse(JSON.parse(row.json)).mnemonics;
      return JSON.stringify([row.radical, mns]);
    })
    .join(`,\n`)}
]
`;

  // Write ts to disk using async node fs APIs
  await writeFile(
    join(
      import.meta.dirname,
      `../src/dictionary/radicalPinyinMnemonics.jsonasset`,
    ),
    ts,
    `utf8`,
  );
}
