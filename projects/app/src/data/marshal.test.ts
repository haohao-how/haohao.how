import assert from "node:assert";
import test from "node:test";
import {
  marshalSkillStateJson,
  marshalSrsStateJson,
  unmarshalSkillStateJson,
  unmarshalSrsStateJson,
} from "./marshal";
import { SkillState, SkillType, SrsState, SrsType } from "./model";

// TODO: data generator fuzzy testing

void test(`Skill`, () => {
  const skill = {
    type: SkillType.HanziWordToEnglish,
    hanzi: `火`,
  };

  const state: SkillState = {
    created: new Date(),
    srs: {
      type: SrsType.Null,
    },
    due: new Date(),
  };

  const x = [skill, state] as const;
  assert.deepStrictEqual(x, unmarshalSkillStateJson(marshalSkillStateJson(x)));
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
