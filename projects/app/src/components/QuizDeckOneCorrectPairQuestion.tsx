import { OneCorrectPairQuestion } from "@/data/model";
import { Rating } from "@/util/fsrs";
import { Image } from "expo-image";
import {
  ElementRef,
  ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Animated,
  Easing,
  Platform,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tv } from "tailwind-variants";
import { AnswerButton } from "./AnswerButton";
import { RectButton } from "./RectButton";
import { RectButton2 } from "./RectButton2";
import { PropsOf } from "./types";

const buttonThickness = 4;
const gap = 12;

export const QuizDeckOneCorrectPairQuestion = ({
  question: {
    prompt,
    answer: [answerA, answerB],
    groupA,
    groupB,
  },
  onComplete,
}: {
  question: OneCorrectPairQuestion;
  onComplete: (rating: Rating) => void;
}) => {
  const [selectedAChoice, setSelectedAChoice] = useState<string>();
  const [selectedBChoice, setSelectedBChoice] = useState<string>();
  const [rating, setRating] = useState<Rating>();

  const choiceRowCount = Math.max(groupA.length, groupB.length);
  const choiceRows: { a: string | undefined; b: string | undefined }[] = [];

  for (let i = 0; i < choiceRowCount; i++) {
    choiceRows.push({ a: groupA[i], b: groupB[i] });
  }

  const handleSubmit = () => {
    if (rating === undefined) {
      setRating(
        selectedAChoice === answerA && selectedBChoice === answerB
          ? Rating.Good
          : Rating.Again,
      );
    } else {
      onComplete(rating);
    }
  };

  const showResult = rating !== undefined;
  const isCorrect = rating !== Rating.Again;

  return (
    <Skeleton
      toast={
        showResult ? (
          <View
            className={`flex-1 gap-[12px] ${isCorrect ? `success-theme` : `danger-theme`}`}
          >
            {isCorrect ? (
              <View className="flex-row items-center gap-[8px]">
                <Image
                  source={require(`@/assets/icons/check-circled-filled.svg`)}
                  className="h-[32px] w-[32px] shrink"
                  // Blocked on https://discord.com/channels/968718419904057416/1298775941652414545
                  tintColor="#ABD063"
                />
                <Text className="text-2xl font-bold text-accent-10">Nice!</Text>
              </View>
            ) : (
              <>
                <View className="flex-row items-center gap-[8px]">
                  <Image
                    source={require(`@/assets/icons/close-circled-filled.svg`)}
                    className="h-[32px] w-[32px] shrink"
                    // Blocked on https://discord.com/channels/968718419904057416/1298775941652414545
                    tintColor="#CE675F"
                  />
                  <Text className="text-2xl font-bold text-accent-10">
                    Incorrect
                  </Text>
                </View>
                <Text className="text-xl font-bold leading-none text-accent-10">
                  Correct answer:
                </Text>
                <Text className="text-xl leading-none text-accent-10">
                  {answerA} ({answerB})
                </Text>
              </>
            )}
          </View>
        ) : null
      }
      submitButton={
        <SubmitButton
          state={
            selectedAChoice === undefined || selectedBChoice === undefined
              ? SubmitButtonState.Disabled
              : !showResult
                ? SubmitButtonState.Check
                : isCorrect
                  ? SubmitButtonState.Correct
                  : SubmitButtonState.Incorrect
          }
          onPress={handleSubmit}
        />
      }
    >
      <View>
        <Text className="text-lg font-bold text-text">{prompt}</Text>
      </View>
      <View className="flex-1 justify-center py-quiz-px">
        <View
          className="flex-1"
          style={{
            gap: gap + buttonThickness,
            maxHeight:
              choiceRowCount * 80 +
              (choiceRowCount - 1) * gap +
              buttonThickness,
          }}
        >
          {choiceRows.map(({ a, b }, i) => (
            <View className="flex-1 flex-row gap-[28px]" key={i}>
              {a !== undefined ? (
                <AnswerButton2
                  text={a}
                  isRadical
                  selected={a === selectedAChoice}
                  onPress={setSelectedAChoice}
                />
              ) : (
                <View />
              )}
              {b !== undefined ? (
                <AnswerButton2
                  text={b}
                  selected={b === selectedBChoice}
                  onPress={setSelectedBChoice}
                />
              ) : (
                <View />
              )}
            </View>
          ))}
        </View>
        {/* <View
          style={{
            position: "absolute",
            bottom: 100,
            left: 0,
            backgroundColor: "purple",
            width: 50,
            height: 50,
            zIndex: 1000,
          }}
        ></View> */}
      </View>
    </Skeleton>
  );
};

const Skeleton = ({
  children,
  toast,
  submitButton,
}: {
  children: ReactNode;
  toast: ReactNode | null;
  submitButton: ReactNode;
}) => {
  const insets = useSafeAreaInsets();
  const submitButtonHeight = 44;
  const submitButtonInsetBottom = insets.bottom + 20;
  const contentInsetBottom = submitButtonInsetBottom + 5 + submitButtonHeight;
  const contentPaddingTopBottom = 20;

  const [slideInAnim] = useState(() => new Animated.Value(0));
  const hasToast = toast !== null;

  useEffect(() => {
    if (hasToast) {
      Animated.timing(slideInAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false, // layout properties aren't compatible with the native driver on mobile (it works on Web though)
      }).start();
    } else {
      Animated.timing(slideInAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: false,
      }).start();
    }
  }, [slideInAnim, hasToast]);

  const slideInStyle: StyleProp<ViewStyle> = useMemo(
    () =>
      Platform.OS === `web`
        ? {
            // On web the `bottom: <percent>%` approach doesn't work when the
            // parent is `position: absolute`. But using `translateY: <percent>%`
            // DOES work (but this doesn't work on mobile native because only
            // pixel values are accepted).
            transform: [
              {
                translateY: slideInAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [`100%`, `0%`],
                }),
              },
            ],
          }
        : {
            position: `relative`,
            bottom: slideInAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [`-100%`, `0%`],
            }),
          },
    [slideInAnim],
  );

  return (
    <>
      <View
        className="flex-1 px-quiz-px"
        style={{ paddingBottom: contentInsetBottom }}
      >
        {children}
      </View>
      {toast !== null ? (
        <View className="absolute inset-x-0 bottom-0 px-quiz-px">
          <Animated.View
            className="bg-accent-10"
            style={[
              {
                paddingTop: contentPaddingTopBottom,
                paddingBottom: contentInsetBottom + contentPaddingTopBottom,
              },
              slideInStyle,
            ]}
          >
            {toast}
          </Animated.View>
        </View>
      ) : null}
      <View
        className="absolute inset-x-quiz-px flex-row items-stretch"
        style={{
          bottom: submitButtonInsetBottom,
          height: submitButtonHeight,
        }}
      >
        {submitButton}
      </View>
    </>
  );
};

enum SubmitButtonState {
  Disabled,
  Check,
  Correct,
  Incorrect,
}

const SubmitButton = forwardRef<
  ElementRef<typeof RectButton2>,
  { state: SubmitButtonState } & Pick<PropsOf<typeof RectButton>, `onPress`>
>(function SubmitButton({ state, onPress }, ref) {
  let text;

  switch (state) {
    case SubmitButtonState.Disabled:
    case SubmitButtonState.Check:
      text = `Check`;
      break;
    case SubmitButtonState.Correct:
      text = `Continue`;
      break;
    case SubmitButtonState.Incorrect:
      text = `Got it`;
      break;
  }

  return (
    <RectButton2
      style={{ flex: 1 }}
      variant="filled"
      ref={ref}
      disabled={state === SubmitButtonState.Disabled}
      className={
        state === SubmitButtonState.Incorrect ? `danger-theme` : `success-theme`
      }
      accent
      onPress={state === SubmitButtonState.Disabled ? undefined : onPress}
    >
      {text}
    </RectButton2>
  );
});

const AnswerButton2 = ({
  selected,
  text,
  isRadical = false,
  onPress,
}: {
  selected: boolean;
  text: string;
  isRadical?: boolean;
  onPress: (text: string) => void;
}) => {
  const handlePress = useCallback(() => {
    onPress(text);
  }, [onPress, text]);

  return (
    <AnswerButton
      onPress={handlePress}
      state={selected ? `selected` : `default`}
      className="flex-1"
      textClassName={answerText({ isRadical })}
    >
      {text}
    </AnswerButton>
  );
};

const answerText = tv({
  base: `text-lg lg:text-xl`,
  variants: {
    isRadical: {
      true: `border-[1px] border-primary-10 border-dashed px-1`,
    },
  },
});
