import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { CircleButton } from "../components/CircleButton";
import { RootView } from "../components/RootView";

export default function IndexPage() {
  const [timesPressed, setTimesPressed] = useState(0);

  let textLog = "";
  if (timesPressed > 1) {
    textLog = timesPressed + "x onPress";
  } else if (timesPressed > 0) {
    textLog = "onPress";
  }

  return (
    <RootView backgroundColor="tomato" style={styles.container}>
      <Link href="/learn" asChild>
        <CircleButton />
      </Link>
      <StatusBar style="auto" />
    </RootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 12,
    justifyContent: "center",
  },
});
