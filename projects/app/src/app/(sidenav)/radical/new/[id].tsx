import { CloseButton } from "@/components/CloseButton";
import { QuizProgressBar } from "@/components/QuizProgressBar";
import { RectButton2 } from "@/components/RectButton2";
import { ReferencePage } from "@/components/ReferencePage";
import { ReferencePageBodySection } from "@/components/ReferencePageBodySection";
import { ReferencePageHeader } from "@/components/ReferencePageHeader";
import { GradientAqua, GradientPink } from "@/components/styles";
import {
  lookupRadicalByHanzi,
  lookupRadicalNameMnemonics,
} from "@/dictionary/dictionary";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";

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
    <View className="flex-1 items-center">
      <View className="w-[100%] max-w-[600px] flex-row items-center gap-3 pt-safe-offset-4 px-safe-or-4">
        <CloseButton href="/" tintColor="#3C464D" />
        <QuizProgressBar
          progress={0.5}
          colors={
            [`#3F4CF5`, `#3F4CF5`] // solid blue
          }
        />
      </View>
      <ScrollView
        className=""
        contentContainerClassName="px-safe-or-4 flex-1 pb-2"
      >
        <View className="flex-row items-center gap-2 self-center py-4">
          <Image
            className="h-[32px] w-[32px] flex-shrink text-[#04ABF6]"
            source={require(`@/assets/icons/loader.svg`)}
            tintColor="currentColor"
          />
          <Text className="font-body text-lg font-bold uppercase text-[#04ABF6]">
            New Word
          </Text>
        </View>

        <View className="items-center justify-center gap-5">
          <Text className="font-cursive text-5xl text-text">not</Text>
          <View className="items-center gap-2">
            <LinearGradient
              colors={GradientPink}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 1, y: 0.5 }}
              className="rounded-3xl p-6"
            >
              <Text className="font-chinese text-[168px] text-text">无</Text>
            </LinearGradient>
            <Text className="text-3xl text-text opacity-50">
              ⿱ <Text className="font-chinese">一 尢</Text>
            </Text>
          </View>
        </View>

        <View className="flex-1"></View>

        <View className="max-w-[400px] justify-center">
          <Text className="text-center text-2xl text-text">
            Imagine a straight line on top of a bent person trying to stand up
            but failing, so they are{` `}
            <Text className="font-bold text-[#04ABF6]">not</Text>
            {` `}
            able to rise.
          </Text>
        </View>

        <View className="h-1 w-2 flex-1"></View>
        <View className="h-1 w-2 flex-1"></View>

        <View className="w-[100%] max-w-[600px] flex-col items-center gap-3">
          <RectButton2 variant="outline" className="w-[100%]">
            I Don&apos;t Get It
          </RectButton2>
          <RectButton2 variant="filled" className="w-[100%]" accent>
            Next
          </RectButton2>
        </View>

        {Math.random() > 0 ? null : (
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
                              <Text className="text-md text-text">
                                {mnemonic}
                              </Text>
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
        )}
      </ScrollView>
    </View>
  );
}
