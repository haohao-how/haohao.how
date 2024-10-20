import { ElementRef, forwardRef } from "react";
import { Pressable, Text, View, ViewProps } from "react-native";
import { tv } from "tailwind-variants";
import { PropsOf } from "./types";
import { hapticImpactIfMobile } from "./util";

export type ButtonVariant = `filled` | `outline` | `bare`;

export type ButtonSize = `$1` | `$2`;

export type RectButton2Props = {
  theme?: `success` | `danger`;
  thickness?: number;
  variant?: ButtonVariant;
  size?: ButtonSize;
  accent?: boolean;
  children?: ViewProps[`children`];
} & Omit<PropsOf<typeof Pressable>, `children`>;

export const RectButton2 = forwardRef<
  ElementRef<typeof Pressable>,
  RectButton2Props
>(function RectButton2(
  {
    theme,
    thickness = 3,
    children,
    variant = `outline`,
    accent = false,
    size = `$1`,
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
    <View
      className={
        theme === `success`
          ? `success-theme`
          : theme === `danger`
            ? `danger-theme`
            : undefined
      }
    >
      <Pressable
        {...pressableProps}
        onPressIn={(e) => {
          hapticImpactIfMobile();
          pressableProps.onPressIn?.(e);
        }}
        ref={ref}
      >
        {({ pressed }) => (
          <View
            className={bottomLayer({ accent, size, variant })}
            style={{
              flexGrow: 1,
              flexShrink: 1,
              opacity: disabled ? 0.5 : undefined,
            }}
          >
            <View
              className={topLayer({ accent, size, variant })}
              style={[
                {
                  borderWidth,
                  flexGrow: 1,
                  flexShrink: 1,
                  alignItems: `center`,
                  justifyContent: `center`,
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
    </View>
  );
});

const bottomLayer = tv({
  variants: {
    size: {
      $1: `rounded-lg`,
      $2: `rounded-xl`,
    },
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
  base: `px-3 py-1`,
  variants: {
    size: {
      $1: `rounded-lg`,
      $2: `rounded-xl`,
    },
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
