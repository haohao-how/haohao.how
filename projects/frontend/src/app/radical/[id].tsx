import { ReferencePage } from "@/components/ReferencePage";
import { ReferencePageBodySection } from "@/components/ReferencePageBodySection";
import { ReferencePageHeader } from "@/components/ReferencePageHeader";
import { GradientAqua } from "@/components/styles";
import { radicalLookupByChar } from "@/data/radicals";
import { useLocalSearchParams } from "expo-router";

export default function RadicalPage() {
  const { id } = useLocalSearchParams<"/character/[id]">();
  const radical = radicalLookupByChar.get(id);

  return (
    <ReferencePage
      header={
        <ReferencePageHeader
          gradientColors={GradientAqua}
          title={radical?.char ?? null}
          subtitle={radical?.name ?? null}
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
              {[radical.name].concat(radical.nameAlts ?? []).join(", ")}
            </ReferencePageBodySection>
          ) : null}

          {radical?.pronunciations !== undefined ? (
            <ReferencePageBodySection title="Pronunciation">
              {radical.pronunciations.join(", ")}
            </ReferencePageBodySection>
          ) : null}
        </>
      }
    />
  );
}
