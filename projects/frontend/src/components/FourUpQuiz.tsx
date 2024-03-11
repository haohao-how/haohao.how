import { Image } from "expo-image";
import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { RectButton } from "./RectButton";

const buttonThickness = 4;

export const FourUpQuiz = () => {
  const gap = 16;
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, gap: gap + buttonThickness }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 24 }}>
          <Image
            source={require("../../assets/cog.svg")}
            style={{ flexShrink: 1, width: 33, height: 33 }}
          />
          <View
            style={{
              backgroundColor: "#3A464E",
              height: 16,
              flex: 1,
              borderRadius: 8,
            }}
          >
            <View
              style={{
                backgroundColor: "#3F4CF5",
                height: 16,
                width: "80%",
                flex: 1,
                borderRadius: 8,
              }}
            >
              <View
                style={{
                  backgroundColor: "#6570F6",
                  height: 5,
                  marginLeft: 8,
                  marginRight: 8,
                  marginTop: 4,
                  borderRadius: 2,
                }}
              ></View>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Image
            source={require("../../assets/target-red.svg")}
            style={{ flexShrink: 1, width: 33, height: 30 }}
          />
          <Text
            style={{
              flex: 1,
              color: "#EC5A53",
              fontSize: 16,
              fontWeight: "bold",
              textTransform: "uppercase",
              textShadowColor: "black",
              textShadowRadius: 1,
            }}
          >
            Weak word
          </Text>
        </View>
        <View>
          <Text
            style={{
              color: "white",
              fontSize: 24,
              fontWeight: "bold",
            }}
          >
            Select the correct word for the character “dǔ”
          </Text>
        </View>
        {/* Top row */}
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            gap,
          }}
        >
          <AnswerButton text="好" />
          <AnswerButton text="爱" />
        </View>
        {/* Bottom row */}
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            gap,
          }}
        >
          <AnswerButton text="别" />
          <AnswerButton text="姆" />
        </View>
        <Link href="/" asChild>
          <RectButton color="#A1D151">
            <Text
              selectable={false}
              style={{
                textTransform: "uppercase",
                color: "#161F23",
                fontSize: 16,
                fontWeight: "bold",
                paddingBottom: 4,
                paddingTop: 4,
              }}
            >
              Check
            </Text>
          </RectButton>
        </Link>
      </View>
    </View>
  );
};

const AnswerButton = ({ text }: { text: string }) => {
  return (
    <RectButton
      borderWidth={2}
      thickness={buttonThickness}
      color="#161F23"
      accentColor="#3A464E"
      style={{ flex: 1 }}
    >
      <Text style={{ color: "white", fontSize: 80 }} selectable={false}>
        {text}
      </Text>
    </RectButton>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
