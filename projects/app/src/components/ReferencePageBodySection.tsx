import { Text, View } from "react-native";

export const ReferencePageBodySection = ({
  title,
  children,
}: {
  title: string;
  children: string;
}) => {
  return (
    <View className="flex-row justify-center">
      <View className="flex-shrink flex-grow-0 basis-[500px] gap-[4px]">
        <View>
          <Text className="text-lg text-primary-10">{title}</Text>
        </View>
        <View>
          <Text className="text-xl text-primary-12">{children}</Text>
        </View>
      </View>
    </View>
  );
};
