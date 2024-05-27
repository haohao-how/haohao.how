import { QuizDeck, QuizDeckItemType } from "@/components/QuizDeck";
import { useReplicache } from "@/components/ReplicacheContext";
import { RootView } from "@/components/RootView";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function QuizPage() {
  const r = useReplicache();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(`r.clientID = ${r?.clientID ?? "<nullish>"}`);
  }, [r]);

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
          <QuizDeck
            items={[
              {
                type: QuizDeckItemType.OneCorrectPair,
                question: {
                  prompt: "Select the correct translation",
                  groupA: ["早", "燥", "澡", "凿", "遭"],
                  groupB: ["zao", "zāo", "záo", "zǎo", "zào"],
                  answer: ["早", "zǎo"],
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
            ]}
            onNext={(success) => {
              if (success) {
              }
            }}
          />
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
