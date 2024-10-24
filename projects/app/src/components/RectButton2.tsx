import { ElementRef, forwardRef, useState } from "react";
import { Pressable, Text, ViewProps } from "react-native";
import { tv } from "tailwind-variants";
import { PropsOf } from "./types";
import { hapticImpactIfMobile } from "./util";

export type ButtonVariant = `filled` | `outline` | `bare`;

export type RectButton2Props = {
  variant?: ButtonVariant;
  accent?: boolean;
  children?: ViewProps[`children`];
  className?: string;
} & Omit<PropsOf<typeof Pressable>, `children`>;

export const RectButton2 = forwardRef<
  ElementRef<typeof Pressable>,
  RectButton2Props
>(function RectButton2(
  {
    children,
    variant = `outline`,
    accent = false,
    className,
    ...pressableProps
  },
  ref,
) {
  const disabled = pressableProps.disabled === true;

  if (disabled) {
    accent = false;
  }

  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      {...pressableProps}
      onPressIn={(e) => {
        setPressed(true);
        hapticImpactIfMobile();
        pressableProps.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        pressableProps.onPressOut?.(e);
      }}
      ref={ref}
      className={pressable({
        flat: pressed || disabled,
        className,
        accent,
        variant,
        disabled,
      })}
    >
      <Text className={text({ variant, accent })}>{children}</Text>
    </Pressable>
  );
});

const pressable = tv({
  base: `rounded-lg px-3 py-1 items-center justify-center`,
  variants: {
    variant: {
      filled: ``,
      outline: `border-[2px]`,
      bare: ``,
    },
    flat: {
      true: ``,
    },
    accent: {
      true: ``,
    },
    disabled: {
      true: `opacity-50 select-none cursor-default`,
    },
  },
  compoundVariants: [
    {
      variant: `filled`,
      accent: true,
      class: `bg-accent-10 hover:bg-accent-11 border-accent-9`,
    },
    {
      variant: `filled`,
      accent: false,
      class: `bg-primary-10 hover:bg-primary-11 border-primary-9`,
    },
    {
      variant: `filled`,
      flat: true,
      class: `mt-[4px]`,
    },
    {
      variant: `filled`,
      flat: false,
      class: `border-b-[4px]`,
    },
    {
      variant: `outline`,
      accent: true,
      class: `border-accent-9`,
    },
    {
      variant: `outline`,
      accent: false,
      class: `border-primary-7`,
    },
    {
      variant: `outline`,
      flat: true,
      class: `mt-[2px] border-b-[2px]`,
    },
    {
      variant: [`outline`],
      flat: false,
      class: `border-b-[4px]`,
    },
  ],
});

const text = tv({
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
