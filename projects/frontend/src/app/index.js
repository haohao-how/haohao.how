import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";

export default function IndexPage() {
  return (
    <View style={styles.container}>
      <Text style={{ fontWeight: "bold", color: "white" }}>Hello, world!</Text>
      <Text style={{ fontWeight: "bold", color: "white" }}>👋 🤜🤛</Text>
      <Link href="/learn">Go to /learn</Link>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "tomato",
    alignItems: "center",
    justifyContent: "center",
  },
});
