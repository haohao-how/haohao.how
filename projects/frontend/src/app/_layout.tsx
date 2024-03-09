import * as Sentry from "@sentry/react-native";
import { Slot, useNavigationContainerRef } from "expo-router";
import * as Updates from "expo-updates";
import { useEffect } from "react";
import { Platform } from "react-native";

// Via the guide: https://docs.expo.dev/guides/using-sentry/
const manifest = Updates.manifest;
const metadata = "metadata" in manifest ? manifest.metadata : undefined;
const extra = "extra" in manifest ? manifest.extra : undefined;
const updateGroup =
  metadata && "updateGroup" in metadata ? metadata.updateGroup : undefined;

// Construct a new instrumentation instance. This is needed to communicate between the integration and React
const routingInstrumentation = new Sentry.ReactNavigationInstrumentation();

Sentry.init({
  dsn: "https://88e3787d84756d748f01113cc6a01fde@o4506645802909696.ingest.us.sentry.io/4506645804679168",
  // If `true`, Sentry will try to print out useful debugging information if
  // something goes wrong with sending the event. Set it to `false` in
  // production
  debug: true,
  integrations: [
    new Sentry.ReactNativeTracing({
      routingInstrumentation,
    }),
  ],
});

Sentry.configureScope((scope) => {
  scope.setTag("expo-update-id", Updates.updateId);
  scope.setTag("expo-is-embedded-update", Updates.isEmbeddedLaunch);
  scope.setTag("platform-os", Platform.OS);
  scope.setTag("platform-version", Platform.Version);

  if (typeof updateGroup === "string") {
    scope.setTag("expo-update-group-id", updateGroup);

    const owner = extra?.expoClient?.owner ?? "[account]";
    const slug = extra?.expoClient?.slug ?? "[project]";
    scope.setTag(
      "expo-update-debug-url",
      `https://expo.dev/accounts/${owner}/projects/${slug}/updates/${updateGroup}`,
    );
  } else if (Updates.isEmbeddedLaunch) {
    // This will be `true` if the update is the one embedded in the build, and not one downloaded from the updates server.
    scope.setTag(
      "expo-update-debug-url",
      "not applicable for embedded updates",
    );
  }
});

function RootLayout() {
  // Capture the NavigationContainer ref and register it with the instrumentation.
  const ref = useNavigationContainerRef();

  useEffect(() => {
    if (ref) {
      routingInstrumentation.registerNavigationContainer(ref);
    }
  }, [ref]);

  // Even though this looks like an no-op layout—it's not, and it ensures the
  // top and bottom of the app have the correct color.
  return <Slot />;
}

// Wrap the Root Layout route component with `Sentry.wrap` to capture gesture info and profiling data.
export default Sentry.wrap(RootLayout);
