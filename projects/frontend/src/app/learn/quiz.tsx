import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import { FourUpQuiz } from "../../components/FourUpQuiz";
import { RootView } from "../../components/RootView";

export default function QuizPage() {
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
            answer="好"
            flag={FourUpQuiz.Flag.WeakWord}
            choices={["好", "爱", "别", "姆"]}
            prompt="Select the correct word for the character “dǔ”"
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
