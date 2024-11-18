import {
  allHsk1Words,
  allHsk2Words,
  allHsk3Words,
  allRadicalsByStrokes,
  loadRadicalNameMnemonics,
  loadRadicals,
  loadWords,
} from "@/dictionary/dictionary";
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
  await loadWords();
  await loadRadicals();
});
