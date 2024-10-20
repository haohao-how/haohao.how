import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CloseButton } from "./CloseButton";

export const ReferencePageHeader = ({
  title,
  subtitle,
  gradientColors,
}: {
  title: string | null;
  subtitle: string | null;
  gradientColors: readonly string[];
}) => {
  const insets = useSafeAreaInsets();

  return (
    <>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ paddingTop: insets.top }}
      >
        <View className="h-[250px] items-center justify-center">
          <Text className="font-roboto text-[60px] text-[white]">
            {title ?? `⁉️`}
          </Text>
        </View>
        <View className="absolute left-[16px]" style={{ top: insets.top }}>
          <CloseButton href="/" tintColor="white" />
        </View>
      </LinearGradient>

      <View className="h-[52px] items-center justify-center bg-primary-5">
        <Text className="font-roboto text-[23px] text-text">
          {subtitle ?? ``}
        </Text>
      </View>
    </>
  );
};
