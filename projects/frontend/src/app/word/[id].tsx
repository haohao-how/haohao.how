import { ReferencePage } from "@/components/ReferencePage";
import { ReferencePageBodySection } from "@/components/ReferencePageBodySection";
import { ReferencePageHeader } from "@/components/ReferencePageHeader";
import { GradientPurple } from "@/components/styles";
import { wordLookupByWord } from "@/data/words";
import { useLocalSearchParams } from "expo-router";

export default function WordPage() {
  const { id } = useLocalSearchParams<"/word/[id]">();
  const word = wordLookupByWord.get(id);

  return (
    <ReferencePage
      header={
        <ReferencePageHeader
          gradientColors={GradientPurple}
          title={word?.text ?? null}
          subtitle={word?.name ?? null}
        />
      }
      body={
        <>
          {word?.mnemonic !== undefined ? (
            <ReferencePageBodySection title="Mnemonic">
              {word.mnemonic}
            </ReferencePageBodySection>
          ) : null}

          {word !== undefined ? (
            <ReferencePageBodySection title="Meaning">
              {[word.name].concat(word.nameAlts ?? []).join(", ")}
            </ReferencePageBodySection>
          ) : null}

          {word?.pronunciations !== undefined ? (
            <ReferencePageBodySection title="Pronunciation">
              {word.pronunciations.join(", ")}
            </ReferencePageBodySection>
          ) : null}

          {word?.characters !== undefined ? (
            <ReferencePageBodySection title="Characters">
              {word.characters.join(", ")}
            </ReferencePageBodySection>
          ) : null}
        </>
      }
    />
  );
}
