import { NavigationContainer, useTheme } from "@react-navigation/native";
import {
  createStackNavigator,
  StackCardInterpolatedStyle,
  StackCardInterpolationProps,
  TransitionPresets,
} from "@react-navigation/stack";
import { Image } from "expo-image";
import { chunk } from "lodash-es";
import { forwardRef, useCallback, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { RectButton } from "./RectButton";
import { PropsOf } from "./types";

const buttonThickness = 4;
const gap = 16;

export enum FourUpQuizFlag {
  WeakWord,
}

const ScreenName = "screen";

const Stack = createStackNavigator();

export const FourUpQuiz = Object.assign(
  ({
    prompt,
    answer,
    flag,
    choices,
    onNext,
  }: {
    prompt: string;
    answer: string;
    flag?: FourUpQuizFlag;
    choices: readonly string[];
    onNext: (success: boolean) => void;
  }) => {
    const theme = useTheme();

    return (
      <View style={{ flex: 1, gap: gap + buttonThickness }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 24,
            marginLeft: 10,
            marginRight: 10,
          }}
        >
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
        {flag === FourUpQuizFlag.WeakWord ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginLeft: 10,
              marginRight: 10,
            }}
          >
            <Image
              source={require("../../assets/target-red.svg")}
              style={{ flexShrink: 1, width: 33, height: 30 }}
            />
            <Text
              style={{
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
        ) : null}

        <NavigationContainer independent={true} theme={theme}>
          <Stack.Navigator
            screenOptions={{
              gestureEnabled: false,
              headerShown: false,
              animationEnabled: true,
              ...TransitionPresets.SlideFromRightIOS,
              cardStyleInterpolator: forHorizontalIOS,
            }}
          >
            <Stack.Screen
              name={ScreenName}
              children={({ navigation }) => (
                // These props are only passed in initially, the element is not re-rendered.
                <InnerScreen
                  prompt={prompt}
                  answer={answer}
                  choices={choices}
                  navigation={navigation}
                />
              )}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    );
  },
  { Flag: FourUpQuizFlag },
);

function forHorizontalIOS({
  current,
  next,
  inverted,
  layouts: { screen },
}: StackCardInterpolationProps): StackCardInterpolatedStyle {
  const translateFocused = Animated.multiply(
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [screen.width, 0],
      extrapolate: "clamp",
    }),
    inverted,
  );

  const translateUnfocused = next
    ? Animated.multiply(
        next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, screen.width * -1],
          extrapolate: "clamp",
        }),
        inverted,
      )
    : 0;
  const opacityUnfocused = next ? Animated.subtract(1, next.progress) : 1;

  return {
    cardStyle: {
      transform: [
        // Translation for the animation of the current card
        { translateX: translateFocused },
        // Translation for the animation of the card on top of this
        { translateX: translateUnfocused },
      ],
      opacity: opacityUnfocused,
    },
  };
}

const InnerScreen = ({
  prompt,
  answer,
  choices,
  navigation,
}: {
  prompt: string;
  answer: string;
  choices: readonly string[];
  navigation: any;
}) => {
  const [selectedChoice, setSelectedChoice] = useState<string>();
  const choicesRows = chunk(choices, 2);
  const handleSubmit = () => {
    const success = selectedChoice === answer;
    if (success) {
      navigation.replace(ScreenName);
    }
  };
  return (
    <View
      style={{
        flex: 1,
        gap: gap + buttonThickness,
        marginLeft: 10,
        marginRight: 10,
      }}
    >
      <View>
        <Text
          style={{
            color: "white",
            fontSize: 24,
            fontWeight: "bold",
          }}
        >
          {prompt}
        </Text>
      </View>
      {choicesRows.map((choicesRow, i) => (
        <View style={styles.answerRow} key={i}>
          {choicesRow.map((choice, i) => (
            <AnswerButton
              text={choice}
              selected={choice === selectedChoice}
              onPress={setSelectedChoice}
              key={i}
            />
          ))}
        </View>
      ))}
      <SubmitButton disabled={selectedChoice == null} onPress={handleSubmit} />
    </View>
  );
};

const SubmitButton = forwardRef<
  View,
  { disabled: boolean } & Pick<PropsOf<typeof RectButton>, "onPress">
>(({ disabled, ...rectButtonProps }, ref) => {
  const color = disabled ? "#3A464E" : "#A1D151";
  const textColor = disabled ? "#56646C" : "#161F23";

  return (
    <RectButton
      color={color}
      thickness={disabled ? 0 : undefined}
      ref={ref}
      {...(disabled ? null : rectButtonProps)}
    >
      <Text
        style={[
          {
            textTransform: "uppercase",
            color: textColor,
            fontSize: 16,
            fontWeight: "bold",
            paddingBottom: 4,
            paddingTop: 4,
          },
          styles.buttonText,
        ]}
      >
        Check
      </Text>
    </RectButton>
  );
});

const AnswerButton = ({
  selected,
  text,
  onPress,
}: {
  selected: boolean;
  text: string;
  onPress: (text: string) => void;
}) => {
  const handlePress = useCallback(() => {
    onPress(text);
  }, [text]);

  const color = selected ? "#232E35" : "#161F23";
  const accentColor = selected ? "#5183A4" : "#3A464E";

  return (
    <RectButton
      borderWidth={2}
      thickness={buttonThickness}
      color={color}
      accentColor={accentColor}
      onPress={handlePress}
      style={{ flex: 1 }}
    >
      <View style={{ justifyContent: "center" }}>
        <Text style={[{ color: "white", fontSize: 80 }, styles.buttonText]}>
          {text}
        </Text>
      </View>
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
  answerRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "stretch",
    gap,
  },
  buttonText: {
    userSelect: "none",
  },
});
