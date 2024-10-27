import { RectButton2 } from "@/components/RectButton2";
import { radicals } from "@/dictionary/radicals";
import { Link } from "expo-router";
import { ScrollView, Text, View } from "react-native";

export default function HistoryPage() {
  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="py-safe-offset-4 px-safe-or-4 items-center gap-[10px]"
    >
      <View className="max-w-[600px]">
        <Text className="text-lg text-text">Radicals</Text>
        <View className="flex-row flex-wrap gap-2">
          {radicals.map((radical, i) => (
            <View key={i}>
              <Link href={`/radical/${radical.char}`} asChild>
                <RectButton2 textClassName="text-xl font-normal">
                  {radical.char}
                </RectButton2>
              </Link>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
