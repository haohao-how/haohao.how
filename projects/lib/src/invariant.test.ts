import test from "node:test";
import { invariant } from "./invariant.js";

test("invariant", () => {
  invariant(1 == 1);
});
