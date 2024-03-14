import { Image } from "expo-image";
import { chunk } from "lodash-es";
import { forwardRef, useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { RectButton } from "./RectButton";
import { PropsOf } from "./types";

const buttonThickness = 4;
const gap = 16;

export enum FourUpQuizFlag {
  WeakWord,
}

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
    const [selectedChoice, setSelectedChoice] = useState<string>();

    const choicesRows = chunk(choices, 2);

    const handleSubmit = () => {
      const success = selectedChoice === answer;
      console.log("success", success);
      onNext(success);
    };

    return (
      <View style={{ flex: 1, gap: gap + buttonThickness }}>
        {flag === FourUpQuizFlag.WeakWord ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
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
        <SubmitButton
          disabled={selectedChoice == null}
          onPress={handleSubmit}
        />
      </View>
    );
  },
  { Flag: FourUpQuizFlag },
);

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
        selectable={false}
        style={{
          textTransform: "uppercase",
          color: textColor,
          fontSize: 16,
          fontWeight: "bold",
          paddingBottom: 4,
          paddingTop: 4,
        }}
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
        <Text style={{ color: "white", fontSize: 80 }} selectable={false}>
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
});
