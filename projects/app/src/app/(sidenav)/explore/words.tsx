import { RectButton2 } from "@/components/RectButton2";
import { words } from "@/dictionary/words";
import { Link } from "expo-router";
import { ScrollView, Text, View } from "react-native";

export default function HistoryPage() {
  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="py-safe-offset-4 px-safe-or-4 items-center"
    >
      <View className="max-w-[600px]">
        <Text className="text-lg text-text">Words</Text>
        <View className="flex-row flex-wrap gap-2">
          {words.map((word, i) => (
            <View key={i}>
              <Link href={`/word/${word.text}`} asChild>
                <RectButton2 textClassName="text-xl font-normal">
                  {word.text}
                </RectButton2>
              </Link>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
