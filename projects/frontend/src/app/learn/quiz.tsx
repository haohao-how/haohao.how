import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import { FourUpQuiz } from "../../components/FourUpQuiz";
import { RootView } from "../../components/RootView";

export default function LearnPage() {
  return (
    <RootView backgroundColor="#161F23" style={styles.container}>
      <SafeAreaView
        style={{
          flex: 1,
          width: "100%",
          alignItems: "center",
          paddingTop: StatusBar.currentHeight,
        }}
      >
        <View
          style={{
            alignSelf: "stretch",
            justifyContent: "center",
            flex: 1,
            flexDirection: "row",
            margin: 10,
          }}
        >
          <View style={{ flex: 1, maxWidth: 600 }}>
            <FourUpQuiz />
          </View>
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
