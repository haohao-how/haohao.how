import {
  blue,
  blueDark,
  cyan,
  cyanDark,
  gold,
  goldDark,
  gray,
  grayDark,
  lime,
  limeDark,
  mauve,
  mauveDark,
  red,
  redDark,
  slate,
  slateDark,
} from "@tamagui/colors";
import { createFont, createTamagui, createTokens, isWeb } from "@tamagui/core";
import Color from "color";

function suffixObjKeys<
  T extends Record<string, unknown>,
  Suffix extends string,
>(
  object: T,
  suffix: Suffix,
): {
  [K in Extract<keyof T, string> as `${K}${Suffix}`]: T[K];
} {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return Object.fromEntries(
    Object.entries(object).map(([k, v]) => [`${k}${suffix}`, v]),
  ) as never;
}

const slateDullLight = suffixObjKeys(
  Object.fromEntries(
    Object.entries(slate).map(([k, v]) => [
      k,
      Color(v).lighten(0.4).hsl().toString(),
    ]),
  ) as typeof slate,
  `Dull`,
);

const slateDullDark = suffixObjKeys(
  Object.fromEntries(
    Object.entries(slateDark).map(([k, v]) => [
      k,
      Color(v).darken(0.4).hsl().toString(),
    ]),
  ) as typeof slateDark,
  `Dull`,
);

const tokens = createTokens({
  color: {
    ...suffixObjKeys(blue, `Light`),
    ...suffixObjKeys(blueDark, `Dark`),
    ...suffixObjKeys(cyan, `Light`),
    ...suffixObjKeys(cyanDark, `Dark`),
    ...suffixObjKeys(lime, `Light`),
    ...suffixObjKeys(limeDark, `Dark`),
    ...suffixObjKeys(mauve, `Light`),
    ...suffixObjKeys(mauveDark, `Dark`),
    ...suffixObjKeys(gold, `Light`),
    ...suffixObjKeys(goldDark, `Dark`),
    ...suffixObjKeys(red, `Light`),
    ...suffixObjKeys(redDark, `Dark`),
    ...suffixObjKeys(gray, `Light`),
    ...suffixObjKeys(grayDark, `Dark`),
    ...suffixObjKeys(slate, `Light`),
    ...suffixObjKeys(slateDark, `Dark`),
    ...suffixObjKeys(slateDullLight, `Light`),
    ...suffixObjKeys(slateDullDark, `Dark`),
    black: `#000`,
    blue: `#1CB0F5`,
    white: `#fff`,
    white2: `#CCC`,
    red: `#F00`,
    buttonDangerBackgroundDark: `#2E0402`,
    buttonDangerBorderDark: `#83180F`,
    buttonDangerBackgroundLight: `#AE5E56`,
    buttonDangerBorderLight: `#9D4F46`,
  },
  size: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
  },
  space: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
  },
  radius: {
    0: 0,
    1: 4,
    2: 9,
    3: 12,
    4: 16,
  },
  zIndex: {},
});

const darkPalette = {
  slate1: tokens.color.slate1Dark,
  slate2: tokens.color.slate2Dark,
  slate3: tokens.color.slate3Dark,
  slate4: tokens.color.slate4Dark,
  slate5: tokens.color.slate5Dark,
  slate6: tokens.color.slate6Dark,
  slate7: tokens.color.slate7Dark,
  slate8: tokens.color.slate8Dark,
  slate9: tokens.color.slate9Dark,
  slate10: tokens.color.slate10Dark,
  slate11: tokens.color.slate11Dark,
  slate12: tokens.color.slate12Dark,
  cyan1: tokens.color.cyan1Dark,
  cyan2: tokens.color.cyan2Dark,
  cyan3: tokens.color.cyan3Dark,
  cyan4: tokens.color.cyan4Dark,
  cyan5: tokens.color.cyan5Dark,
  cyan6: tokens.color.cyan6Dark,
  cyan7: tokens.color.cyan7Dark,
  cyan8: tokens.color.cyan8Dark,
  cyan9: tokens.color.cyan9Dark,
  cyan10: tokens.color.cyan10Dark,
  cyan11: tokens.color.cyan11Dark,
  cyan12: tokens.color.cyan12Dark,
  lime1: tokens.color.lime1Dark,
  lime2: tokens.color.lime2Dark,
  lime3: tokens.color.lime3Dark,
  lime4: tokens.color.lime4Dark,
  lime5: tokens.color.lime5Dark,
  lime6: tokens.color.lime6Dark,
  lime7: tokens.color.lime7Dark,
  lime8: tokens.color.lime8Dark,
  lime9: tokens.color.lime9Dark,
  lime10: tokens.color.lime10Dark,
  lime11: tokens.color.lime11Dark,
  lime12: tokens.color.lime12Dark,
  red1: tokens.color.red1Dark,
  red2: tokens.color.red2Dark,
  red3: tokens.color.red3Dark,
  red4: tokens.color.red4Dark,
  red5: tokens.color.red5Dark,
  red6: tokens.color.red6Dark,
  red7: tokens.color.red7Dark,
  red8: tokens.color.red8Dark,
  red9: tokens.color.red9Dark,
  red10: tokens.color.red10Dark,
  red11: tokens.color.red11Dark,
  red12: tokens.color.red12Dark,
};

const lightPalette: typeof darkPalette = {
  slate1: tokens.color.slate1Light,
  slate2: tokens.color.slate2Light,
  slate3: tokens.color.slate3Light,
  slate4: tokens.color.slate4Light,
  slate5: tokens.color.slate5Light,
  slate6: tokens.color.slate6Light,
  slate7: tokens.color.slate7Light,
  slate8: tokens.color.slate8Light,
  slate9: tokens.color.slate9Light,
  slate10: tokens.color.slate10Light,
  slate11: tokens.color.slate11Light,
  slate12: tokens.color.slate12Light,
  cyan1: tokens.color.cyan1Light,
  cyan2: tokens.color.cyan2Light,
  cyan3: tokens.color.cyan3Light,
  cyan4: tokens.color.cyan4Light,
  cyan5: tokens.color.cyan5Light,
  cyan6: tokens.color.cyan6Light,
  cyan7: tokens.color.cyan7Light,
  cyan8: tokens.color.cyan8Light,
  cyan9: tokens.color.cyan9Light,
  cyan10: tokens.color.cyan10Light,
  cyan11: tokens.color.cyan11Light,
  cyan12: tokens.color.cyan12Light,
  lime1: tokens.color.lime1Light,
  lime2: tokens.color.lime2Light,
  lime3: tokens.color.lime3Light,
  lime4: tokens.color.lime4Light,
  lime5: tokens.color.lime5Light,
  lime6: tokens.color.lime6Light,
  lime7: tokens.color.lime7Light,
  lime8: tokens.color.lime8Light,
  lime9: tokens.color.lime9Light,
  lime10: tokens.color.lime10Light,
  lime11: tokens.color.lime11Light,
  lime12: tokens.color.lime12Light,
  red1: tokens.color.red1Light,
  red2: tokens.color.red2Light,
  red3: tokens.color.red3Light,
  red4: tokens.color.red4Light,
  red5: tokens.color.red5Light,
  red6: tokens.color.red6Light,
  red7: tokens.color.red7Light,
  red8: tokens.color.red8Light,
  red9: tokens.color.red9Light,
  red10: tokens.color.red10Light,
  red11: tokens.color.red11Light,
  red12: tokens.color.red12Light,
};

const dark = {
  background: darkPalette.slate2,
  borderColor: darkPalette.slate7,
  color: darkPalette.slate12,

  color1: darkPalette.slate1,
  color2: darkPalette.slate2,
  color3: darkPalette.slate3,
  color4: darkPalette.slate4,
  color5: darkPalette.slate5,
  color6: darkPalette.slate6,
  color7: darkPalette.slate7,
  color8: darkPalette.slate8,
  color9: darkPalette.slate9,
  color10: darkPalette.slate10,
  color11: darkPalette.slate11,
  color12: darkPalette.slate12,
  accent1: darkPalette.cyan1,
  accent2: darkPalette.cyan2,
  accent3: darkPalette.cyan3,
  accent4: darkPalette.cyan4,
  accent5: darkPalette.cyan5,
  accent6: darkPalette.cyan6,
  accent7: darkPalette.cyan7,
  accent8: darkPalette.cyan8,
  accent9: darkPalette.cyan9,
  accent10: darkPalette.cyan10,
  accent11: darkPalette.cyan11,
  accent12: darkPalette.cyan12,
  ...darkPalette,
};

type BaseTheme = typeof dark;

const light: BaseTheme = {
  background: lightPalette.slate2,
  borderColor: lightPalette.slate7,
  color: lightPalette.slate12,

  color1: lightPalette.slate1,
  color2: lightPalette.slate2,
  color3: lightPalette.slate3,
  color4: lightPalette.slate4,
  color5: lightPalette.slate5,
  color6: lightPalette.slate6,
  color7: lightPalette.slate7,
  color8: lightPalette.slate8,
  color9: lightPalette.slate9,
  color10: lightPalette.slate10,
  color11: lightPalette.slate11,
  color12: lightPalette.slate12,
  accent1: lightPalette.cyan1,
  accent2: lightPalette.cyan2,
  accent3: lightPalette.cyan3,
  accent4: lightPalette.cyan4,
  accent5: lightPalette.cyan5,
  accent6: lightPalette.cyan6,
  accent7: lightPalette.cyan7,
  accent8: lightPalette.cyan8,
  accent9: lightPalette.cyan9,
  accent10: lightPalette.cyan10,
  accent11: lightPalette.cyan11,
  accent12: lightPalette.cyan12,
  ...lightPalette,
};

export const config = createTamagui({
  tokens,
  fonts: {
    title: createFont({
      family: isWeb
        ? `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`
        : `System`,
      size: {
        1: 12 + 20,
        2: 14 + 30,
        $true: 12 + 20,
        // 3: 15 + 20,
        // ...
      },
      lineHeight: {
        1: 17 + 20,
        2: 22 + 20,
        // 3: 25 + 20,
        // ...
      },
      // weight: {
      //   4: `300`,
      //   6: `600`,
      // },
      // letterSpacing: {
      //   4: 0,
      //   8: -1,
      // },

      // for native only, alternate family based on weight/style
      // face: {
      //   // pass in weights as keys
      //   700: { normal: `InterBold`, italic: `InterBold-Italic` },
      //   800: { normal: `InterBold`, italic: `InterBold-Italic` },
      //   900: { normal: `InterBold`, italic: `InterBold-Italic` },
      // },
    }),
    body: createFont({
      family: isWeb
        ? `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`
        : `System`,
      size: {
        1: 16,
        $true: 16,
        2: 20,
        3: 24,
        72: 72,
        // 3: 18,
        // ...
      },
      lineHeight: {
        1: 17,
        2: 20,
        3: 24,
        // 3: 25,
        // ...
      },
      weight: {
        1: `400`,
      },
      letterSpacing: {
        1: 0,
      },

      // for native only, alternate family based on weight/style
      // face: {
      //   // pass in weights as keys
      //   700: { normal: `InterBold`, italic: `InterBold-Italic` },
      //   800: { normal: `InterBold`, italic: `InterBold-Italic` },
      //   900: { normal: `InterBold`, italic: `InterBold-Italic` },
      // },
    }),
    chinese: createFont({
      family: `MaShanZheng-Regular`,
      size: {
        1: 16,
        $true: 16,
        2: 20,
        3: 24,
        72: 72,
      },
      lineHeight: {
        1: 17,
        2: 20,
        3: 24,
        72: 72,
      },
      weight: {
        1: `400`,
      },
      letterSpacing: {
        1: 0,
      },

      // for native only, alternate family based on weight/style
      // face: {
      //   // pass in weights as keys
      //   700: { normal: `InterBold`, italic: `InterBold-Italic` },
      //   800: { normal: `InterBold`, italic: `InterBold-Italic` },
      //   900: { normal: `InterBold`, italic: `InterBold-Italic` },
      // },
    }),
  },
  themes: {
    dark,
    dark_Button:
      {} /* fix inferred `theme` option for styled() variants */ as BaseTheme,
    dark_danger: {
      accent1: darkPalette.red1,
      accent2: darkPalette.red2,
      accent3: darkPalette.red3,
      accent4: darkPalette.red4,
      accent5: darkPalette.red5,
      accent6: darkPalette.red6,
      accent7: darkPalette.red7,
      accent8: darkPalette.red8,
      accent9: darkPalette.red9,
      accent10: darkPalette.red10,
      accent11: darkPalette.red11,
      accent12: darkPalette.red12,
    } as BaseTheme,
    dark_success: {
      accent1: darkPalette.lime1,
      accent2: darkPalette.lime2,
      accent3: darkPalette.lime3,
      accent4: darkPalette.lime4,
      accent5: darkPalette.lime5,
      accent6: darkPalette.lime6,
      accent7: darkPalette.lime7,
      accent8: darkPalette.lime8,
      accent9: darkPalette.lime9,
      accent10: darkPalette.lime10,
      accent11: darkPalette.lime11,
      accent12: darkPalette.lime12,
    } as BaseTheme,
    light,
    light_Button: {} as BaseTheme,
    light_danger: {
      accent1: lightPalette.red1,
      accent2: lightPalette.red2,
      accent3: lightPalette.red3,
      accent4: lightPalette.red4,
      accent5: lightPalette.red5,
      accent6: lightPalette.red6,
      accent7: lightPalette.red7,
      accent8: lightPalette.red8,
      accent9: lightPalette.red9,
      accent10: lightPalette.red10,
      accent11: lightPalette.red11,
      accent12: lightPalette.red12,
    } as BaseTheme,
    light_success: {
      accent1: lightPalette.lime1,
      accent2: lightPalette.lime2,
      accent3: lightPalette.lime3,
      accent4: lightPalette.lime4,
      accent5: lightPalette.lime5,
      accent6: lightPalette.lime6,
      accent7: lightPalette.lime7,
      accent8: lightPalette.lime8,
      accent9: lightPalette.lime9,
      accent10: lightPalette.lime10,
      accent11: lightPalette.lime11,
      accent12: lightPalette.lime12,
    } as BaseTheme,
  },
  settings: {
    //   fastSchemeChange: false,
    defaultFont: `body`,

    // shouldAddPrefersColorThemes: true,
    // themeClassNameOnRoot: true,
  },
});

// TypeScript types across all Tamagui APIs
type Conf = typeof config;
declare module "@tamagui/core" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface TamaguiCustomConfig extends Conf {}
}
