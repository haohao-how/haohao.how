import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";

export default function LearnPage() {
  return (
    <View style={styles.container}>
      <Text style={{ fontWeight: "bold", color: "white" }}>Learn</Text>
      <Link href="/">To to /</Link>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "red",
    alignItems: "center",
    justifyContent: "center",
  },
});
