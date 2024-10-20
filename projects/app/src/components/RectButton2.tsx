import { ElementRef, forwardRef } from "react";
import { Pressable, Text, View, ViewProps } from "react-native";
import { tv } from "tailwind-variants";
import { PropsOf } from "./types";
import { hapticImpactIfMobile } from "./util";

export type ButtonVariant = `filled` | `outline` | `bare`;

export type ButtonSize = `$1` | `$2`;

export type RectButton2Props = {
  thickness?: number;
  variant?: ButtonVariant;
  accent?: boolean;
  children?: ViewProps[`children`];
} & Omit<PropsOf<typeof Pressable>, `children`>;

export const RectButton2 = forwardRef<
  ElementRef<typeof Pressable>,
  RectButton2Props
>(function RectButton2(
  {
    thickness = 3,
    children,
    variant = `outline`,
    accent = false,
    ...pressableProps
  },
  ref,
) {
  const borderWidth = variant === `outline` ? 2 : 0;

  // The border contributes to the same *thickness* appearance, so to avoid
  // doubling up, we subtract it.
  thickness = thickness - borderWidth;

  const disabled = pressableProps.disabled === true;

  if (disabled) {
    thickness = 0;
    accent = false;
  }

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
        <View className={bottomLayer({ accent, variant, disabled })}>
          <View
            className={topLayer({ accent, variant })}
            style={[
              {
                borderWidth,
                transform: [
                  {
                    translateY:
                      disabled || variant === `bare` || pressed
                        ? 0
                        : -thickness,
                  },
                ],
                transformOrigin: `top`,
              },
            ]}
          >
            <Text className={baseText({ variant, accent })}>{children}</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
});

const bottomLayer = tv({
  base: `flex-1 rounded-lg`,
  variants: {
    variant: {
      filled: ``,
      outline: ``,
      bare: ``,
    },
    accent: {
      true: ``,
    },
    disabled: {
      true: `opacity-50`,
    },
  },
  compoundVariants: [
    {
      variant: `filled`,
      accent: true,
      class: `bg-accent-9`,
    },
    {
      variant: `filled`,
      accent: false,
      class: `bg-primary-8`,
    },
    {
      variant: `outline`,
      accent: true,
      class: `bg-accent-9`,
    },
    {
      variant: `outline`,
      accent: false,
      class: `bg-primary-7`,
    },
  ],
});

const topLayer = tv({
  base: `px-3 py-1 flex-1 items-center justify-center rounded-lg`,
  variants: {
    variant: {
      filled: ``,
      outline: ``,
      bare: ``,
    },
    accent: {
      true: ``,
    },
  },
  compoundVariants: [
    {
      variant: `filled`,
      accent: true,
      class: `bg-accent-10`,
    },
    {
      variant: `filled`,
      accent: false,
      class: `bg-primary-9`,
    },
    {
      variant: `outline`,
      accent: true,
      class: `bg-accent-4 border-accent-9`,
    },
    {
      variant: `outline`,
      accent: false,
      class: `bg-primary-2 border-primary-7`,
    },
  ],
});

const baseText = tv({
  base: `font-bold select-none text-sm uppercase`,
  variants: {
    variant: {
      filled: ``,
      outline: ``,
      bare: ``,
    },
    accent: {
      true: ``,
    },
  },
  compoundVariants: [
    {
      variant: [`outline`, `bare`],
      accent: true,
      class: `text-accent-9`,
    },
    {
      variant: [`outline`, `bare`],
      accent: false,
      class: `text-primary-12`,
    },
  ],
});
