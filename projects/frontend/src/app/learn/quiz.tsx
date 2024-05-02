import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import { FourUpQuiz } from "../../components/FourUpQuiz";
import { useReplicache } from "../../components/ReplicacheContext";
import { RootView } from "../../components/RootView";

export default function QuizPage() {
  const r = useReplicache();

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(`r.clientID = ${r?.clientID ?? "<nullish>"}`);
  }, [r]);

  return (
    <RootView backgroundColor="#161F23" style={styles.container}>
      <SafeAreaView
        style={{
          flex: 1,
          width: "100%",
          flexDirection: "row",
          justifyContent: "center",
          paddingTop: StatusBar.currentHeight, // Necessary for Android
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
      </SafeAreaView>
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
