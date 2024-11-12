// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require(`expo/metro-config`);
const { withSentryConfig } = require(`@sentry/react-native/metro`);
const { withNativeWind } = require(`nativewind/metro`);

let config = getDefaultConfig(__dirname);

// Fixes "Metro has encountered an error: While trying to resolve module `replicache-react`"
config.resolver.unstable_enablePackageExports = true;

config.resolver.assetExts = [...config.resolver.assetExts, `jsonasset`];

config = withSentryConfig(config);

config = withNativeWind(config, { input: `./src/global.css`, inlineRem: 16 });

module.exports = config;
