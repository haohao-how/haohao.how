import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { RootView } from "../../components/RootView";
import { CircleButton } from "../../components/CircleButton";

export default function LearnPage() {
  return (
    <RootView backgroundColor="red" style={styles.container}>
      <Link href="/" asChild>
        <CircleButton color="purple" />
      </Link>
      <StatusBar style="auto" />
    </RootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
