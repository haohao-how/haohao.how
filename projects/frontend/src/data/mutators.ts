import { Rating, nextReview } from "@/util/fsrs";
import { MutatorDefs, Replicache } from "replicache";
import {
  MarshaledSkill,
  MarshaledSkillKey,
  hanziSkillToKey,
  marshalSkill,
  marshalSkillJson,
  unmarshalSkillJson,
} from "./marshal";
import { HanziSkillKey, SrsType } from "./model";

// Schema
//
// Version 2
//
// Changes:
//
// - Move
//
// Version 1
//
// - `/s/he/<hanzi>`
// - `/s/hpi/<hanzi>`
// - `/s/hpf/<hanzi>`
// - `/s/hpt/<hanzi>`
// - `/s/eh/<hanzi>`
// - `/s/ph/<hanzi>`
// - `/s/ih/<hanzi>`

export const mutators = {
  async incrementCounter(tx, options?: { quantity?: number }) {
    const quantity = options?.quantity ?? 1;
    const counter = await tx.get<number>(`counter`);
    await tx.set(`counter`, (counter ?? 0) + quantity);
  },

  async addSkill(
    tx,
    {
      s: [key, value],
    }: {
      // TODO: this isn't just storing the intent, it's storing specific values,
      // is that okay? maybe… IDs need to be passed through, mutators should be
      // deterministic (but doesn't mean client/server need to be the same).
      s: MarshaledSkill;
    },
  ) {
    // TODO: check if it's already been added by another client
    await tx.set(key, value);
  },

  // TODO: rename to "skill reviewed" or something more declarative of the
  // intent so ti's not just last write wins.
  async updateSkill(
    tx,
    {
      k: key,
      r: rating,
      n: nowTimestamp,
    }: { k: MarshaledSkillKey; r: Rating; n: number },
  ): Promise<void> {
    const skillValue = await tx.get(key);
    if (skillValue === undefined) {
      return;
    }

    const skill = unmarshalSkillJson([key, skillValue]);
    if (skill.srs.type !== SrsType.FsrsFourPointFive) {
      return;
    }

    const now = new Date(nowTimestamp);

    // - TODO: check that the last state created before this result.
    // - TODO: store the results a separate key prefix and recalculate to merge
    //   the results each time a new result is created.
    const s = nextReview(
      {
        created: skill.created,
        stability: skill.srs.stability,
        difficulty: skill.srs.difficulty,
        due: skill.due,
      },
      rating,
      now,
    );
    const [, value] = marshalSkillJson({
      ...skill,
      created: now,
      srs: {
        type: SrsType.FsrsFourPointFive,
        stability: s.stability,
        difficulty: s.difficulty,
      },
      due: s.due,
    });
    // eslint-disable-next-line no-console
    console.log(`updating ${key} to `, value);
    await tx.set(key, value);
  },
} satisfies MutatorDefs;

// TODO: ban new Date() (with no args) in this file.

// TODO: function to wrap all mutators to do the schema version check first?

type HHReplicache = Replicache<typeof mutators>;

export async function addHanziSkill(r: HHReplicache, skill: HanziSkillKey) {
  const now = new Date();
  const { stability, difficulty } = nextReview(null, Rating.Again, now);

  await r.mutate.addSkill({
    s: marshalSkill({
      ...skill,
      created: now,
      srs: {
        type: SrsType.FsrsFourPointFive,
        stability,
        difficulty,
      },
      due: now,
    }),
  });
}

export async function saveSkillRating(
  r: HHReplicache,
  skill: HanziSkillKey,
  rating: Rating,
) {
  await r.mutate.updateSkill({
    n: Date.now(),
    k: hanziSkillToKey(skill),
    r: rating,
  });
}

export async function incrementCounter(r: HHReplicache) {
  await r.mutate.incrementCounter();
}
