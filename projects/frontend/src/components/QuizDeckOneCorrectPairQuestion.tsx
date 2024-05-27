import { forwardRef, useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { RectButton } from "./RectButton";
import { PropsOf } from "./types";

const buttonThickness = 4;
const gap = 16;

export interface OneCorrectPairQuestion {
  prompt: string;
  groupA: string[];
  groupB: string[];
  answer: [groupA: string, groupB: string];
}

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
  onComplete: (success: boolean) => void;
}) => {
  const [selectedAChoice, setSelectedAChoice] = useState<string>();
  const [selectedBChoice, setSelectedBChoice] = useState<string>();

  const choiceRowCount = Math.max(groupA.length, groupB.length);
  const choiceRows: { a: string | undefined; b: string | undefined }[] = [];

  for (let i = 0; i < choiceRowCount; i++) {
    choiceRows.push({ a: groupA[i], b: groupB[i] });
  }

  const handleSubmit = () => {
    // TODO: show error or success modal
    onComplete(selectedAChoice === answerA && selectedBChoice === answerB);
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
      <SubmitButton
        disabled={
          selectedAChoice === undefined || selectedBChoice === undefined
        }
        onPress={handleSubmit}
      />
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
        <Text style={[{ color: "white", fontSize: 30 }, styles.buttonText]}>
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
