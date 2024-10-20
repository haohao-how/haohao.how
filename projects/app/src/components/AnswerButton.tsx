import { ElementRef, forwardRef, useEffect, useState } from "react";
import { Pressable, Text, View, ViewProps } from "react-native";
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

export type AnswerButtonState = `default` | `selected` | `success` | `error`;

export type AnswerButtonProps = {
  size?: ButtonSize;
  children?: ViewProps[`children`];
  state?: AnswerButtonState;
} & Omit<PropsOf<typeof Pressable>, `children`>;

export const AnswerButton = forwardRef<
  ElementRef<typeof Pressable>,
  AnswerButtonProps
>(function AnswerButton(
  {
    disabled = false,
    children,
    state = `default`,
    size = `$1`,
    ...pressableProps
  },
  ref,
) {
  // const [state, setState] = useState<AnswerButtonState>(`default`);
  const [prevState, setPrevState] = useState(state);

  const scale = useSharedValue(1);
  const bgScale = useSharedValue(0.5);
  const bgOpacity = useSharedValue(0);

  const animationFactor = 1;

  useEffect(() => {
    setPrevState(state);
  }, [state]);

  const stateChanged = state !== prevState;

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

  useEffect(() => {
    if (stateChanged) {
      switch (state) {
        case `default`:
          setBgFilled(false);
          bgScale.value = 0.5;
          bgOpacity.value = 0;
          break;
        case `selected`: {
          scale.value = withClamp({ min: 1 }, withScaleAnimation());
          bgScale.value = withClamp({ max: 1 }, withScaleAnimation());
          bgOpacity.value = withTiming(1, { duration: 100 * animationFactor });
          break;
        }
        case `error`: {
          scale.value = withClamp({ min: 1 }, withScaleAnimation());
          bgScale.value = withClamp({ max: 1 }, withScaleAnimation());
          bgOpacity.value = withTiming(1, { duration: 100 * animationFactor });
          break;
        }
        case `success`: {
          scale.value = withClamp({ min: scale.value }, withScaleAnimation());
          bgScale.value = withClamp(
            { min: bgScale.value, max: 1 },
            withScaleAnimation(),
          );
          bgOpacity.value = withClamp(
            { min: bgOpacity.value },
            withTiming(1, { duration: 100 * animationFactor }),
          );
          break;
        }
      }
    }
  }, [bgOpacity, bgScale, scale, stateChanged, state]);

  const [bgFilled, setBgFilled] = useState(false);

  // When the background scale reaches 100% update `bgFilled` to make the border
  // bright.
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

  const [pressed, setPressed] = useState(false);
  const flat = pressed || disabled;

  return (
    <View
      className={
        state === `default` || state === `selected`
          ? undefined
          : state === `success`
            ? `success-theme`
            : `danger-theme`
      }
    >
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
          pressableProps.onPress?.(e);
        }}
        ref={ref}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <View
            className={`${disabled ? `opacity-50` : ``} origin-center ${flat ? `mt-[2px]` : `border-b-4`} ${size === `$1` ? `rounded-lg` : `rounded-xl`} align-center flex-1 justify-center border-2 px-3 py-1 ${state !== `default` && bgFilled ? `border-accent-9` : `border-primary-7`}`}
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
              <View className="absolute bottom-0 left-0 right-0 top-0 rounded-lg bg-accent-4" />
            </Animated.View>
            <Text
              className={`select-none text-center text-sm font-bold uppercase ${state !== `default` ? `text-accent-9` : `text-text`}`}
            >
              {children}
            </Text>
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
});
