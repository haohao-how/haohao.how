const { createRequestHandler } = require(`@expo/server/adapter/vercel`);

module.exports = createRequestHandler({
  build: require(`path`).join(__dirname, `../dist/vercel/server`),
  mode: process.env.NODE_ENV,
});
