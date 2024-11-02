import { QuizDeck } from "@/components/QuizDeck";
import { RectButton } from "@/components/RectButton";
import { useReplicache } from "@/components/ReplicacheContext";
import { generateQuestionForSkill } from "@/data/generator";
import { IndexName, indexScan, marshalSkillStateKey } from "@/data/marshal";
import { RadicalSkill, Skill, SkillType } from "@/data/model";
import { radicals } from "@/dictionary/radicals";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import shuffle from "lodash/shuffle";
import take from "lodash/take";
import { Text, View } from "react-native";

export default function RadicalsPage() {
  const r = useReplicache();

  const newQuizQuery = useQuery({
    // TODO: avoid this being cached and reused when the button is clicked again
    // later
    queryKey: [RadicalsPage.name, `skills`],
    queryFn: async () => {
      const skills: Skill[] = [];

      const radicalSkillTypes = new Set([
        // SkillType.EnglishToRadical,
        SkillType.RadicalToEnglish,
      ]);

      // Start with practicing skills that are due
      skills.push(
        ...(await r.query(async (tx) => {
          const now = new Date();
          return take(
            shuffle(
              // TODO: paginate or have a radical index
              (await indexScan(tx, IndexName.SkillStateByDue, 50))
                .filter(([{ type }]) => radicalSkillTypes.has(type))
                .filter(([, { due }]) => due <= now)
                .map(([skill]) => skill),
            ),
            10,
          );
        })),
      );

      // Fill the rest with new skills
      // Create skills to pad out the rest of the quiz
      {
        const allRadicalSkills: RadicalSkill[] = [];
        for (const radical of radicals) {
          for (const hanzi of radical.hanzi) {
            for (const name of radical.name) {
              allRadicalSkills.push({
                type: SkillType.RadicalToEnglish,
                hanzi,
                name,
              });
            }
          }
        }

        await r.query(async (tx) => {
          for (const skill of allRadicalSkills) {
            if (!(await tx.has(marshalSkillStateKey(skill)))) {
              skills.push(skill);
              if (skills.length >= 10) {
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
  });

  return (
    <View className="flex-1 items-center pt-safe-offset-[20px]">
      {newQuizQuery.isLoading ? (
        <View className="my-auto">
          <Text className="text-text">Loading…</Text>
        </View>
      ) : newQuizQuery.error ? (
        <Text className="text-text">Oops something broken</Text>
      ) : newQuizQuery.isSuccess ? (
        <View className="w-full max-w-[600px] flex-1 items-stretch">
          <QuizDeck questions={newQuizQuery.data} />
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            gap: 16,
            alignItems: `center`,
            justifyContent: `center`,
            paddingLeft: 20,
            paddingRight: 20,
          }}
        >
          <Text style={{ color: `white`, fontSize: 30, textAlign: `center` }}>
            👏 You’re all caught up on your reviews!
          </Text>
          <GoHomeButton />
        </View>
      )}
    </View>
  );
}

const GoHomeButton = () => (
  <View style={{ height: 44 }}>
    <RectButton
      onPressIn={() => {
        router.push(`/`);
      }}
      color={`#333`}
    >
      <Text style={{ fontWeight: `bold`, color: `white`, fontSize: 20 }}>
        Back
      </Text>
    </RectButton>
  </View>
);
