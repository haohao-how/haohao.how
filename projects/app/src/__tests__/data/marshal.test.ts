import {
  marshalSkillStateJson,
  marshalSrsStateJson,
  unmarshalSkillStateJson,
  unmarshalSrsStateJson,
} from "@/data/marshal";
import { Skill, SkillState, SkillType, SrsState, SrsType } from "@/data/model";
import assert from "node:assert/strict";
import test from "node:test";

void test(`Skill`, () => {
  const skill = {
    type: SkillType.HanziWordToEnglish,
    hanzi: `火`,
  } satisfies Skill;

  const state: SkillState = {
    created: new Date(),
    srs: {
      type: SrsType.Null,
    },
    due: new Date(),
  };

  const x = [skill, state] as const;
  assert.deepEqual(x, unmarshalSkillStateJson(marshalSkillStateJson(x)));
});

void test(`SrsState`, () => {
  const value: SrsState = {
    type: SrsType.Null,
  };

  assert.deepEqual(value, unmarshalSrsStateJson(marshalSrsStateJson(value)));
});
