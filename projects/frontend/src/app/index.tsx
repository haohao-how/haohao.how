import { useFonts } from "expo-font";
import { Link } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useCallback } from "react";
import {
  ColorValue,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CircleButton } from "../components/CircleButton";
import { RootView } from "../components/RootView";
import {
  SectionHeaderButton,
  SectionHeaderButtonProps,
} from "../components/SectionHeaderButton";

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
      <SafeAreaView
        style={{
          flex: 1,
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: StatusBar.currentHeight,
        }}
      >
        <ScrollView style={{ flex: 1 }}>
          <View
            style={{
              justifyContent: "center",
              flexDirection: "row",
            }}
          >
            <Text style={[{ fontFamily: "MaShanZheng-Regular" }, styles.text]}>
              好好好
            </Text>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              padding: 10,
            }}
          >
            <Section
              title="Section 4, Unit 1"
              subtitle="Chat over dinner, communicate travel issues, describe people, talk about people"
              color="#53ADF0"
            />
            <Section
              title="Section 4, Unit 2"
              subtitle="Identify tableware, describe health issues, refer to body parts, refer to colors"
              color="#EF8CCD"
            />
            <Section
              title="Section 4, Unit 3"
              subtitle="Ask someone out, shop for clothes, talk about the weather, discuss sport events"
              color="#78C93D"
            />
            <Section
              title="Section 4, Unit 4"
              subtitle="Talk about seasons, describe travel needs, make plans, talk about hobbies"
              color="#F19B38"
            />
            <Section
              title="Section 4, Unit 5"
              subtitle="Communicate at school, talk about habits, express feelings, describe the environment"
              color="#E95952"
            />
            <Section
              title="Section 4, Unit 6"
              subtitle="Learn useful phrases, discuss communication, refer to business documents, tell time"
              color="#78C93D"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
      <ExpoStatusBar style="auto" />
    </RootView>
  );
}

const Section = ({
  title,
  color,
  subtitle,
}: Pick<SectionHeaderButtonProps, "title" | "subtitle" | "color">) => {
  const disabledColor: ColorValue = "#AAA";
  return (
    <>
      <SectionHeaderButton
        title={title}
        subtitle={subtitle}
        color={color}
        style={{
          width: "100%",
        }}
      />
      <Link href="/learn" asChild>
        <CircleButton color={color} />
      </Link>
      <CircleButton
        color={disabledColor}
        style={{ transform: [{ translateX: 20 }] }}
      />
      <CircleButton color={disabledColor} />
      <CircleButton
        color={disabledColor}
        style={{ transform: [{ translateX: -20 }] }}
      />
      <CircleButton color={disabledColor} />
      <View style={{ height: 50 }} />
    </>
  );
};

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
