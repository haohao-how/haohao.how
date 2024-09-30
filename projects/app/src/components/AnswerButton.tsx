import { styled, View } from "@tamagui/core";
import { SizableText } from "@tamagui/text";
import { ElementRef, forwardRef, useEffect, useState } from "react";
import { Pressable, ViewProps } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withClamp,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { PropsOf } from "./types";
import { hapticImpactIfMobile } from "./util";

export type ButtonSize = `$1` | `$2`;

export type AnswerButtonProps = {
  thickness?: number;
  size?: ButtonSize;
  accent?: boolean;
  children?: ViewProps[`children`];
} & Omit<PropsOf<typeof Pressable>, `children`>;

export const AnswerButton = forwardRef<
  ElementRef<typeof Pressable>,
  AnswerButtonProps
>(function AnswerButton(
  { disabled = false, thickness = 4, children, size = `$1`, ...pressableProps },
  ref,
) {
  const [selected, setSelected] = useState(false);
  const [prevSelected, setPrevSelected] = useState(selected);

  const scale = useSharedValue(1);
  const bgScale = useSharedValue(0.5);
  const bgOpacity = useSharedValue(0);

  const animationFactor = 1;

  useEffect(() => {
    setPrevSelected(selected);
  }, [selected]);

  const selectedChanged = selected !== prevSelected;

  useEffect(() => {
    if (selectedChanged) {
      if (selected) {
        const withScaleAnimation = () =>
          withSequence(
            withTiming(0.5, { duration: 0 }),
            withTiming(1.07, {
              duration: 200 * animationFactor,
              easing: Easing.inOut(Easing.quad),
            }),
            withTiming(1, {
              duration: 100 * animationFactor,
              easing: Easing.out(Easing.quad),
            }),
          );

        scale.value = withClamp({ min: 1 }, withScaleAnimation());
        bgScale.value = withClamp({ max: 1 }, withScaleAnimation());
        bgOpacity.value = withTiming(1, { duration: 100 * animationFactor });
      } else {
        setBgFilled(false);
        bgScale.value = 0.5;
        bgOpacity.value = 0;
      }
    }
  }, [bgOpacity, bgScale, scale, selectedChanged, selected]);

  const [bgFilled, setBgFilled] = useState(false);

  useAnimatedReaction(
    () => bgScale.value,
    (currentValue, previousValue) => {
      if (currentValue < 1 && (previousValue === null || previousValue >= 1)) {
        runOnJS(setBgFilled)(false);
      } else if (
        currentValue >= 1 &&
        (previousValue === null || previousValue < 1)
      ) {
        runOnJS(setBgFilled)(true);
      }
    },
    [bgScale.value],
  );

  const borderWidth = 2;

  // The border contributes to the same *thickness* appearance, so to avoid
  // doubling up, we subtract it.
  thickness = thickness - borderWidth;

  const [pressed, setPressed] = useState(false);
  const flat = pressed || disabled;

  return (
    <Pressable
      {...pressableProps}
      disabled={disabled}
      onPressIn={(e) => {
        setPressed(true);
        hapticImpactIfMobile();
        pressableProps.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        pressableProps.onPressOut?.(e);
      }}
      onPress={(e) => {
        setSelected((old) => !old);
        pressableProps.onPress?.(e);
      }}
      ref={ref}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <View
          borderWidth={borderWidth}
          borderBottomWidth={borderWidth + (flat ? 0 : thickness)}
          borderColor={selected && bgFilled ? `$accent9` : `$borderColor`}
          borderRadius={size === `$1` ? `$3` : `$4`}
          marginTop={flat ? thickness : 0}
          paddingTop="$1"
          paddingBottom="$1"
          paddingLeft="$3"
          paddingRight="$3"
          flexGrow={1}
          flexShrink={1}
          alignItems="center"
          justifyContent="center"
          transformOrigin="center"
          opacity={disabled ? 0.5 : undefined}
        >
          <Animated.View
            style={{
              position: `absolute`,
              // HACK: fixes border radius on the parent from looking wonky
              top: 0.5,
              left: 0.5,
              right: 0.5,
              bottom: 0.5,
              zIndex: -1,
              opacity: bgOpacity,
              transform: [{ scale: bgScale }],
            }}
          >
            <View
              backgroundColor="$accent4"
              borderRadius="$2"
              style={{
                position: `absolute`,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          </Animated.View>
          <ButtonText accent={selected}>{children}</ButtonText>
        </View>
      </Animated.View>
    </Pressable>
  );
});

const variants = {
  accent: { ":boolean": () => ({}) },
  size: {
    $1: {},
    $2: {},
  },
} as const;

const BaseText = styled(SizableText, { variants });

const ButtonText = styled(BaseText, {
  userSelect: `none`,
  fontWeight: `bold`,
  size: `$3`,
  textTransform: `uppercase`,

  variants: {
    accent: {
      ":boolean": (accent, { theme }) => {
        return { color: accent ? theme.accent9 : theme.color };
      },
    },
  },
});
