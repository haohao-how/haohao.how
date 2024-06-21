import { ReferencePage } from "@/components/ReferencePage";
import { ReferencePageBodySection } from "@/components/ReferencePageBodySection";
import { ReferencePageHeader } from "@/components/ReferencePageHeader";
import { GradientRed } from "@/components/styles";
import { characterLookupByChar } from "@/dictionary/characters";
import { useLocalSearchParams } from "expo-router";

export default function CharacterPage() {
  const { id } = useLocalSearchParams<`/character/[id]`>();
  const character = characterLookupByChar.get(id);

  return (
    <ReferencePage
      header={
        <ReferencePageHeader
          gradientColors={GradientRed}
          title={character?.char ?? null}
          subtitle={character?.name ?? null}
        />
      }
      body={
        <>
          {character?.mnemonic !== undefined ? (
            <ReferencePageBodySection title="Mnemonic">
              {character.mnemonic}
            </ReferencePageBodySection>
          ) : null}

          {character !== undefined ? (
            <ReferencePageBodySection title="Meaning">
              {[character.name].concat(character.nameAlts ?? []).join(`, `)}
            </ReferencePageBodySection>
          ) : null}

          {character?.pronunciations !== undefined ? (
            <ReferencePageBodySection title="Pronunciation">
              {character.pronunciations.join(`, `)}
            </ReferencePageBodySection>
          ) : null}

          {character?.radicals !== undefined ? (
            <ReferencePageBodySection title="Radicals">
              {character.radicals.join(`, `)}
            </ReferencePageBodySection>
          ) : null}
        </>
      }
    />
  );
}
