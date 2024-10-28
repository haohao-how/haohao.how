import { RectButton2 } from "@/components/RectButton2";
import { hsk1Words, hsk2Words } from "@/dictionary/words";
import { Link } from "expo-router";
import { ScrollView, Text, View } from "react-native";

export default function WordsPage() {
  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="py-safe-offset-4 px-safe-or-4 items-center"
    >
      <View className="max-w-[600px] gap-4">
        <View className="gap-2 px-safe-or-4 lg:px-0">
          <Text className="text-center text-2xl font-bold text-text">
            HSK 1
          </Text>
          <Text className="text-md text-center leading-relaxed text-text">
            HSK 1 vocabulary consists of essential Chinese words that form the
            foundation for beginner-level communication. Mastering these words
            will help you build confidence in basic conversation, comprehension,
            and daily language use.
          </Text>
        </View>
        <WordList words={hsk1Words} />

        <View className="gap-2 px-safe-or-4 lg:px-0">
          <Text className="text-center text-2xl font-bold text-text">
            HSK 2
          </Text>
          <Text className="text-md text-center leading-relaxed text-text">
            HSK 2 vocabulary expands on foundational words, adding more verbs,
            adjectives, and expressions to help you engage in simple
            conversations and express a wider range of everyday ideas in
            Chinese.
          </Text>
        </View>
        <WordList words={hsk2Words} />

        <View className="gap-2 px-safe-or-4 lg:px-0">
          <Text className="text-center text-2xl font-bold text-text">
            HSK 3
          </Text>
          <Text className="text-md text-center leading-relaxed text-text">
            HSK 3 vocabulary expands your ability to engage in everyday topics
            and express yourself in more detail. Learning these words will
            enhance your fluency, enabling you to discuss a wider range of
            subjects and handle daily interactions with greater confidence.
          </Text>
        </View>
        <WordList words={hsk2Words} />
      </View>
    </ScrollView>
  );
}

const WordList = ({ words }: { words: string[] }) => {
  return (
    <View className="flex-row flex-wrap gap-2">
      {words.map((word, i) => (
        <Link href={`/word/${word}`} asChild key={i}>
          <RectButton2 textClassName="text-xl font-normal">{word}</RectButton2>
        </Link>
      ))}
    </View>
  );
};
