import { ReferencePage } from "@/components/ReferencePage";
import { ReferencePageBodySection } from "@/components/ReferencePageBodySection";
import { ReferencePageHeader } from "@/components/ReferencePageHeader";
import { GradientAqua } from "@/components/styles";
import {
  lookupRadicalByHanzi,
  lookupRadicalNameMnemonic,
} from "@/dictionary/dictionary";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";

export default function RadicalPage() {
  const { id } = useLocalSearchParams<`/radical/[id]`>();

  const query = useQuery({
    queryKey: [`character.radical`, id],
    queryFn: async () => {
      const [radical, nameMnemonic] = await Promise.all([
        lookupRadicalByHanzi(id),
        lookupRadicalNameMnemonic(id),
      ]);
      return { radical, nameMnemonic: nameMnemonic?.mnemonic ?? null };
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
            {query.data?.nameMnemonic != null ? (
              <ReferencePageBodySection title="Mnemonic">
                {query.data.nameMnemonic}
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
