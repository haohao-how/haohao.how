import { useTheme, View } from "@tamagui/core";
import { Platform } from "react-native";
import { PropsOf } from "./types";

/**
 * Ensures on web that the top status bar background color matches the view background.
 */
export function RootView(props: PropsOf<typeof View>) {
  const theme = useTheme();

  return (
    <>
      <View
        {...props}
        backgroundColor="$background"
        // style={[viewProps.style, { backgroundColor: background }]}
      />
      {
        // On iOS Safari the top status bar area of the screen color is white by default.
        Platform.OS === `web` && theme.background.variable != null ? (
          // Inspired by how expo sets the reset styles
          // https://github.com/expo/expo/blob/44c3a60b1be80a475f59782c64c3b4909c88d7d3/packages/expo-router/src/static/html.tsx#L12
          <style
            dangerouslySetInnerHTML={{
              __html: `body{background-color: ${theme.background.variable}`,
            }}
          />
        ) : null
      }
    </>
  );
}
