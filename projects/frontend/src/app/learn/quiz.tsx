import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FourUpQuiz } from "../../components/FourUpQuiz";
import { useReplicache } from "../../components/ReplicacheContext";
import { RootView } from "../../components/RootView";

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
          paddingTop: insets.top,
        }}
      >
        <View style={{ maxWidth: 600, flex: 1 }}>
          <FourUpQuiz
            questions={[
              {
                prompt: "Select the correct word for the character “dǔ”",
                choices: ["好", "爱", "别", "姆"],
                answer: "好",
                flag: FourUpQuiz.Flag.WeakWord,
              },
              {
                prompt: "Select the correct word for the character “dá”",
                choices: ["好", "爱", "别", "姆"],
                answer: "好",
                flag: FourUpQuiz.Flag.WeakWord,
              },
              {
                prompt: "Select the correct word for the character “d”",
                choices: ["好", "爱", "别", "姆"],
                answer: "好",
                flag: FourUpQuiz.Flag.WeakWord,
              },
              {
                prompt: "Select the correct word for the character “dǔ”",
                choices: ["好", "爱", "别", "姆"],
                answer: "好",
                flag: FourUpQuiz.Flag.WeakWord,
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
