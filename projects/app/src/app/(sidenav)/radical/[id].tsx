import { ReferencePage } from "@/components/ReferencePage";
import { ReferencePageBodySection } from "@/components/ReferencePageBodySection";
import { ReferencePageHeader } from "@/components/ReferencePageHeader";
import { GradientAqua } from "@/components/styles";
import {
  lookupRadicalByHanzi,
  lookupRadicalNameMnemonics,
} from "@/dictionary/dictionary";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function RadicalPage() {
  const { id } = useLocalSearchParams<`/radical/[id]`>();

  const query = useQuery({
    queryKey: [`character.radical`, id],
    queryFn: async () => {
      const [radical, nameMnemonics] = await Promise.all([
        lookupRadicalByHanzi(id),
        lookupRadicalNameMnemonics(id),
      ]);
      return { radical, nameMnemonics };
    },
    throwOnError: true,
  });

  return (
    <ReferencePage
      header={
        <ReferencePageHeader
          gradientColors={GradientAqua}
          title={id}
          subtitle={query.data?.radical?.name[0] ?? null}
        />
      }
      body={
        query.isLoading ? (
          <Text className="text-text">Loading</Text>
        ) : query.isError ? (
          <Text className="text-text">Error</Text>
        ) : (
          <>
            {query.data?.nameMnemonics != null ? (
              <ReferencePageBodySection title="Mnemonics">
                <View className="flex-col gap-2">
                  {query.data.nameMnemonics.map(
                    ({ mnemonic, rationale }, i) => (
                      <View key={i} className="gap-1">
                        <Text className="text-md text-text">{mnemonic}</Text>
                        <Text className="text-xs italic text-primary-10">
                          {rationale}
                        </Text>
                      </View>
                    ),
                  )}
                </View>
              </ReferencePageBodySection>
            ) : null}
            {query.data?.radical != null ? (
              <ReferencePageBodySection title="Meaning">
                {query.data.radical.name.join(`, `)}
              </ReferencePageBodySection>
            ) : null}
            {query.data?.radical?.pinyin != null ? (
              <ReferencePageBodySection title="Pinyin">
                {query.data.radical.pinyin.join(`, `)}
              </ReferencePageBodySection>
            ) : null}
          </>
        )
      }
    />
  );
}
