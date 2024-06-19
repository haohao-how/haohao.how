import { DeckItem, QuizDeck, QuizDeckItemType } from "@/components/QuizDeck";
import {
  Review,
  Skill,
  compactReviewSchema,
  decodeCompactReview,
  decodeHanziKeyedSkillKey,
  generateQuestionForSkill,
  useReplicache,
} from "@/components/ReplicacheContext";
import { RootView } from "@/components/RootView";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function QuizPage() {
  const r = useReplicache();
  const insets = useSafeAreaInsets();
  const [skills, setSkills] = useState<(readonly [Skill, Review])[]>();
  const [questions, setQuestions] = useState<readonly DeckItem[]>();

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(`r.clientID = ${r?.clientID ?? "<nullish>"}`);

    void r?.query(async (tx) => {
      {
        // eslint-disable-next-line no-console
        console.log("Next 10 skill reviews:");
        const now = new Date();
        const items = (
          await tx.scan({ prefix: "/s/he/", limit: 10 }).entries().toArray()
        )
          .map(
            ([key, review]) =>
              [
                decodeHanziKeyedSkillKey(key),
                compactReviewSchema
                  .transform(decodeCompactReview)
                  .parse(review),
              ] as const,
          )
          .filter(
            ([, review]) =>
              // Only include reviews that are due.
              review.due <= now,
          );
        setSkills(items);
      }
    });
  }, [r]);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(skills);
    const questions = skills?.map(([skill]) => generateQuestionForSkill(skill));
    if (questions !== undefined && questions.length > 0) {
      // eslint-disable-next-line no-console
      console.log(`setting questions to`, questions);
      setQuestions(questions);
    }
  }, [skills]);

  useEffect(() => {
    // HACK: Fallback questions for dev in case replicache is empty.
    const timeoutId = setTimeout(() => {
      setQuestions(
        (x) =>
          x ?? [
            {
              type: QuizDeckItemType.MultipleChoice,
              question: {
                prompt: "Select the correct word for the character “dǔ”",
                choices: ["好", "爱", "别", "姆"],
                answer: "好",
                flag: QuizDeck.Flag.WeakWord,
              },
            },
            {
              type: QuizDeckItemType.MultipleChoice,
              question: {
                prompt: "Select the correct word for the character “dá”",
                choices: ["好", "爱", "别", "姆"],
                answer: "好",
                flag: QuizDeck.Flag.WeakWord,
              },
            },
            {
              type: QuizDeckItemType.MultipleChoice,
              question: {
                prompt: "Select the correct word for the character “d”",
                choices: ["好", "爱", "别", "姆"],
                answer: "好",
                flag: QuizDeck.Flag.WeakWord,
              },
            },
            {
              type: QuizDeckItemType.MultipleChoice,
              question: {
                prompt: "Select the correct word for the character “dǔ”",
                choices: ["好", "爱", "别", "姆"],
                answer: "好",
                flag: QuizDeck.Flag.WeakWord,
              },
            },
          ],
      );
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <RootView backgroundColor="#161F23" style={styles.container}>
      <View
        style={{
          flex: 1,
          width: "100%",
          flexDirection: "row",
          justifyContent: "center",
          paddingTop: insets.top + 20,
        }}
      >
        <View
          style={{
            maxWidth: 600,
            flex: 1,
          }}
        >
          {questions === undefined ? (
            <Text>Loading…</Text>
          ) : (
            <QuizDeck
              items={questions}
              onNext={(success) => {
                if (success) {
                }
              }}
            />
          )}
        </View>
        <ExpoStatusBar style="auto" />
      </View>
    </RootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
