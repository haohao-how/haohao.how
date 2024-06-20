import { DeckItem, FourUpQuizFlag, QuizDeckItemType } from "@/data/model";
import { Rating } from "@/util/fsrs";
import { NavigationContainer, useTheme } from "@react-navigation/native";
import {
  StackCardInterpolatedStyle,
  StackCardInterpolationProps,
  TransitionPresets,
  createStackNavigator,
} from "@react-navigation/stack";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";
import { CloseButton } from "./CloseButton";
import { QuizDeckMultipleChoiceQuestion } from "./QuizDeckMultipleChoiceQuestion";
import { QuizDeckOneCorrectPairQuestion } from "./QuizDeckOneCorrectPairQuestion";
import { QuizProgressBar } from "./QuizProgressBar";
import { useReplicache } from "./ReplicacheContext";
import { useEventCallback } from "./util";

const buttonThickness = 4;
const gap = 16;

type QuestionState =
  | {
      type: DeckItemStateType.Correct;
    }
  | {
      type: DeckItemStateType.Incorrect;
      attempts: number;
    };

enum DeckItemStateType {
  Correct,
  Incorrect,
}

const ScreenName = "screen";

const Stack = createStackNavigator();

interface Navigation {
  replace: (name: string) => void;
}

type DeckItemStateMap = Map<DeckItem, QuestionState>;

export const QuizDeck = Object.assign(
  ({
    items: deckItems,
  }: {
    items: readonly DeckItem[];
    onNext: (success: boolean) => void;
  }) => {
    const theme = useTheme();
    const navigationRef = useRef<Navigation>();
    const [deckItemStateMap, setDeckItemStateMap] = useState<
      Readonly<DeckItemStateMap>
    >(() => new Map());

    const isFirstDeckItem = deckItemStateMap.size === 0;
    // The number of questions in a row correctly answered.
    const [streakCount, setStreakCount] = useState(0);

    const progress = useMemo(
      () =>
        Array.from(deckItemStateMap.values()).filter(
          (s) => s.type === DeckItemStateType.Correct,
        ).length / deckItems.length,
      [deckItemStateMap, deckItems.length],
    );

    const currentDeckItem = useMemo(() => {
      for (const deckItem of deckItems) {
        if (
          deckItemStateMap.get(deckItem)?.type !== DeckItemStateType.Correct
        ) {
          return deckItem;
        }
      }
    }, [deckItems, deckItemStateMap]);

    // This is the engine that moves the quiz forward.
    useEffect(() => {
      // The first deck item is automatically rendered, we only need to pump the
      // navigator for subsequent.
      if (!isFirstDeckItem) {
        navigationRef.current?.replace(ScreenName);
      }

      // There's no next deck item, bail.
      if (currentDeckItem === undefined) {
        setTimeout(() => {
          router.push("/");
        }, 500);
      }
    }, [currentDeckItem, isFirstDeckItem]);

    const r = useReplicache();

    const onComplete = useEventCallback((rating: Rating) => {
      const success = rating !== Rating.Again;

      if (currentDeckItem !== undefined) {
        if (currentDeckItem.type === QuizDeckItemType.OneCorrectPair) {
          r?.mutate
            .updateSkill({ skill: currentDeckItem.skill, rating })
            .catch((e: unknown) => {
              // eslint-disable-next-line no-console
              console.error("failed to update skill", e);
            });
        }

        setStreakCount((prev) => (success ? prev + 1 : 0));
        setDeckItemStateMap((prev) => {
          const next = new Map(prev);
          const prevState = prev.get(currentDeckItem);
          next.set(
            currentDeckItem,
            success
              ? { type: DeckItemStateType.Correct }
              : {
                  type: DeckItemStateType.Incorrect,
                  attempts:
                    prevState?.type === DeckItemStateType.Incorrect
                      ? prevState.attempts + 1
                      : 1,
                },
          );
          return next;
        });
      }
    });

    return (
      <View
        style={{
          flex: 1,
          gap: gap + buttonThickness,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 24,
            paddingLeft: 16,
            paddingRight: 16,
          }}
        >
          <CloseButton href="/" tintColor="#3C464D" />
          <QuizProgressBar
            progress={progress}
            colors={
              streakCount >= 2
                ? ["#E861F8", "#414DF6", "#75F076"] // streak
                : ["#3F4CF5", "#3F4CF5"] // solid blue
            }
          />
        </View>

        {currentDeckItem?.type === QuizDeckItemType.MultipleChoice &&
        currentDeckItem.question.flag === FourUpQuizFlag.WeakWord ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingLeft: 16,
              paddingRight: 16,
            }}
          >
            {/* <Image
              source={require("@/assets/target-red.svg")}
              style={{ flexShrink: 1, width: 33, height: 30 }}
            /> */}
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

                // These props are only passed in initially, the element is not re-rendered.
                switch (currentDeckItem?.type) {
                  case QuizDeckItemType.MultipleChoice:
                    return (
                      <QuizDeckMultipleChoiceQuestion
                        question={currentDeckItem.question}
                        onComplete={onComplete}
                      />
                    );
                  case QuizDeckItemType.OneCorrectPair:
                    return (
                      <QuizDeckOneCorrectPairQuestion
                        question={currentDeckItem.question}
                        onComplete={onComplete}
                      />
                    );
                  case undefined:
                  default:
                    return null;
                }
              }}
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
