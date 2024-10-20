import { CircleButton } from "@/components/CircleButton";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";

export default function LearnPage() {
  return (
    <View style={styles.container}>
      <Link href="/" asChild>
        <CircleButton color="purple" />
      </Link>
      <StatusBar style="auto" />
    </View>
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
