import { ReplicacheProvider } from "@/components/ReplicacheContext";
import { config as tamaguiConfig } from "@/tamagui.config";
import { trpc } from "@/util/trpc";
import {
  Theme as ReactNavigationTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import { TamaguiProvider } from "@tamagui/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useFonts } from "expo-font";
import { Slot, SplashScreen, useNavigationContainerRef } from "expo-router";
import * as Updates from "expo-updates";
import { useEffect, useState } from "react";
import { Platform, useColorScheme } from "react-native";

// Via the guide: https://docs.expo.dev/guides/using-sentry/
const manifest = Updates.manifest;
const metadata = `metadata` in manifest ? manifest.metadata : undefined;
const extra = `extra` in manifest ? manifest.extra : undefined;
const updateGroup =
  metadata && `updateGroup` in metadata ? metadata.updateGroup : undefined;

// Construct a new instrumentation instance. This is needed to communicate between the integration and React
const routingInstrumentation = new Sentry.ReactNavigationInstrumentation();

Sentry.init({
  enabled: !__DEV__,
  dsn: `https://88e3787d84756d748f01113cc6a01fde@o4506645802909696.ingest.us.sentry.io/4506645804679168`,
  // If `true`, Sentry will try to print out useful debugging information if
  // something goes wrong with sending the event. Set it to `false` in
  // production
  debug: __DEV__,
  integrations: [
    new Sentry.ReactNativeTracing({
      routingInstrumentation,
    }),
  ],
});

Sentry.configureScope((scope) => {
  scope.setTag(`expo-update-id`, Updates.updateId);
  scope.setTag(`expo-is-embedded-update`, Updates.isEmbeddedLaunch);
  scope.setTag(`platform-os`, Platform.OS);
  scope.setTag(`platform-version`, Platform.Version);

  if (typeof updateGroup === `string`) {
    scope.setTag(`expo-update-group-id`, updateGroup);

    const owner = extra?.expoClient?.owner ?? `[account]`;
    const slug = extra?.expoClient?.slug ?? `[project]`;
    scope.setTag(
      `expo-update-debug-url`,
      `https://expo.dev/accounts/${owner}/projects/${slug}/updates/${updateGroup}`,
    );
  } else if (Updates.isEmbeddedLaunch) {
    // This will be `true` if the update is the one embedded in the build, and not one downloaded from the updates server.
    scope.setTag(
      `expo-update-debug-url`,
      `not applicable for embedded updates`,
    );
  }
});

function RootLayout() {
  // Capture the NavigationContainer ref and register it with the instrumentation.
  const ref = useNavigationContainerRef();
  const colorScheme = useColorScheme() ?? undefined;

  useEffect(() => {
    routingInstrumentation.registerNavigationContainer(ref);
  }, [ref]);

  const [queryClient] = useState(() => new QueryClient());

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `/api/trpc`,

          // You can pass any HTTP headers you wish here
          // eslint-disable-next-line @typescript-eslint/require-await
          async headers() {
            return {
              // authorization: getAuthCookie(),
            };
          },
        }),
      ],
    }),
  );

  const [fontsLoaded, fontError] = useFonts({
    "MaShanZheng-Regular": require(`@/assets/fonts/MaShanZheng-Regular.ttf`),
    "NotoSerifSC-Medium": require(`@/assets/fonts/NotoSerifSC-Medium.otf`),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch((e: unknown) =>
        Sentry.captureException(e),
      );
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ReplicacheProvider>
          <TamaguiProvider
            key={
              // Forces changes to the tamagui theme to be reflected on hot
              // reload in Expo Go. Without this changes to colors or tokens
              // don't cause components to re-render because the values are not
              // passed down using a context, instead they're stored in a module
              // global in tamagui (see `getConfig()`).
              //
              // It works fine without this on web because TamaguiProvider
              // rewrites the CSS on the page (no need to re-render react
              // elements).
              process.env.NODE_ENV !== `production`
                ? JSON.stringify(tamaguiConfig)
                : undefined
            }
            config={tamaguiConfig}
            defaultTheme={colorScheme}
          >
            <ThemeProvider
              // Even though this looks like an no-op layout—it's not, and it ensures the
              // top and bottom of the app have the correct color.
              value={
                {
                  dark: false,
                  colors: {
                    background: `transparent`,
                    // We should never see these colors, instead tamagui should
                    // have priority.
                    border: BUG_DETECTOR_COLOR,
                    card: BUG_DETECTOR_COLOR,
                    notification: BUG_DETECTOR_COLOR,
                    primary: BUG_DETECTOR_COLOR,
                    text: BUG_DETECTOR_COLOR,
                  },
                } satisfies ReactNavigationTheme
              }
            >
              <Slot />
            </ThemeProvider>
          </TamaguiProvider>
        </ReplicacheProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const BUG_DETECTOR_COLOR = `pink`;

// Wrap the Root Layout route component with `Sentry.wrap` to capture gesture info and profiling data.
export default Sentry.wrap(RootLayout);
