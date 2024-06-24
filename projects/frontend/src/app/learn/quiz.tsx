import { QuizDeck } from "@/components/QuizDeck";
import { useReplicache } from "@/components/ReplicacheContext";
import { RootView } from "@/components/RootView";
import { generateQuestionForSkill } from "@/data/generator";
import { unmarshalSkillStateJson } from "@/data/marshal";
import { Question, QuestionFlag, QuestionType, Skill } from "@/data/model";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function QuizPage() {
  const r = useReplicache();
  const insets = useSafeAreaInsets();
  const [skills, setSkills] = useState<readonly Skill[]>();
  const [questions, setQuestions] = useState<readonly Question[]>();

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(`r.clientID = ${r?.clientID ?? `<nullish>`}`);

    void r?.query(async (tx) => {
      // eslint-disable-next-line no-console
      console.log(`Next 10 skill reviews:`);
      const now = new Date();
      const skills = (
        await tx.scan({ prefix: `s/`, limit: 10 }).entries().toArray()
      )
        .map(unmarshalSkillStateJson)
        .filter(([, state]) => state.due <= now)
        .map(([skill]) => skill);
      setSkills(skills);
    });
  }, [r]);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(skills);
    const questions = skills?.map((skill) => generateQuestionForSkill(skill));
    if (questions !== undefined && questions.length > 0) {
      // eslint-disable-next-line no-console
      console.log(`setting questions to`, questions);
      setQuestions(questions);
    }
  }, [skills]);

  useEffect(() => {
    // HACK: Fallback questions for dev in case replicache is empty.
    const timeoutId = setTimeout(() => {
      setQuestions(
        (x) =>
          x ?? [
            {
              type: QuestionType.MultipleChoice,
              prompt: `Select the correct word for the character “dǔ”`,
              choices: [`好`, `爱`, `别`, `姆`],
              answer: `好`,
              flag: QuestionFlag.WeakWord,
            },
            {
              type: QuestionType.MultipleChoice,
              prompt: `Select the correct word for the character “dá”`,
              choices: [`好`, `爱`, `别`, `姆`],
              answer: `好`,
              flag: QuestionFlag.WeakWord,
            },
            {
              type: QuestionType.MultipleChoice,
              prompt: `Select the correct word for the character “d”`,
              choices: [`好`, `爱`, `别`, `姆`],
              answer: `好`,
              flag: QuestionFlag.WeakWord,
            },
            {
              type: QuestionType.MultipleChoice,
              prompt: `Select the correct word for the character “dǔ”`,
              choices: [`好`, `爱`, `别`, `姆`],
              answer: `好`,
              flag: QuestionFlag.WeakWord,
            },
          ],
      );
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <RootView backgroundColor="#161F23" style={styles.container}>
      <View
        style={{
          flex: 1,
          width: `100%`,
          flexDirection: `row`,
          justifyContent: `center`,
          paddingTop: insets.top + 20,
        }}
      >
        <View
          style={{
            maxWidth: 600,
            flex: 1,
          }}
        >
          {questions === undefined ? (
            <Text>Loading…</Text>
          ) : (
            <QuizDeck
              questions={questions}
              onNext={(success) => {
                if (success) {
                }
              }}
            />
          )}
        </View>
        <ExpoStatusBar style="auto" />
      </View>
    </RootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 8,
    alignItems: `center`,
    justifyContent: `center`,
  },
});
