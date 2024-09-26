import { styled, Theme, ThemeName, View } from "@tamagui/core";
import { SizableText } from "@tamagui/text";
import { ElementRef, forwardRef } from "react";
import { Pressable, ViewProps } from "react-native";
import { PropsOf } from "./types";
import { hapticImpactIfMobile } from "./util";

export type ButtonVariant = `filled` | `outline` | `bare`;

export type ButtonSize = `$1` | `$2`;

export type RectButton2Props = {
  theme?: ThemeName;
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
    thickness = 4,
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
    <Theme name={theme}>
      <Pressable
        {...pressableProps}
        onPressIn={(e) => {
          hapticImpactIfMobile();
          pressableProps.onPressIn?.(e);
        }}
        ref={ref}
      >
        {({ pressed }) => (
          <BottomLayer
            style={{
              flexGrow: 1,
              flexShrink: 1,
              opacity: disabled ? 0.5 : undefined,
            }}
            size={size}
            accent={accent}
            variant={variant}
          >
            <TopLayer
              // top surface
              borderWidth={borderWidth}
              accent={accent}
              variant={variant}
              size={size}
              style={[
                {
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
              <ButtonText variant={variant} accent={accent}>
                {children}
              </ButtonText>
            </TopLayer>
          </BottomLayer>
        )}
      </Pressable>
    </Theme>
  );
});

const variants = {
  accent: { ":boolean": () => ({}) },
  size: {
    $1: {},
    $2: {},
  },
  variant: {
    filled: {},
    outline: {},
    bare: {},
  } satisfies { [K in ButtonVariant]: unknown },
} as const;

const BaseView = styled(View, { variants });

const BottomLayer = styled(BaseView, {
  name: `Button`,

  variants: {
    size: {
      $1: { borderRadius: `$3` },
      $2: { borderRadius: `$4` },
    },
    accent: {
      ":boolean": (accent, { props: { variant }, theme }) => {
        switch (variant) {
          case `filled`: {
            return {
              backgroundColor: accent ? theme.accent9 : theme.color8,
            };
          }
          case `outline`: {
            return {
              backgroundColor: accent ? theme.accent9 : theme.borderColor,
            };
          }
          case `bare`:
          case undefined: {
            return {};
          }
        }
      },
    },
  },
} as const);

const TopLayer = styled(BaseView, {
  paddingTop: `$1`,
  paddingBottom: `$1`,
  paddingLeft: `$3`,
  paddingRight: `$3`,

  variants: {
    size: {
      $1: { borderRadius: `$3` },
      $2: { borderRadius: `$4` },
    },
    accent: {
      ":boolean": (accent, { props: { variant }, theme }) => {
        switch (variant) {
          case `filled`: {
            return {
              backgroundColor: accent ? theme.accent10 : theme.color9,
            };
          }
          case `outline`: {
            return {
              backgroundColor: accent ? theme.accent4 : theme.background,
              borderColor: accent ? theme.accent9 : theme.borderColor,
            };
          }
          case `bare`:
          case undefined: {
            return {};
          }
        }
      },
    },
  },
});

const BaseText = styled(SizableText, { variants });

const ButtonText = styled(BaseText, {
  userSelect: `none`,
  fontWeight: `bold`,
  size: `$3`,
  textTransform: `uppercase`,

  variants: {
    accent: {
      ":boolean": (accent, { props: { variant }, theme }) => {
        switch (variant) {
          case `filled`: {
            return {
              color: theme.background,
            };
          }
          case `outline`:
          case `bare`: {
            return { color: accent ? theme.accent9 : theme.color };
          }
          case undefined: {
            return {};
          }
        }
      },
    },
  },
});
