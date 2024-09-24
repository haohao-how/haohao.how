import { CircleButton } from "@/components/CircleButton";
import { RootView } from "@/components/RootView";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";

export default function LearnPage() {
  return (
    <RootView style={styles.container}>
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
    gap: 8,
    alignItems: `center`,
    justifyContent: `center`,
  },
});
