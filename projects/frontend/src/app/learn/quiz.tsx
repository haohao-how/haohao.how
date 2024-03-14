import { Image } from "expo-image";
import { router } from "expo-router";
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
          alignItems: "center",
          paddingTop: StatusBar.currentHeight, // Necessary for Android
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
          <View style={{ flex: 1, maxWidth: 600, gap: 20 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 24 }}
            >
              <Image
                source={require("../../../assets/cog.svg")}
                style={{ flexShrink: 1, width: 33, height: 33 }}
              />
              <View
                style={{
                  backgroundColor: "#3A464E",
                  height: 16,
                  flex: 1,
                  borderRadius: 8,
                }}
              >
                <View
                  style={{
                    backgroundColor: "#3F4CF5",
                    height: 16,
                    width: "80%",
                    flex: 1,
                    borderRadius: 8,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#6570F6",
                      height: 5,
                      marginLeft: 8,
                      marginRight: 8,
                      marginTop: 4,
                      borderRadius: 2,
                    }}
                  ></View>
                </View>
              </View>
            </View>

            <FourUpQuiz
              answer="好"
              flag={FourUpQuiz.Flag.WeakWord}
              choices={["好", "爱", "别", "姆"]}
              prompt="Select the correct word for the character “dǔ”"
              onNext={(success) => {
                if (success) {
                  router.push("/");
                }
              }}
            />
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
