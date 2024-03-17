import { ThemeProvider, useTheme } from "@react-navigation/native";
import { Platform, View } from "react-native";
import { PropsOf } from "./types";

/**
 * Ensures on web that the top status bar background color matches the view background.
 */
export function RootView({
  backgroundColor,
  ...viewProps
}: { backgroundColor?: string } & PropsOf<typeof View>) {
  const theme = useTheme();
  const background = backgroundColor ?? theme.colors.background;

  return (
    <ThemeProvider
      value={{ ...theme, colors: { ...theme.colors, background } }}
    >
      <View
        {...viewProps}
        style={[viewProps.style, { backgroundColor: background }]}
      />
      {
        // On iOS Safari the top status bar area of the screen color is white by default.
        Platform.OS === "web" ? (
          // Inspired by how expo sets the reset styles
          // https://github.com/expo/expo/blob/44c3a60b1be80a475f59782c64c3b4909c88d7d3/packages/expo-router/src/static/html.tsx#L12
          <style
            dangerouslySetInnerHTML={{
              __html: `body{background-color: ${background}`,
            }}
          />
        ) : null
      }
    </ThemeProvider>
  );
}
