import assert from "node:assert";
import test from "node:test";
import {
  marshalSkillJson,
  marshalSrsStateJson,
  unmarshalSkillJson,
  unmarshalSrsStateJson,
} from "./marshal";
import { Skill as Review, SkillType, SrsState, SrsType } from "./model";

// TODO: data generator fuzzy testing

void test(`Skill`, () => {
  const skill: Review = {
    type: SkillType.HanziWordToEnglish,
    hanzi: `火`,
    created: new Date(),
    srs: {
      type: SrsType.Null,
    },
    due: new Date(),
  };

  assert.deepStrictEqual(skill, unmarshalSkillJson(marshalSkillJson(skill)));
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
