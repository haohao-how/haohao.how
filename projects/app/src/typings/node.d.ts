/* eslint-disable @typescript-eslint/prefer-function-type */

declare global {
  interface NodeRequire {
    // Support for asset files. Anything that starts with a dot and ends with a
    // known extension.
    (id: `${string}.${`ttf` | `otf` | `svg` | `png`}`): string;
  }

  namespace NodeJS {
    // Necessary to avoid noPropertyAccessFromIndexSignature errors. Keep in
    // sync with `env.ts`.
    interface ProcessEnv {
      EXPO_PUBLIC_REPLICACHE_LICENSE_KEY?: string;
      NEON_DATABASE_URL?: string;
    }
  }
}

export {};
