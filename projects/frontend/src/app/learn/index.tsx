import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { RootView } from "../../components/RootView";

export default function LearnPage() {
  return (
    <RootView backgroundColor="red" style={styles.container}>
      <Text style={{ fontWeight: "bold", color: "white" }}>Learn</Text>
      <Link href="/">To to /</Link>
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
