import Color from "color";
import { forwardRef, useMemo } from "react";
import { ColorValue, Pressable, View, ViewProps } from "react-native";
import { PropsOf } from "./types";
import { hapticImpactIfMobile } from "./util";

export type RectButtonProps = {
  borderRadius?: number;
  thickness?: number;
  color?: ColorValue;
  children?: ViewProps["children"];
} & Omit<PropsOf<typeof Pressable>, "children">;

export const RectButton = forwardRef<View, RectButtonProps>(
  (
    {
      thickness = 4,
      borderRadius = 0,
      color = "#1CB0F5",
      children,
      ...pressableProps
    },
    ref,
  ) => {
    const baseColor = useMemo(() => Color(color).darken(0.2).hex(), [color]);

    return (
      <Pressable
        {...pressableProps}
        onPressIn={(e) => {
          hapticImpactIfMobile();
          pressableProps.onPressIn?.(e);
        }}
        ref={ref}
      >
        {({ pressed }) => (
          <View>
            <View
              // base
              style={[
                {
                  backgroundColor: baseColor,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius,
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  right: 0,
                  left: 0,
                },
              ]}
            >
              {/* <View
              // thickness
              style={[
                {
                  backgroundColor: baseColor,
                  opacity: pressed ? 0 : 1,
                  height: thickness,
                  position: "absolute",
                  transform: [{ translateY: -thickness }],
                },
              ]}
            /> */}
            </View>
            <View
              // top surface
              style={[
                {
                  backgroundColor: color,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: borderRadius,
                  padding: 10,
                  transform: [{ translateY: pressed ? 0 : -thickness }],
                  transformOrigin: "top",
                },
              ]}
            >
              {children}
            </View>
          </View>
        )}
      </Pressable>
    );
  },
);
