import { ReferencePage } from "@/components/ReferencePage";
import { ReferencePageBodySection } from "@/components/ReferencePageBodySection";
import { ReferencePageHeader } from "@/components/ReferencePageHeader";
import { GradientAqua } from "@/components/styles";
import { radicalLookupByHanzi } from "@/dictionary/radicals";
import { useLocalSearchParams } from "expo-router";

export default function RadicalPage() {
  const { id } = useLocalSearchParams<`/character/[id]`>();
  const radical = radicalLookupByHanzi.get(id);

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
          {radical?.mnemonic !== undefined ? (
            <ReferencePageBodySection title="Mnemonic">
              {radical.mnemonic}
            </ReferencePageBodySection>
          ) : null}

          {radical !== undefined ? (
            <ReferencePageBodySection title="Meaning">
              {radical.name.join(`, `)}
            </ReferencePageBodySection>
          ) : null}

          {radical?.pronunciations !== undefined ? (
            <ReferencePageBodySection title="Pronunciation">
              {radical.pronunciations.join(`, `)}
            </ReferencePageBodySection>
          ) : null}
        </>
      }
    />
  );
}
