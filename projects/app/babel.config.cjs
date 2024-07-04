// @ts-check

/** @type {import('@babel/core').ConfigFunction} */
module.exports = function (api) {
  api.cache.never();
  return {
    presets: [`babel-preset-expo`],
  };
};
