import { MultipleChoiceQuestion, SkillRating } from "@/data/model";
import { Asset } from "expo-asset";
import { Audio } from "expo-av";
import chunk from "lodash/chunk";
import {
  ElementRef,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Text, View } from "react-native";
import { RectButton } from "./RectButton";
import { PropsOf } from "./types";

const buttonThickness = 4;
const gap = 16;

export const QuizDeckMultipleChoiceQuestion = memo(
  function QuizDeckMultipleChoiceQuestion({
    question,
    onNext,
  }: {
    question: MultipleChoiceQuestion;
    onNext: () => void;
    onRating: (
      question: MultipleChoiceQuestion,
      ratings: SkillRating[],
    ) => void;
  }) {
    const { prompt, choices } = question;
    const [selectedChoice, setSelectedChoice] = useState<string>();
    const [sound, setSound] = useState<Audio.Sound>();

    const [logMsg, setLogMsg] = useState<string>();
    const [logMsgTimer, setLogMsgTimer] = useState<NodeJS.Timeout>();

    async function playSound() {
      // eslint-disable-next-line no-console
      console.log(`Loading Sound`);
      const soundAsset = Asset.fromURI(
        // `https://static-ruddy.vercel.app/speech/1/1-40525355adb34c563f09cf8ff2a4679a.aac`,
        `https://static-ruddy.vercel.app/speech/1/2-1d2454055c29d34e69979f8873769672.aac`,
        // `https://static-ruddy.vercel.app/speech/2/1-9bd7c3e09e439f99f0d761583f37c020.aac`,
        // `https://static-ruddy.vercel.app/speech/2/2-44b3d90b3a91a4a75f7de0e63581cca6.aac`,
      );
      setLogMsg(
        `downloaded=${soundAsset.downloaded} downloading=${
          // @ts-expect-error it's private but only temporary
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          soundAsset.downloading
        } localUri=${soundAsset.localUri ?? `nullish`}`,
      );
      setLogMsgTimer(
        setInterval(() => {
          setLogMsg(
            `downloaded=${soundAsset.downloaded} downloading=${
              // @ts-expect-error it's private but only temporary
              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
              soundAsset.downloading
            } localUri=${soundAsset.localUri ?? `nullish`}`,
          );
        }, 100),
      );

      const { sound } = await Audio.Sound.createAsync(soundAsset);
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(`Could not set playsInSilentModeIOS: true`, e);
      }
      setSound(sound);

      // eslint-disable-next-line no-console
      console.log(`Playing Sound`);
      await sound.setRateAsync(2, true, Audio.PitchCorrectionQuality.High);
      await sound.playAsync();
    }

    useEffect(() => {
      if (logMsg !== undefined) {
        // eslint-disable-next-line no-console
        console.log(logMsg);
      }
    }, [logMsg]);

    useEffect(() => {
      if (logMsgTimer !== undefined) {
        return () => {
          clearInterval(logMsgTimer);
        };
      }
    }, [logMsgTimer]);

    useEffect(() => {
      return sound
        ? () => {
            // eslint-disable-next-line no-console
            console.log(`Unloading Sound`);
            sound.unloadAsync().catch((e: unknown) => {
              // eslint-disable-next-line no-console
              console.log(`Error unloading sound`, e);
            });
          }
        : undefined;
    }, [sound]);

    useEffect(() => {
      playSound().catch((e: unknown) => {
        // eslint-disable-next-line no-console
        console.log(`Error playing sound`, e);
      });
    }, [selectedChoice]);

    const choicesRows = chunk(choices, 2);
    const handleSubmit = () => {
      throw new Error(`not implemented`);
      // TODO: show error or success modal
      // onRating(
      //   question,
      //   selectedChoice === answer ? Rating.Good : Rating.Again,
      // );
      onNext();
    };
    return (
      <View
        style={{
          flex: 1,
          gap: gap + buttonThickness,
        }}
      >
        <View>
          <Text
            style={{
              color: `white`,
              fontSize: 24,
              fontWeight: `bold`,
            }}
          >
            {prompt}
          </Text>
        </View>
        {choicesRows.map((choicesRow, i) => (
          <View className="flex-1 flex-row items-stretch gap-[16px]" key={i}>
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
          disabled={selectedChoice === undefined}
          onPress={handleSubmit}
        />
      </View>
    );
  },
);

const SubmitButton = forwardRef<
  ElementRef<typeof RectButton>,
  { disabled: boolean } & Pick<PropsOf<typeof RectButton>, `onPress`>
>(function SubmitButton({ disabled, ...rectButtonProps }, ref) {
  const color = disabled ? `#3A464E` : `#A1D151`;
  const textColor = disabled ? `#56646C` : `#161F23`;

  return (
    <RectButton
      color={color}
      thickness={disabled ? 0 : undefined}
      ref={ref}
      {...(disabled ? null : rectButtonProps)}
    >
      <Text
        className="select-none"
        style={{
          textTransform: `uppercase`,
          color: textColor,
          fontSize: 16,
          fontWeight: `bold`,
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
  }, [onPress, text]);

  const color = selected ? `#232E35` : `#161F23`;
  const accentColor = selected ? `#5183A4` : `#3A464E`;

  return (
    <RectButton
      borderWidth={2}
      thickness={buttonThickness}
      color={color}
      accentColor={accentColor}
      onPress={handlePress}
      style={{ flex: 1 }}
    >
      <View style={{ justifyContent: `center` }}>
        <Text className="select-none" style={{ color: `white`, fontSize: 80 }}>
          {text}
        </Text>
      </View>
    </RectButton>
  );
};
