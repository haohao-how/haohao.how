import { ReferencePage } from "@/components/ReferencePage";
import { ReferencePageBodySection } from "@/components/ReferencePageBodySection";
import { ReferencePageHeader } from "@/components/ReferencePageHeader";
import { GradientRed } from "@/components/styles";
import { lookupWord } from "@/dictionary/dictionary";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";

export default function CharacterPage() {
  const { id } = useLocalSearchParams<`/character/[id]`>();

  const query = useQuery({
    queryKey: [`character`, id],
    queryFn: async () => {
      return await lookupWord(id);
    },
    throwOnError: true,
  });

  return (
    <ReferencePage
      header={
        <ReferencePageHeader
          gradientColors={GradientRed}
          title={id}
          subtitle={`todo`}
        />
      }
      body={
        query.isLoading ? (
          <>Loading</>
        ) : query.isError ? (
          <>Error</>
        ) : (
          <>
            <ReferencePageBodySection title="Mnemonic">
              {`todo`}
            </ReferencePageBodySection>

            <ReferencePageBodySection title="Meaning">
              {`todo`}
            </ReferencePageBodySection>

            <ReferencePageBodySection title="Pronunciation">
              {`todo`}
            </ReferencePageBodySection>

            <ReferencePageBodySection title="Radicals">
              {`todo`}
            </ReferencePageBodySection>
          </>
        )
      }
    />
  );
}
