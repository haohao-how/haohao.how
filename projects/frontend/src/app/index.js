import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Pressable, Text, View } from "react-native";
import { Link } from "expo-router";

export default function IndexPage() {
  const [timesPressed, setTimesPressed] = useState(0);

  let textLog = "";
  if (timesPressed > 1) {
    textLog = timesPressed + "x onPress";
  } else if (timesPressed > 0) {
    textLog = "onPress";
  }

  return (
    <View style={styles.container}>
      <Text style={{ fontWeight: "bold", color: "white" }}>Hello, world!</Text>
      <Text style={{ fontWeight: "bold", color: "white" }}>👋 🤜🤛</Text>
      <Link href="/learn">
        <Pressable
          onPress={() => {
            setTimesPressed((current) => current + 1);
          }}
          style={({ pressed }) => [
            {
              backgroundColor: pressed ? "rgb(210, 230, 255)" : "white",
            },
            styles.wrapperCustom,
          ]}
        >
          {({ pressed }) => (
            <Text style={styles.text} selectable={false}>
              {pressed ? "Release!" : "Go to /learn"}
            </Text>
          )}
        </Pressable>
      </Link>
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
  text: {
    fontSize: 16,
  },
  wrapperCustom: {
    borderRadius: 8,
    padding: 6,
  },
});
