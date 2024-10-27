import { kangxiRadicalsByStroke } from "@/dictionary/radicals";
import assert from "node:assert";
import test from "node:test";

void test(`radical groups have the right number of elements`, () => {
  // Data integrity test to ensure that the number of characters in each group
  // matches the expected range.
  for (const group of kangxiRadicalsByStroke) {
    assert(group.characters.length === group.range[1] - group.range[0] + 1);
  }
});
