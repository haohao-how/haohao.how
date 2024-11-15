const prodDomain = `haohao.how`;
const ngrokDomain = `${process.env.EXPO_TUNNEL_SUBDOMAIN}.ngrok.io`;

/** @type {import('expo/config').ExpoConfig} */
export const expo = {
  expo: {
    name: `Hao`,
    slug: `hao`,
    version: `1.9.0`,
    scheme: `hao`,
    runtimeVersion: {
      policy: `fingerprint`,
    },
    orientation: `portrait`,
    icon: `./src/assets/icon.png`,
    userInterfaceStyle: `automatic`,
    splash: {
      image: `./src/assets/splash.png`,
      resizeMode: `contain`,
      backgroundColor: `#ffffff`,
    },
    assetBundlePatterns: [`**/*`],
    ios: {
      config: {
        usesNonExemptEncryption: false,
      },
      supportsTablet: true,
      bundleIdentifier: `how.haohao.hoa`,
      associatedDomains: [
        `applinks:${prodDomain}`,
        // Development
        `applinks:${ngrokDomain}`,
        `activitycontinuation:${ngrokDomain}`,
        `webcredentials:${ngrokDomain}`,
      ],
      usesAppleSignIn: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: `./src/assets/adaptive-icon.png`,
        backgroundColor: `#ffffff`,
      },
      intentFilters: [
        {
          action: `VIEW`,
          autoVerify: true,
          data: [
            {
              scheme: `https`,
              host: `*.${prodDomain}`,
              pathPrefix: `/learn`,
            },
          ],
          category: [`BROWSABLE`, `DEFAULT`],
        },
      ],
      package: `how.haohao.hoa`,
    },
    web: {
      bundler: `metro`,
      output: `server`,
      favicon: `./src/assets/favicon.png`,
    },
    extra: {
      eas: {
        projectId: `67cd571e-6234-4837-8e61-d9b4d19f0acf`,
      },
    },
    owner: `haohaohow`,
    updates: {
      url: `https://u.expo.dev/67cd571e-6234-4837-8e61-d9b4d19f0acf`,
      assetPatternsToBeBundled: [`./src/**/*.jsonasset`],
    },
    plugins: [
      [
        `expo-router`,
        {
          origin: `https://${process.env.NODE_ENV === `development` ? ngrokDomain : prodDomain}`,
        },
      ],
      [
        `@sentry/react-native/expo`,
        {
          organization: `haohaohow`,
          project: `app`,
          url: `https://sentry.io/`,
        },
      ],
      `expo-apple-authentication`,
      `expo-asset`,
      `expo-font`,
      `expo-secure-store`,
    ],
    experiments: {
      typedRoutes: true,
    },
  },
};
