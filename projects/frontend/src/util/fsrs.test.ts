import { differenceInMilliseconds } from "date-fns/differenceInMilliseconds";
import { intervalToDuration } from "date-fns/intervalToDuration";
import assert from "node:assert";
import test, { TestContext } from "node:test";
import z from "zod";
import { Rating, UpcomingReview, nextReview } from "./fsrs";
import { RepeatedSequence2 } from "./types";

const expectedReviewSchema = z.object({
  stability: z.number(),
  difficulty: z.number(),
  delay: z
    .object({
      years: z.number(),
      months: z.number(),
      weeks: z.number(),
      days: z.number(),
      hours: z.number(),
      minutes: z.number(),
      seconds: z.number(),
    })
    .partial(),
});

const ratingSchema = z.nativeEnum(Rating);

testFsrsSequence([
  Rating.Again,
  {
    difficulty: 7.5455,
    stability: 0.5701,
    delay: { minutes: 1 },
  },
  Rating.Again,
  {
    difficulty: 7.5455,
    stability: 0.5701,
    delay: { minutes: 1 },
  },
  Rating.Again,
  {
    difficulty: 7.5455,
    stability: 0.5701,
    delay: { minutes: 1 },
  },
]);

testFsrsSequence([
  Rating.Hard,
  {
    difficulty: 6.3449,
    stability: 1.4436,
    delay: { minutes: 5 },
  },
  Rating.Hard,
  {
    difficulty: 7.13290854,
    stability: 1.44564795,
    delay: { minutes: 5 },
  },
  Rating.Hard,
  {
    difficulty: 7.89239117,
    stability: 1.4473489,
    delay: { minutes: 5 },
  },
]);

testFsrsSequence([
  Rating.Good,
  {
    difficulty: 5.1443,
    stability: 4.1386,
    delay: { minutes: 10 },
  },
  Rating.Good,
  {
    difficulty: 5.1443,
    stability: 4.1590269,
    delay: { days: 4 },
  },
  Rating.Good,
  {
    difficulty: 5.1443,
    stability: 14.75464525,
    delay: { days: 15 },
  },
  Rating.Good,
  {
    difficulty: 5.1443,
    stability: 48.09349819,
    delay: { months: 1, days: 17 },
  },
]);

testFsrsSequence([
  Rating.Easy,
  {
    difficulty: 3.9437,
    stability: 10.9355,
    delay: { days: 11 },
  },
  Rating.Easy,
  {
    difficulty: 3.15569146,
    stability: 97.63088827,
    delay: { days: 8, months: 3 },
  },
  Rating.Easy,
  {
    difficulty: 2.39620883,
    stability: 737.82134913,
    delay: { years: 2, days: 7 },
  },
]);

testFsrsSequence([
  Rating.Good,
  {
    difficulty: 5.1443,
    stability: 4.1386,
    delay: { minutes: 10 },
  },
  Rating.Good,
  {
    difficulty: 5.1443,
    stability: 4.1590269,
    delay: { days: 4 },
  },
  Rating.Hard,
  {
    difficulty: 5.97577026,
    stability: 6.47946732,
    delay: { days: 6 },
  },
  Rating.Hard,
  {
    difficulty: 6.7771413,
    stability: 9.30363048,
    delay: { days: 9 },
  },
  Rating.Hard,
  {
    difficulty: 7.5495027,
    stability: 12.68124312,
    delay: { days: 13 },
  },
]);

testFsrsSequence([
  Rating.Good,
  {
    difficulty: 5.1443,
    stability: 4.1386,
    delay: { minutes: 10 },
  },
  Rating.Again,
  {
    difficulty: 5.1443,
    stability: 4.1386,
    delay: { minutes: 1 },
  },
  Rating.Again,
  {
    difficulty: 5.1443,
    stability: 4.1386,
    delay: { minutes: 1 },
  },
  Rating.Easy,
  {
    difficulty: 4.31282974,
    stability: 4.14436918,
    delay: { days: 4 },
  },
]);

type ExpectedReview = z.TypeOf<typeof expectedReviewSchema>;

function ratingName(rating: Rating) {
  return {
    [Rating.Again]: "Again",
    [Rating.Hard]: "Hard",
    [Rating.Good]: "Good",
    [Rating.Easy]: "Easy",
  }[rating];
}

type FsrsSequence = RepeatedSequence2<[Rating, ExpectedReview]>;

/**
 * Create a test case for an FSRS sequence based on ratings.
 * @param sequence
 */
function testFsrsSequence(sequence: FsrsSequence) {
  const name = sequence
    .flatMap((x) => {
      const rating = ratingSchema.safeParse(x);
      return rating.success ? [ratingName(rating.data)] : [];
    })
    .join(" → ");

  void test(name, assertFsrsSequence(sequence));
}

function assertFsrsSequence(sequence: readonly (ExpectedReview | Rating)[]) {
  return function ({ mock }: TestContext) {
    mock.timers.enable({ apis: ["Date"] });

    let review: UpcomingReview | null = null;

    for (let i = 0; i < sequence.length; i += 2) {
      const rating = ratingSchema.parse(sequence[i + 0]);
      const expectedReview = expectedReviewSchema.parse(sequence[i + 1]);

      const lastReview: UpcomingReview | null = review;
      if (lastReview !== null) {
        mock.timers.tick(differenceInMilliseconds(lastReview.due, new Date()));
      }
      review = nextReview(lastReview, rating);

      if (lastReview !== null) {
        const lastReviewDue: Date = lastReview.due; // HACK: work around TS bug
        assert.deepStrictEqual(review.created, lastReviewDue);
      }

      assert.deepStrictEqual(
        {
          difficulty: review.difficulty,
          stability: review.stability,
          delay: intervalToDuration({ start: review.created, end: review.due }),
        },
        expectedReview,
      );
    }
  };
}
