import { useReplicacheSubscribe } from "@/components/ReplicacheContext";
import { IndexName, indexScan, unmarshalSkillReviewJson } from "@/data/marshal";
import { Rating } from "@/util/fsrs";
import reverse from "lodash/reverse";
import sortBy from "lodash/sortBy";
import { Text, View } from "react-native";

export default function HistoryPage() {
  const start = Date.now();

  const data = useReplicacheSubscribe((tx) =>
    indexScan(tx, IndexName.SkillStateByDue, 50),
  );

  const skillReviews = useReplicacheSubscribe((tx) =>
    tx
      .scan({ prefix: `sr/` })
      .entries()
      .toArray()
      .then((entries) => entries.map(unmarshalSkillReviewJson))
      .then((reviews) => reverse(sortBy(reviews, (x) => x[0][1]))),
  );

  const renderTime = Date.now() - start;

  return (
    <View className="flex-row gap-2">
      <View>
        <Text className="text-text">
          Render time {Math.round(renderTime)}ms
        </Text>
      </View>
      <View className="flex-1 items-center justify-center gap-[10px]">
        <Text className="text-xl text-text">upcoming</Text>

        {data?.map(([key, value], i) => (
          <View key={i}>
            <Text className="text-text">
              {key.hanzi}: {value.due.toISOString()}
            </Text>
          </View>
        ))}
      </View>

      <View>
        <Text className="self-center text-xl text-text">history</Text>

        {skillReviews?.map(([key, value], i) => (
          <View key={i}>
            <Text className="text-text">
              {value.rating === Rating.Again
                ? `❌`
                : value.rating === Rating.Good
                  ? `✅`
                  : value.rating}
              {` `}
              {key[0].hanzi}: {key[1].toISOString()}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
