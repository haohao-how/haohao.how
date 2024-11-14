import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import z from "zod";

void test(`radical groups have the right number of elements`, async () => {
  // Data integrity test to ensure that the number of characters in each group
  // matches the expected range.
  const radicals = z
    .array(
      z.object({
        strokes: z.number(),
        range: z.tuple([z.number(), z.number()]),
        characters: z.array(z.string()),
      }),
    )
    .parse(
      JSON.parse(
        await readFile(
          join(
            import.meta.dirname,
            `../../../dictionary/radicalStrokes.jsonasset`,
          ),
          `utf8`,
        ),
      ),
    );

  for (const group of radicals) {
    assert(group.characters.length === group.range[1] - group.range[0] + 1);
  }
});
