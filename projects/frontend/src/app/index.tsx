import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Pressable, Text, View, Platform } from "react-native";
import { Link } from "expo-router";
import { RootView } from "../components/RootView";
import { Image } from "expo-image";
import { CircleButton } from "../components/CircleButton";

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
