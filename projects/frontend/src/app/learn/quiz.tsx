import { QuizDeck } from "@/components/QuizDeck";
import { RectButton } from "@/components/RectButton";
import { useQueryOnce } from "@/components/ReplicacheContext";
import { RootView } from "@/components/RootView";
import { generateQuestionForSkill } from "@/data/generator";
import { unmarshalSkillStateJson } from "@/data/marshal";
import { formatDuration } from "date-fns/formatDuration";
import { interval } from "date-fns/interval";
import { intervalToDuration } from "date-fns/intervalToDuration";
import { router } from "expo-router";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function QuizPage() {
  const insets = useSafeAreaInsets();

  const questions = useQueryOnce(async (tx) => {
    const now = new Date();
    return (await tx.scan({ prefix: `s/`, limit: 10 }).entries().toArray())
      .map(unmarshalSkillStateJson)
      .filter(([, state]) => state.due <= now)
      .map(([skill]) => generateQuestionForSkill(skill));
  });

  const nextSkillState = useQueryOnce(
    async (tx) =>
      (await tx.scan({ prefix: `s/`, limit: 1 }).entries().toArray())
        .map(unmarshalSkillStateJson)
        .map(([, skillState]) => skillState)[0],
  );

  return (
    <RootView backgroundColor="#161F23" style={styles.container}>
      <View
        style={{
          flex: 1,
          width: `100%`,
          flexDirection: `row`,
          justifyContent: `center`,
          paddingTop: insets.top + 20,
        }}
      >
        <View
          style={{
            maxWidth: 600,
            flex: 1,
          }}
        >
          {questions.loading ? (
            <Text>Loading…</Text>
          ) : questions.error ? (
            <Text>Oops something broken</Text>
          ) : questions.data.length > 0 ? (
            <QuizDeck
              questions={questions.data}
              onNext={(success) => {
                if (success) {
                }
              }}
            />
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
              <Text
                style={{ color: `white`, fontSize: 30, textAlign: `center` }}
              >
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
        <ExpoStatusBar style="auto" />
      </View>
    </RootView>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 8,
    alignItems: `center`,
    justifyContent: `center`,
  },
});
