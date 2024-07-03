import * as Sentry from "@sentry/react-native";
import { Stack } from "expo-router";

function LearnLayout() {
  // Even though this looks like an no-op layout—it's not, and it ensures the
  // top and bottom of the app have the correct color.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="quiz" />
    </Stack>
  );
}

// Wrap the Root Layout route component with `Sentry.wrap` to capture gesture info and profiling data.
export default Sentry.wrap(LearnLayout);
