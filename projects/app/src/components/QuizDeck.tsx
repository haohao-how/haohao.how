import { Question, QuestionFlag, QuestionType } from "@/data/model";
import { saveSkillRating } from "@/data/mutators";
import { readonlyMapSet } from "@/util/collections";
import { Rating } from "@/util/fsrs";
import { StackNavigationFor } from "@/util/types";
import { NavigationContainer, useTheme } from "@react-navigation/native";
import {
  StackCardInterpolatedStyle,
  StackCardInterpolationProps,
  TransitionPresets,
  createStackNavigator,
} from "@react-navigation/stack";
import { useQueries } from "@tanstack/react-query";
import { Asset } from "expo-asset";
import { Image } from "expo-image";
import { router } from "expo-router";
import sortBy from "lodash/sortBy";
import { useMemo, useRef, useState } from "react";
import { Animated, Platform, View } from "react-native";
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

const Stack = createStackNavigator<{
  // init: never;
  question: {
    question: Question;
    flag?: QuestionFlag;
  };
}>();

type Navigation = StackNavigationFor<typeof Stack>;

export const QuizDeck = ({ questions }: { questions: readonly Question[] }) => {
  const theme = useTheme();
  const navigationRef = useRef<Navigation>();
  const [questionStateMap, setQuestionStateMap] = useState<
    ReadonlyMap<Question, QuestionState>
  >(() => new Map());
  const r = useReplicache();

  // The number of questions in a row correctly answered.
  const [streakCount, setStreakCount] = useState(0);

  const progress = useMemo(() => {
    let p = 0;
    for (const s of questionStateMap.values()) {
      if (s.type === QuestionStateType.Correct) {
        p += 1;
      } else if (s.attempts > 0) {
        // Give a diminishing progress for each attempt.
        p += (Math.log(s.attempts - 0.5) + 1.9) / 8.7;
      }
    }
    return p / questions.length;
  }, [questionStateMap, questions.length]);

  const handleNext = useEventCallback(() => {
    const remainingQuestions = questions
      .map((q) => [q, questionStateMap.get(q)] as const)
      .filter(([, state]) => state?.type !== QuestionStateType.Correct);
    const [next] = sortBy(remainingQuestions, ([, s]) => s?.attempts ?? 0);

    if (next != null) {
      const [question, state] = next;
      const attempts = state?.attempts ?? 0;
      const flag = attempts > 0 ? QuestionFlag.PreviousMistake : question.flag;
      navigationRef.current?.replace(`question`, { question, flag });
    } else {
      // There's no next deck item, bail.
      setTimeout(() => {
        router.push(`/`);
      }, 500);
    }
  });

  const handleRating = useEventCallback(
    (question: Question, rating: Rating) => {
      const success = rating !== Rating.Again;

      if (question.type === QuestionType.OneCorrectPair) {
        saveSkillRating(r, question.skill, rating).catch((e: unknown) => {
          // eslint-disable-next-line no-console
          console.error(`failed to update skill`, e);
        });
      }

      setStreakCount((prev) => (success ? prev + 1 : 0));
      setQuestionStateMap((prev) =>
        readonlyMapSet(prev, question, {
          type: success
            ? QuestionStateType.Correct
            : QuestionStateType.Incorrect,
          attempts: (prev.get(question)?.attempts ?? 0) + 1,
        }),
      );
    },
  );

  // Prefetch images used in later screens.
  usePrefetchImages(
    require(`@/assets/icons/check-circled-filled.svg`),
    require(`@/assets/icons/close-circled-filled.svg`),
  );

  return (
    <View
      style={{
        flex: 1,
        gap: gap + buttonThickness,
      }}
    >
      <View className="flex-row items-center gap-[24px] px-[16px]">
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

      <NavigationContainer independent={true} theme={theme}>
        <Stack.Navigator
          screenOptions={{
            gestureEnabled: false,
            headerShown: false,
            animationEnabled: true,
            ...TransitionPresets.SlideFromRightIOS,
            cardStyleInterpolator: forHorizontalIOS,
          }}
          screenListeners={({ navigation }) => ({
            // Hack to get the navigation object.
            state: () => {
              navigationRef.current = navigation as Navigation;
            },
          })}
        >
          <Stack.Screen
            name="question"
            initialParams={{ question: questions[0] }}
            children={({
              route: {
                params: { question, flag },
              },
            }) => {
              switch (question.type) {
                case QuestionType.MultipleChoice:
                  return (
                    <QuizDeckMultipleChoiceQuestion
                      question={question}
                      onNext={handleNext}
                      onRating={handleRating}
                    />
                  );
                case QuestionType.OneCorrectPair:
                  return (
                    <QuizDeckOneCorrectPairQuestion
                      question={question}
                      flag={flag}
                      onNext={handleNext}
                      onRating={handleRating}
                    />
                  );
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

function usePrefetchImages(...images: (string | number)[]) {
  return useQueries({
    queries: images.map((image) => ({
      queryKey: [usePrefetchImages.name, image],
      queryFn: () => cacheImage(image),
    })),
  });
}

function cacheImage(image: string | number) {
  if (Platform.OS === `web`) {
    const uri = typeof image === `string` ? image : Asset.fromModule(image).uri;
    return Image.prefetch(uri);
  } else if (typeof image === `string`) {
    return Asset.fromModule(image).downloadAsync();
  }
}
