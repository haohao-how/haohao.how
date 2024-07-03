// don't allow an imports of types or marshalling etc.
import { MutatorDefs } from "replicache";

export const migrate = {
  async migrate1to2(tx) {
    // read all `/s/he/<hanzi>`
    // do something …
    await tx.get(`stub`);
  },
} satisfies MutatorDefs;
