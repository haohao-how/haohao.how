declare module "eslint-plugin-deprecation" {
  import type { Linter } from "@typescript-eslint/utils/ts-eslint";

  declare const exprt: {
    rules: NonNullable<Linter.Plugin[`rules`]>;
  };
  export = exprt;
}
