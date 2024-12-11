import { IsEqual } from "@/util/types";

function typeChecks(..._args: unknown[]) {
  // This function is only used for type checking, so it should never be called.
}

typeChecks(`IsEqual`, () => {
  true satisfies IsEqual<`a`, `a`>;
  false satisfies IsEqual<`a`, `b`>;

  true satisfies IsEqual<`a` | undefined, `a` | undefined>;

  // @ts-expect-error object with a key isn't equal to empty object
  true satisfies IsEqual<{ key: `value` }, object>;
  false satisfies IsEqual<{ key: `value` }, object>;
  // @ts-expect-error unknown isn't equal to object
  true satisfies IsEqual<unknown, { key: `value` }>;
  false satisfies IsEqual<unknown, { key: `value` }>;
  // @ts-expect-error unknown isn't equal to string
  true satisfies IsEqual<unknown, `a`>;
  false satisfies IsEqual<unknown, `a`>;
  // @ts-expect-error object isn't equal to unknown
  true satisfies IsEqual<{ key: `value` }, unknown>;
  false satisfies IsEqual<{ key: `value` }, unknown>;
  // @ts-expect-error object isn't equal to never
  true satisfies IsEqual<{ key: `value` }, never>;
  false satisfies IsEqual<{ key: `value` }, never>;
});
