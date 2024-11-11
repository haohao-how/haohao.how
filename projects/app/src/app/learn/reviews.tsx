import { QuizDeck } from "@/components/QuizDeck";
import { RectButton } from "@/components/RectButton";
import { useQueryOnce } from "@/components/ReplicacheContext";
import { IndexName, indexScan } from "@/data/marshal";
import { questionsForReview } from "@/data/query";
import { formatDuration } from "date-fns/formatDuration";
import { interval } from "date-fns/interval";
import { intervalToDuration } from "date-fns/intervalToDuration";
import { router } from "expo-router";
import { Text, View } from "react-native";

export default function ReviewsPage() {
  const questions = useQueryOnce(async (tx) => {
    return await questionsForReview(tx, {
      limit: 10,
      dueBeforeNow: true,
      // Look ahead at the next 50 skills, shuffle them and take 10. This way
      // you don't end up with the same set over and over again (which happens a
      // lot in development).
      sampleSize: 50,
    });
  });

  const nextSkillState = useQueryOnce(
    async (tx) =>
      (await indexScan(tx, IndexName.SkillStateByDue, 1)).map(
        ([, skillState]) => skillState,
      )[0],
  );

  return (
    <View className="flex-1 items-center pt-safe-offset-[20px]">
      {questions.loading ? (
        <View className="my-auto">
          <Text className="text-text">Loading…</Text>
        </View>
      ) : questions.error ? (
        <Text className="text-text">Oops something broken</Text>
      ) : questions.data.length > 0 ? (
        <View className="w-full max-w-[600px] flex-1 items-stretch">
          <QuizDeck questions={questions.data} />
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            gap: 16,
            alignItems: `center`,
            justifyContent: `center`,
            paddingLeft: 20,
            paddingRight: 20,
          }}
        >
          <Text style={{ color: `white`, fontSize: 30, textAlign: `center` }}>
            👏 You’re all caught up on your reviews!
          </Text>
          <GoHomeButton />
          {nextSkillState.loading ||
          nextSkillState.data === undefined ? null : (
            <Text style={{ color: `#AAA`, textAlign: `center` }}>
              Next review in{` `}
              {formatDuration(
                intervalToDuration(
                  interval(new Date(), nextSkillState.data.due),
                ),
              )}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const GoHomeButton = () => (
  <View style={{ height: 44 }}>
    <RectButton
      onPressIn={() => {
        router.push(`/`);
      }}
      color={`#333`}
    >
      <Text style={{ fontWeight: `bold`, color: `white`, fontSize: 20 }}>
        Back
      </Text>
    </RectButton>
  </View>
);
