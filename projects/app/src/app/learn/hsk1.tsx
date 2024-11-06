import { QuizDeck } from "@/components/QuizDeck";
import { useReplicache } from "@/components/ReplicacheContext";
import { generateQuestionForSkill } from "@/data/generator";
import { IndexName, indexScan, marshalSkillStateKey } from "@/data/marshal";
import { HanziSkill, Skill, SkillType } from "@/data/model";
import { hsk1Words } from "@/dictionary/words";
import { useQuery } from "@tanstack/react-query";
import isEqual from "lodash/isEqual";
import shuffle from "lodash/shuffle";
import take from "lodash/take";
import { useId } from "react";
import { Text, View } from "react-native";

export default function LearnHsk1Page() {
  const r = useReplicache();

  const newQuizQuery = useQuery({
    queryKey: [LearnHsk1Page.name, `quiz`, useId()],
    queryFn: async () => {
      const quizSize = 10;
      const skills: Skill[] = [];

      const radicalSkillTypes = new Set([
        // SkillType.EnglishToRadical,
        SkillType.HanziWordToEnglish,
      ]);

      // Start with practicing skills that are due
      skills.push(
        ...(await r.query(async (tx) => {
          const now = new Date();
          return take(
            shuffle(
              // TODO: paginate or have a radical index
              (await indexScan(tx, IndexName.SkillStateByDue, 50))
                .filter(
                  ([{ type, hanzi }]) =>
                    radicalSkillTypes.has(type) && hsk1Words.includes(hanzi),
                )
                .filter(([, { due }]) => due <= now)
                .map(([skill]) => skill),
            ),
            quizSize,
          );
        })),
      );

      // Fill the rest with new skills
      // Create skills to pad out the rest of the quiz
      if (skills.length < quizSize) {
        const hsk1Skills: HanziSkill[] = [];
        for (const hanzi of hsk1Words) {
          hsk1Skills.push({
            type: SkillType.HanziWordToEnglish,
            hanzi,
          });
        }

        await r.query(async (tx) => {
          for (const skill of hsk1Skills) {
            if (
              // Don't add skills that are already in the quiz
              !skills.some((s) => isEqual(s.hanzi, skill.hanzi)) &&
              // Don't include skills that are already practiced
              !(await tx.has(marshalSkillStateKey(skill)))
            ) {
              skills.push(skill);
              if (skills.length === quizSize) {
                return;
              }
            }
          }
        });
      }

      return skills.map((skill) => generateQuestionForSkill(skill));
    },
    retry: false,
    // Preserves referential integrity of returned data, this is important so
    // that `answer` objects are comparable to groups.
    structuralSharing: false,
    staleTime: Infinity,
    throwOnError: true,
  });

  return (
    <View className="flex-1 items-center pt-safe-offset-[20px]">
      {newQuizQuery.isLoading ? (
        <View className="my-auto">
          <Text className="text-text">Loading…</Text>
        </View>
      ) : newQuizQuery.error ? (
        <Text className="text-text">Oops something went wrong</Text>
      ) : newQuizQuery.isSuccess ? (
        <View className="w-full max-w-[600px] flex-1 items-stretch">
          <QuizDeck questions={newQuizQuery.data} />
        </View>
      ) : null}
    </View>
  );
}
