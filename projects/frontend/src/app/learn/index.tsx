import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { CircleButton } from "../../components/CircleButton";
import { RootView } from "../../components/RootView";

export default function LearnPage() {
  return (
    <RootView backgroundColor="red" style={styles.container}>
      <Link href="/" asChild>
        <CircleButton color="purple" />
      </Link>
      <CircleButton
        color="#333"
        onPress={() => {
          throw new Error("Hello, again, Sentry!");
        }}
      />
      <StatusBar style="auto" />
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