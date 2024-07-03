import { Question, QuestionFlag, QuestionType } from "@/data/model";
import { saveSkillRating } from "@/data/mutators";
import { Rating } from "@/util/fsrs";
import { NavigationContainer, useTheme } from "@react-navigation/native";
import {
  StackCardInterpolatedStyle,
  StackCardInterpolationProps,
  TransitionPresets,
  createStackNavigator,
} from "@react-navigation/stack";
import { router } from "expo-router";
import sortBy from "lodash/sortBy";
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

interface QuestionState {
  type: QuestionStateType;
  attempts: number;
}

enum QuestionStateType {
  Correct,
  Incorrect,
}

const ScreenName = `screen`;

const Stack = createStackNavigator();

interface Navigation {
  replace: (name: string) => void;
}

type QuestionStateMap = Map<Question, QuestionState>;

export const QuizDeck = ({
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

  const currentQuestion = useMemo((): Question | undefined => {
    const remainingQuestions = questions
      .map((q) => [q, questionStateMap.get(q)] as const)
      .filter(([, state]) => state?.type !== QuestionStateType.Correct);
    const [x] = sortBy(remainingQuestions, ([, s]) => s?.attempts ?? 0);
    return x?.[0];
  }, [questions, questionStateMap]);

  // This is the engine that moves the quiz forward.
  useEffect(() => {
    // The first deck item is automatically rendered, we only need to pump the
    // navigator for subsequent.
    if (!isFirstQuestion) {
      navigationRef.current?.replace(ScreenName);
    }

    // There's no next deck item, bail.
    if (currentQuestion === undefined) {
      setTimeout(() => {
        router.push(`/`);
      }, 500);
    }
  }, [currentQuestion, isFirstQuestion]);

  const r = useReplicache();

  const onComplete = useEventCallback((rating: Rating) => {
    const success = rating !== Rating.Again;

    if (currentQuestion !== undefined) {
      if (currentQuestion.type === QuestionType.OneCorrectPair) {
        saveSkillRating(r, currentQuestion.skill, rating).catch(
          (e: unknown) => {
            // eslint-disable-next-line no-console
            console.error(`failed to update skill`, e);
          },
        );
      }

      setStreakCount((prev) => (success ? prev + 1 : 0));
      setQuestionStateMap((prev) => {
        const next = new Map(prev);
        const prevState = prev.get(currentQuestion);

        const attempts = (prevState?.attempts ?? 0) + 1;
        next.set(currentQuestion, {
          type: success
            ? QuestionStateType.Correct
            : QuestionStateType.Incorrect,
          attempts,
        });
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
          flexDirection: `row`,
          alignItems: `center`,
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
              ? [`#E861F8`, `#414DF6`, `#75F076`] // streak
              : [`#3F4CF5`, `#3F4CF5`] // solid blue
          }
        />
      </View>

      {currentQuestion?.flag === QuestionFlag.WeakWord ? (
        <View
          style={{
            flexDirection: `row`,
            alignItems: `center`,
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
              color: `#EC5A53`,
              fontSize: 16,
              fontWeight: `bold`,
              textTransform: `uppercase`,
              textShadowColor: `black`,
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
              switch (currentQuestion?.type) {
                case QuestionType.MultipleChoice:
                  return (
                    <QuizDeckMultipleChoiceQuestion
                      question={currentQuestion}
                      onComplete={onComplete}
                    />
                  );
                case QuestionType.OneCorrectPair:
                  return (
                    <QuizDeckOneCorrectPairQuestion
                      question={currentQuestion}
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
      extrapolate: `clamp`,
    }),
    inverted,
  );

  const translateUnfocused = next
    ? Animated.multiply(
        next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, screen.width * -1],
          extrapolate: `clamp`,
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
