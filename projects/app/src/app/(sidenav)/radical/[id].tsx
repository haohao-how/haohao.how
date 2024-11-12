import { ReferencePage } from "@/components/ReferencePage";
import { ReferencePageBodySection } from "@/components/ReferencePageBodySection";
import { ReferencePageHeader } from "@/components/ReferencePageHeader";
import { GradientAqua } from "@/components/styles";
import { radicalLookupByHanzi } from "@/dictionary/radicals";
import { asyncJson } from "@/dictionary/radicalsAsync";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";

export default function RadicalPage() {
  const { id } = useLocalSearchParams<`/character/[id]`>();
  const radical = radicalLookupByHanzi.get(id);

  const nameMnemonic = useQuery({
    queryKey: [`character.radical`, id],
    queryFn: async () => {
      return asyncJson.lookupNameMnemonic(id);
    },
    throwOnError: true,
  });

  return (
    <ReferencePage
      header={
        <ReferencePageHeader
          gradientColors={GradientAqua}
          title={radical?.hanzi[0] ?? null}
          subtitle={radical?.name[0] ?? null}
        />
      }
      body={
        <>
          {nameMnemonic.data !== undefined ? (
            <ReferencePageBodySection title="Mnemonic">
              {nameMnemonic.data.mnemonic}
            </ReferencePageBodySection>
          ) : null}

          {radical !== undefined ? (
            <ReferencePageBodySection title="Meaning">
              {radical.name.join(`, `)}
            </ReferencePageBodySection>
          ) : null}

          {radical?.pinyin !== undefined ? (
            <ReferencePageBodySection title="Pinyin">
              {radical.pinyin.join(`, `)}
            </ReferencePageBodySection>
          ) : null}
        </>
      }
    />
  );
}
