import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={{ color: "green" }}>Hello world!</Text>
      <StatusBar style="auto" />
      <Text>Matt</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    color: "pink",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
