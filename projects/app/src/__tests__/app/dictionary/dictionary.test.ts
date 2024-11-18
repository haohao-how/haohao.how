import {
  allHsk1Words,
  allHsk2Words,
  allHsk3Words,
  allRadicalPrimaryForms,
  allRadicalsByStrokes,
  loadRadicalNameMnemonics,
  loadRadicalPinyinMnemonics,
  loadRadicals,
  loadWords,
} from "@/dictionary/dictionary";
import { invariant } from "@haohaohow/lib/invariant";
import assert from "node:assert";
import test from "node:test";

void test(`radical groups have the right number of elements`, async () => {
  // Data integrity test to ensure that the number of characters in each group
  // matches the expected range.
  const radicalsByStrokes = await allRadicalsByStrokes();
  for (const [, group] of radicalsByStrokes.entries()) {
    assert(group.characters.length === group.range[1] - group.range[0] + 1);
  }
});

void test(`json data can be loaded and passes the schema validation`, async () => {
  await allHsk1Words();
  await allHsk2Words();
  await allHsk3Words();
  await loadRadicalNameMnemonics();
  await loadRadicalPinyinMnemonics();
  await loadWords();
  await loadRadicals();
  await allRadicalPrimaryForms();
});

void test(`there are 214 radicals to match official kangxi radicals`, async () => {
  const radicals = await loadRadicals();
  assert.equal(radicals.length, 214);
});

void test(`radical name mnemonics don't include radical alternatives`, async () => {
  const radicalNameMnemonics = await loadRadicalNameMnemonics();
  const primarySet = new Set(await allRadicalPrimaryForms());

  const radicalsWithNameMnemonics = new Set(radicalNameMnemonics.keys());

  assert.deepEqual(radicalsWithNameMnemonics.difference(primarySet), new Set());
});

void test(`radical pinyin mnemonics don't include radical alternatives`, async () => {
  const pinyinMnemonics = await loadRadicalPinyinMnemonics();
  const primarySet = new Set(await allRadicalPrimaryForms());

  const radicalsWithNameMnemonics = new Set(pinyinMnemonics.keys());

  assert.deepEqual(radicalsWithNameMnemonics.difference(primarySet), new Set());
});

void test(`radical data uses consistent unicode characters`, async () => {
  const primary = await allRadicalPrimaryForms();
  const primarySet = new Set(primary);

  {
    const violations = primary.filter(isNotCjkUnifiedIdeograph);
    assert.deepEqual(
      violations,
      [],
      await debugNonCjkUnifiedIdeographs(violations),
    );
  }

  {
    const sample = [...(await loadRadicalNameMnemonics()).keys()];
    assert.deepEqual(new Set(sample).difference(primarySet), new Set());
    assert.deepEqual(sample.filter(isNotCjkUnifiedIdeograph), []);
  }

  {
    const sample = (await allRadicalsByStrokes())
      .values()
      .flatMap((r) => r.characters);

    {
      const diff = new Set(sample).difference(primarySet);
      assert.deepEqual(
        diff,
        new Set(),
        await debugNonCjkUnifiedIdeographs([...diff]),
      );
    }
    assert.deepEqual([...sample].filter(isNotCjkUnifiedIdeograph), []);
  }
});

async function debugNonCjkUnifiedIdeographs(chars: string[]): Promise<string> {
  const swaps = [];

  for (const x of chars) {
    const unified = await kangxiRadicalToCjkRadical(x);
    const msg =
      unified == null
        ? `${x} -> ???`
        : `${x} (${x.codePointAt(0)?.toString(16)}) -> ${unified} (${unified.codePointAt(0)?.toString(16)})`;
    swaps.push(msg);
  }

  return swaps.join(`, `);
}

function isCjkUnifiedIdeograph(char: string): boolean {
  return char.charCodeAt(0) >= 0x4e00 && char.charCodeAt(0) <= 0x9fff;
}

function isNotCjkUnifiedIdeograph(char: string): boolean {
  return !isCjkUnifiedIdeograph(char);
}

async function kangxiRadicalToCjkRadical(
  kangxi: string,
): Promise<string | undefined> {
  const xCodePoint = kangxi.codePointAt(0);
  assert(xCodePoint != null);

  const { EquivalentUnifiedIdeograph } = await import(
    `ucd-full/EquivalentUnifiedIdeograph.json`
  );

  const newCodePoint = EquivalentUnifiedIdeograph.find((rule) => {
    const minHex = rule.range[0];
    const maxHex = rule.range[1] ?? rule.range[0];
    invariant(minHex != null);
    invariant(maxHex != null);

    const min = parseInt(minHex, 16);
    const max = parseInt(maxHex, 16);

    return xCodePoint >= min && xCodePoint <= max;
  })?.unified;

  if (newCodePoint != null) {
    return String.fromCodePoint(parseInt(newCodePoint, 16));
  }
}
