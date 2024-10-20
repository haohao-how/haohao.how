import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { ReactElement, ReactNode } from "react";
import { View } from "react-native";

export const ReferencePage = ({
  header,
  body,
}: {
  header: ReactElement;
  body: ReactNode;
}) => {
  return (
    <View className="flex-1 items-stretch">
      {header}

      <View className="flex-1 gap-[12px] p-[12px] pt-[16px]">{body}</View>

      <ExpoStatusBar style="auto" />
    </View>
  );
};
