import Color from "color";
import { forwardRef, useMemo } from "react";
import { ColorValue, Pressable, View, ViewProps } from "react-native";
import { PropsOf } from "./types";
import { hapticImpactIfMobile } from "./util";

export type RectButtonProps = {
  borderRadius?: number;
  borderWidth?: number;
  thickness?: number;
  color?: ColorValue;
  accentColor?: ColorValue;
  children?: ViewProps["children"];
} & Omit<PropsOf<typeof Pressable>, "children">;

export const RectButton = forwardRef<View, RectButtonProps>(
  (
    {
      thickness = 4,
      borderRadius = 16,
      borderWidth = 0,
      color = "#1CB0F5",
      accentColor,
      children,
      ...pressableProps
    },
    ref,
  ) => {
    accentColor = useMemo(
      () => accentColor ?? Color(color).darken(0.2).hex(),
      [accentColor, color],
    );

    // The border contributes to the same *thickness* appearance, so to avoid
    // doubling up, we subtract it.
    thickness = thickness - borderWidth;

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
          <View style={{ flex: 1 }}>
            <View
              // base
              style={[
                {
                  flex: 1,
                  backgroundColor: accentColor,
                  alignItems: "stretch",
                  justifyContent: "center",
                  borderRadius,
                },
              ]}
            >
              {/* <View
              // thickness
              style={[
                {
                  backgroundColor: accentColor,
                  opacity: pressed ? 0 : 1,
                  height: thickness,
                  position: "absolute",
                  transform: [{ translateY: -thickness }],
                },
              ]}
            /> */}

              <View
                // top surface
                style={[
                  {
                    flex: 1,
                    borderWidth,
                    borderColor: accentColor,
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
          </View>
        )}
      </Pressable>
    );
  },
);
