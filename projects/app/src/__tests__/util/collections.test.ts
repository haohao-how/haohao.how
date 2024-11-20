import { sortComparatorNumber, sortComparatorString } from "@/util/collections";
import { invariant } from "@haohaohow/lib/invariant";
import assert from "node:assert";
import test from "node:test";

void test.skip(`type checks only`, () => {
  // @ts-expect-error without arguments it only works on string elements
  [`a`, `b`].sort(sortComparatorNumber());

  // @ts-expect-error without arguments it only works on string elements
  [1, 2].sort(sortComparatorString());
});

void test(`sortComparatorString`, () => {
  {
    const arr = [`c`, `a`, `b`];
    arr.sort(sortComparatorString());
    assert.deepEqual(arr, [`a`, `b`, `c`]);
  }

  {
    const arr = [[`c`], [`a`], [`b`]];
    arr.sort(sortComparatorString(([x]) => notNull(x)));
    assert.deepEqual(arr, [[`a`], [`b`], [`c`]]);
  }
});

const notNull = <T>(x: T): NonNullable<T> => {
  invariant(x != null, `expected not null`);
  return x;
};
