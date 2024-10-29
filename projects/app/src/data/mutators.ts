import { nextReview, Rating, UpcomingReview } from "@/util/fsrs";
import { invariant } from "@haohaohow/lib/invariant";
import { MutatorDefs, Replicache } from "replicache";
import {
  MarshaledSkillId,
  MarshaledSkillStateKey,
  MarshaledSkillStateValue,
  marshalSkillId,
  marshalSkillReviewKey,
  marshalSkillReviewValue,
  marshalSkillStateKey,
  marshalSkillStateValue,
  Timestamp,
  unmarshalSkillReviewJson,
  unmarshalSkillStateJson,
} from "./marshal";
import { HanziSkill, SrsType } from "./model";

// Schema v2
//
// Skill Review: sr/<skillId>/<timestamp> { r: Rating }

// Schema v1
//
// Skill "current state", the current state of a skill.
//
// - `/s/he/<hanzi>`
// - `/s/hpi/<hanzi>`
// - `/s/hpf/<hanzi>`
// - `/s/hpt/<hanzi>`
// - `/s/eh/<hanzi>`
// - `/s/ph/<hanzi>`
// - `/s/ih/<hanzi>`
//
// Skill reviews, history of each time a skill was reviewed.
//
// - `sr/he/<hanzi>/<timestamp>` { r: Rating }
// - `sr/hpi/<hanzi>/<timestamp>`
//
// Notes:
// - no useless leading `/`

export const mutators = {
  async incrementCounter(tx, options?: { quantity?: number }) {
    const quantity = options?.quantity ?? 1;
    const counter = await tx.get<number>(`counter`);
    await tx.set(`counter`, (counter ?? 0) + quantity);
  },

  // TODO: rename to `skill review state` or something?
  async addSkillState(
    tx,
    {
      s: skillId,
      n: nowTimestamp,
    }: {
      s: MarshaledSkillId;
      n: Timestamp;
    },
  ) {
    const now = new Date(nowTimestamp);
    const key = marshalSkillStateKey(skillId);

    const existing = await tx.has(key);
    if (!existing) {
      await tx.set(
        key,
        marshalSkillStateValue({
          created: now,
          srs: null,
          due: now,
        }),
      );
    }
  },

  async reviewSkill(
    tx,
    {
      s: skillId,
      r: rating,
      n: nowTimestamp,
    }: { s: MarshaledSkillId; r: Rating; n: Timestamp },
  ) {
    // Save a record of the review.
    await tx.set(
      marshalSkillReviewKey(skillId, nowTimestamp),
      marshalSkillReviewValue({ rating }),
    );

    // TODO: perf? batch these?
    const reviews = await tx
      .scan({ prefix: `sr/${skillId}/` })
      .entries()
      .toArray();

    // should already be sorted given the key
    // reviews.sort(([k]) => k.split(`/`).length);
    // TODO: add invariant for debug mode

    let state: UpcomingReview | null = null;
    for (const review of reviews) {
      const [[, date], { rating }] = unmarshalSkillReviewJson(review);
      state = nextReview(state, rating, date);
    }

    invariant(state !== null);

    await tx.set(
      marshalSkillStateKey(skillId),
      marshalSkillStateValue({
        created: state.created,
        srs: {
          type: SrsType.FsrsFourPointFive,
          stability: state.stability,
          difficulty: state.difficulty,
        },
        due: state.due,
      }),
    );
  },

  //
  // Deprecated mutators
  //

  /**
   * @deprecated Use {@link mutators.reviewSkill} instead.
   *
   * Reasons:
   * - The key was the full state key not just the skill ID (which is more
   *   portable).
   * - It doesn't handle long offline periods, it doesn't splice together the
   *   reviews in the correct order, so if there's a delayed sync from one
   *   client its mutation will be treated like it was applied last. Instead the
   *   reviews should be stored individually and re-aggregated to a "current
   *   state" if a review is inserted before the latest.
   */
  async updateSkill(
    tx,
    {
      k: key,
      r: rating,
      n: nowTimestamp,
    }: { k: MarshaledSkillStateKey; r: Rating; n: Timestamp },
  ): Promise<void> {
    // TODO: make API to do this that handles the unmarshaling.
    const marshaledSkillState = await tx.get(key);
    if (marshaledSkillState === undefined) {
      return;
    }

    const [, skillState] = unmarshalSkillStateJson([key, marshaledSkillState]);

    const now = new Date(nowTimestamp);

    const lastFsrs =
      skillState.srs?.type === SrsType.FsrsFourPointFive
        ? skillState.srs
        : null;

    const { stability, difficulty } =
      lastFsrs ??
      nextReview(
        null,
        // Default initial rating, using `Rating.Again` or `Rating.Hard`
        // simulates getting it wrong the first time, and you need multiple
        // correct answers to work your way back up to "learned" level (the
        // level you would be if you answered `Rating.Good` on the first
        // attempt).
        //
        // This is done to mitigate the case where you could "accidentally" get
        // an answer correct on the first try.
        Rating.Again,
      );

    const s = nextReview(
      {
        created: skillState.created,
        stability,
        difficulty,
        due: skillState.due,
      },
      rating,
      now,
    );
    const value = marshalSkillStateValue({
      created: now,
      srs: {
        type: SrsType.FsrsFourPointFive,
        stability: s.stability,
        difficulty: s.difficulty,
      },
      due: s.due,
    });
    await tx.set(key, value);
  },

  /**
   * @deprecated Use {@link mutators.addSkillState} instead.
   *
   * Reasons:
   * - This is storing values instead of intent, which makes it harder to ensure
   *   backwards compatibility and conflict resolution (other than last write
   *   wins, but it's not even last write because we don't store the timestamp
   *   of the update).
   */
  async addSkill(
    tx,
    {
      s: [key, value],
    }: {
      s: [MarshaledSkillStateKey, MarshaledSkillStateValue];
    },
  ) {
    await tx.set(key, value);
  },
} satisfies MutatorDefs;

type HHReplicache = Replicache<typeof mutators>;

export async function addHanziSkill(r: HHReplicache, skill: HanziSkill) {
  await r.mutate.addSkillState({
    s: marshalSkillId(skill),
    n: Date.now(),
  });
}

export async function saveSkillRating(
  r: HHReplicache,
  skill: HanziSkill,
  rating: Rating,
) {
  await r.mutate.reviewSkill({
    n: Date.now(),
    s: marshalSkillId(skill),
    r: rating,
  });
}

export async function incrementCounter(r: HHReplicache) {
  await r.mutate.incrementCounter();
}
