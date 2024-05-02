/* eslint-disable @typescript-eslint/prefer-function-type */

declare global {
  interface NodeRequire {
    // Support for asset files. Anything that starts with a dot and ends with a
    // known extension.
    (id: `.${string}.${"ttf" | "otf" | "svg"}`): string;
  }
}

export {};
