import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  LayoutRectangle,
  View,
} from "react-native";
import { useEventCallback } from "./util";

export const QuizProgressBar = ({
  progress,
  colors,
}: {
  progress: number;
  colors: string[];
}) => {
  const [layout, setLayout] = useState<LayoutRectangle>();
  const widthAnim = useRef(new Animated.Value(0)).current;

  const handleLayout = useEventCallback((x: LayoutChangeEvent) => {
    setLayout(x.nativeEvent.layout);
  });

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 200,
      useNativeDriver: false, // layout properties aren't compatible with the native driver on mobile (it works on Web though)
    }).start();
  }, [widthAnim, progress]);

  return (
    <View
      style={{
        backgroundColor: "#3A464E",
        height: 16,
        flex: 1,
        borderRadius: 8,
      }}
      onLayout={handleLayout}
    >
      <Animated.View
        style={{
          width: widthAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [
              "6%", // Always show a little bit of progress, so that there's a hint of the bar existing.
              "100%",
            ],
          }),
          height: 16,
          flex: 1,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {/* Background */}
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            flex: 1,
            height: 16,
            display: layout === undefined ? "none" : "flex", // Intended to jank, but not sure if necessary.
            width: layout?.width,
          }}
        />
        {/* Highlight accent */}
        <View
          style={{
            backgroundColor: "white",
            opacity: 0.2,
            height: 5,
            left: 8,
            right: 8,
            top: 4,
            borderRadius: 2,
            position: "absolute",
          }}
        />
      </Animated.View>
    </View>
  );
};
