import assert from "node:assert";
import test from "node:test";
import {
  marshalReviewJson,
  marshalSrsStateJson,
  unmarshalReviewJson,
  unmarshalSrsStateJson,
} from "./marshal";
import { Review, SrsState, SrsType } from "./model";

// TODO: data generator fuzzy testing

void test(`Review`, () => {
  const review: Review = {
    created: new Date(),
    srs: {
      type: SrsType.Null,
    },
    due: new Date(),
  };

  assert.deepStrictEqual(
    review,
    unmarshalReviewJson(marshalReviewJson(review)),
  );
});

void test(`SrsState`, () => {
  const value: SrsState = {
    type: SrsType.Null,
  };

  assert.deepStrictEqual(
    value,
    unmarshalSrsStateJson(marshalSrsStateJson(value)),
  );
});
