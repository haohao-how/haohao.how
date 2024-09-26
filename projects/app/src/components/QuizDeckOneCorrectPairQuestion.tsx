import { OneCorrectPairQuestion } from "@/data/model";
import { Rating } from "@/util/fsrs";
import { View } from "@tamagui/core";
import { SizableText } from "@tamagui/text";
import { Image } from "expo-image";
import {
  ElementRef,
  ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RectButton } from "./RectButton";
import { RectButton2 } from "./RectButton2";
import { PropsOf } from "./types";

const buttonThickness = 4;
const gap = 12;

const quizPaddingLeftRight = 16;

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
            style={{
              flex: 1,
              gap: 12,
            }}
          >
            {isCorrect ? (
              <>
                <View
                  style={{ flexDirection: `row`, alignItems: `center`, gap: 8 }}
                >
                  <Image
                    source={require(`@/assets/icons/check-circled-filled.svg`)}
                    style={{
                      flexShrink: 1,
                      width: 32,
                      height: 32,
                    }}
                    tintColor="#ABD063"
                  />
                  <Text
                    style={{
                      color: `#ABD063`,
                      fontSize: 24,
                      fontWeight: `bold`,
                    }}
                  >
                    Nice!
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View
                  style={{ flexDirection: `row`, alignItems: `center`, gap: 8 }}
                >
                  <Image
                    source={require(`@/assets/icons/close-circled-filled.svg`)}
                    style={{ flexShrink: 1, width: 32, height: 32 }}
                    tintColor="#CE675F"
                  />
                  <Text
                    style={{
                      color: `#CE675F`,
                      fontSize: 24,
                      fontWeight: `bold`,
                    }}
                  >
                    Incorrect
                  </Text>
                </View>
                <Text
                  style={{ color: `#CE675F`, fontSize: 20, fontWeight: `bold` }}
                >
                  Correct answer:
                </Text>
                <Text style={{ color: `#CE675F`, fontSize: 20 }}>
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
        <SizableText size="$2" fontWeight="bold">
          {prompt}
        </SizableText>
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: `center`,
          paddingBottom: quizPaddingLeftRight,
          paddingTop: quizPaddingLeftRight,
        }}
      >
        <View
          style={{
            flex: 1,
            gap: gap + buttonThickness,
            maxHeight:
              choiceRowCount * 80 +
              (choiceRowCount - 1) * gap +
              buttonThickness,
          }}
        >
          {choiceRows.map(({ a, b }, i) => (
            <View style={styles.answerRow} key={i}>
              {a !== undefined ? (
                <AnswerButton
                  text={a}
                  selected={a === selectedAChoice}
                  onPress={setSelectedAChoice}
                />
              ) : (
                <View />
              )}
              {b !== undefined ? (
                <AnswerButton
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

  const slideInAnim = useRef(new Animated.Value(0)).current;
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

  const slideInStyle: StyleProp<ViewStyle> =
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
        };

  return (
    <>
      <View
        style={{
          flex: 1,
          paddingLeft: quizPaddingLeftRight,
          paddingBottom: contentInsetBottom,
          paddingRight: quizPaddingLeftRight,
        }}
      >
        {children}
      </View>
      {toast !== null ? (
        <View
          style={{
            position: `absolute`,
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <Animated.View
            style={[
              {
                paddingLeft: quizPaddingLeftRight,
                paddingRight: quizPaddingLeftRight,
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
        style={{
          position: `absolute`,
          bottom: submitButtonInsetBottom,
          left: quizPaddingLeftRight,
          right: quizPaddingLeftRight,
          height: submitButtonHeight,
          flexDirection: `row`,
          alignItems: `stretch`,
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
      size="$1"
      disabled={state === SubmitButtonState.Disabled}
      theme={state === SubmitButtonState.Incorrect ? `danger` : `success`}
      accent
      onPress={state === SubmitButtonState.Disabled ? undefined : onPress}
    >
      {text}
    </RectButton2>
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

  return (
    <RectButton2
      onPress={handlePress}
      size="$2"
      style={{ flex: 1 }}
      accent={selected}
    >
      {text}
    </RectButton2>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 8,
    alignItems: `center`,
    justifyContent: `center`,
  },
  answerRow: {
    flex: 1,
    flexDirection: `row`,
    alignItems: `stretch`,
    gap: 28,
  },
  buttonText: {
    userSelect: `none`,
  },
});
