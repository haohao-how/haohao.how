import { useFonts } from "expo-font";
import { Link } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CircleButton } from "../components/CircleButton";
import { RootView } from "../components/RootView";

export default function IndexPage() {
  const [fontsLoaded, fontError] = useFonts({
    "MaShanZheng-Regular": require("../../assets/fonts/MaShanZheng-Regular.ttf"),
    "NotoSerifSC-Medium": require("../../assets/fonts/NotoSerifSC-Medium.otf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <RootView
      backgroundColor="tomato"
      onLayout={onLayoutRootView}
      style={styles.container}
    >
      <View style={{ position: "absolute", top: 100, flexDirection: "row" }}>
        <Text style={[{ fontFamily: "MaShanZheng-Regular" }, styles.text]}>
          好
        </Text>
        <Text> </Text>
        <Text style={[{ fontFamily: "NotoSerifSC-Medium" }, styles.text]}>
          好
        </Text>
        <Text> </Text>
        <Text style={styles.text}>好</Text>
      </View>
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
  text: {
    color: "white",
    fontSize: 72,
  },
});
