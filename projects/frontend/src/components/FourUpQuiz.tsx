import { NavigationContainer, useTheme } from "@react-navigation/native";
import {
  StackCardInterpolatedStyle,
  StackCardInterpolationProps,
  TransitionPresets,
  createStackNavigator,
} from "@react-navigation/stack";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import chunk from "lodash/chunk";
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  LayoutChangeEvent,
  LayoutRectangle,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { RectButton } from "./RectButton";
import { PropsOf } from "./types";

const buttonThickness = 4;
const gap = 16;

export enum FourUpQuizFlag {
  WeakWord,
}

type QuestionState =
  | {
      type: QuestionStateType.Correct;
    }
  | {
      type: QuestionStateType.Incorrect;
      attempts: number;
    };

enum QuestionStateType {
  Correct,
  Incorrect,
}

const ScreenName = "screen";

const Stack = createStackNavigator();

interface Navigation {
  replace: (name: string) => void;
}

interface Question {
  prompt: string;
  answer: string;
  flag?: FourUpQuizFlag;
  choices: readonly string[];
}

type QuestionStateMap = Map<Question, QuestionState>;

export const FourUpQuiz = Object.assign(
  ({
    questions,
  }: {
    questions: readonly Question[];
    onNext: (success: boolean) => void;
  }) => {
    const theme = useTheme();
    const navigationRef = useRef<Navigation>();
    const [questionStateMap, setQuestionStateMap] = useState<
      Readonly<QuestionStateMap>
    >(() => new Map());

    const isFirstQuestion = questionStateMap.size === 0;
    // The number of questions in a row correctly answered.
    const [streakCount, setStreakCount] = useState(0);

    const progress = useMemo(
      () =>
        Array.from(questionStateMap.values()).filter(
          (s) => s.type === QuestionStateType.Correct,
        ).length / questions.length,
      [questionStateMap, questions.length],
    );

    const currentQuestion = useMemo(() => {
      for (const question of questions) {
        if (
          questionStateMap.get(question)?.type !== QuestionStateType.Correct
        ) {
          return question;
        }
      }
    }, [questions, questionStateMap]);

    // This is the engine that moves the quiz forward.
    useEffect(() => {
      // The first question is automatically rendered, we only need to pump the
      // navigator for subsequent.
      if (!isFirstQuestion) {
        navigationRef.current?.replace(ScreenName);
      }

      // There's no next question, bail.
      if (currentQuestion === undefined) {
        setTimeout(() => {
          router.push("/");
        }, 500);
      }
    }, [currentQuestion, isFirstQuestion]);

    const onComplete = useCallback(
      (success: boolean) => {
        if (currentQuestion !== undefined) {
          setStreakCount((prev) => (success ? prev + 1 : 0));
          setQuestionStateMap((prev) => {
            const next = new Map(prev);
            const prevState = prev.get(currentQuestion);
            next.set(
              currentQuestion,
              success
                ? { type: QuestionStateType.Correct }
                : {
                    type: QuestionStateType.Incorrect,
                    attempts:
                      prevState?.type === QuestionStateType.Incorrect
                        ? prevState.attempts + 1
                        : 1,
                  },
            );
            return next;
          });
        }
      },
      [currentQuestion, setQuestionStateMap],
    );

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
            source={require("../../assets/cog.svg") as string}
            style={{ flexShrink: 1, width: 33, height: 33 }}
          />
          <ProgressBar
            progress={progress}
            colors={
              streakCount >= 2
                ? ["#E861F8", "#414DF6", "#75F076"] // streak
                : ["#3F4CF5", "#3F4CF5"] // solid blue
            }
          />
        </View>

        {currentQuestion?.flag === FourUpQuizFlag.WeakWord ? (
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
              source={require("../../assets/target-red.svg") as string}
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
              children={({ navigation }) => {
                // HACK
                navigationRef.current = navigation as Navigation;

                return currentQuestion ? (
                  // These props are only passed in initially, the element is not re-rendered.
                  <InnerScreen
                    prompt={currentQuestion.prompt}
                    answer={currentQuestion.answer}
                    choices={currentQuestion.choices}
                    onComplete={onComplete}
                  />
                ) : null;
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    );
  },
  { Flag: FourUpQuizFlag },
);

const ProgressBar = ({
  progress,
  colors,
}: {
  progress: number;
  colors: string[];
}) => {
  const [layout, setLayout] = useState<LayoutRectangle>();
  const widthAnim = useRef(new Animated.Value(0)).current;

  const handleLayout = useCallback((x: LayoutChangeEvent) => {
    setLayout(x.nativeEvent.layout);
  }, []);

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 200,
      useNativeDriver: false, // layout properties aren't compatible with the native driver on mobile (it works on Web though)
    }).start();
  }, [widthAnim, progress]);

  return (
    <View
      style={{
        backgroundColor: "#3A464E",
        height: 16,
        flex: 1,
        borderRadius: 8,
      }}
      onLayout={handleLayout}
    >
      <Animated.View
        style={{
          width: widthAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [
              "6%", // Always show a little bit of progress, so that there's a hint of the bar existing.
              "100%",
            ],
          }),
          height: 16,
          flex: 1,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {/* Background */}
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            flex: 1,
            height: 16,
            display: layout == null ? "none" : "flex", // Intended to jank, but not sure if necessary.
            width: layout?.width,
          }}
        />
        {/* Highlight accent */}
        <View
          style={{
            backgroundColor: "white",
            opacity: 0.2,
            height: 5,
            left: 8,
            right: 8,
            top: 4,
            borderRadius: 2,
            position: "absolute",
          }}
        />
      </Animated.View>
    </View>
  );
};

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
  onComplete,
}: {
  prompt: string;
  answer: string;
  choices: readonly string[];
  onComplete: (success: boolean) => void;
}) => {
  const [selectedChoice, setSelectedChoice] = useState<string>();
  const choicesRows = chunk(choices, 2);
  const handleSubmit = () => {
    // TODO: show error or success modal

    onComplete(selectedChoice === answer);
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
>(function SubmitButton({ disabled, ...rectButtonProps }, ref) {
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
  }, [onPress, text]);

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
