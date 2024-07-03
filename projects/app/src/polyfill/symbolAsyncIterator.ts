// Polyfill `Symbol.asyncIterator`
//
// Hermes doesn't have `Symbol.asyncIterator` defined, which breaks support for
// for..await..of, for more info:
//
// - https://github.com/reduxjs/redux-devtools/issues/1382#issuecomment-2093584916
// - https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-3.html#caveats
export function installSymbolAsyncInteratorPolyfill() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  (Symbol as any).asyncIterator ??= Symbol.for(`Symbol.asyncIterator`);
}
