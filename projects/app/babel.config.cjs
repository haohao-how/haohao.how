// @ts-check

/** @type {import('@babel/core').ConfigFunction} */
module.exports = function (api) {
  api.cache.never();

  return {
    presets: [`babel-preset-expo`],
    plugins: [
      // [
      //   `@tamagui/babel-plugin`,
      //   {
      //     // components: [`tamagui`],
      //     config: `./src/tamagui.config.ts`,
      //     logTimings: true,
      //     disableExtraction: process.env.NODE_ENV === `development`,
      //   },
      // ],
      // NOTE: this is only necessary if you are using reanimated for animations
      // 'react-native-reanimated/plugin',
    ],
  };
};
