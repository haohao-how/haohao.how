import { RectButton2 } from "@/components/RectButton2";
import { kangxiRadicalsByStroke } from "@/dictionary/radicals";
import { Link } from "expo-router";
import { ScrollView, Text, View } from "react-native";

export default function RadicalsPage() {
  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="py-safe-offset-4 items-center"
    >
      <View className="max-w-[600px] gap-4">
        <View className="gap-2 px-safe-or-4 lg:px-0">
          <Text className="text-center text-2xl font-bold text-text">
            Kangxi Radicals
          </Text>
          <Text className="text-md text-center leading-relaxed text-text">
            The building blocks of Chinese characters, representing core
            meanings and structures. Familiarizing yourself with these radicals
            will help you recognize patterns, understand character meanings, and
            build a solid foundation for learning Chinese.
          </Text>
        </View>

        {kangxiRadicalsByStroke.map(({ strokes, characters }) => (
          <View
            key={strokes}
            className="gap-2 border-t-[2px] border-primary-7 pt-2 px-safe-or-4 lg:px-0"
          >
            <Text className="text-sm text-primary-10">
              Radicals with {strokes} strokes
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {characters.map((char, i) => (
                <Link href={`/radical/${char}`} asChild key={i}>
                  <RectButton2 textClassName="text-xl font-normal">
                    {char}
                  </RectButton2>
                </Link>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
