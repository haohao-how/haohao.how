import url from "node:url";

import { FlatCompat } from "@eslint/eslintrc";
import stylisticPlugin from "@stylistic/eslint-plugin";
import deprecationPlugin from "eslint-plugin-deprecation";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import reactCompilerPlugin from "eslint-plugin-react-compiler";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

const __dirname = url.fileURLToPath(new URL(`.`, import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

// Based on https://github.com/typescript-eslint/typescript-eslint/blob/41323746de299e6d62b4d6122975301677d7c8e0/eslint.config.mjs
export default tseslint.config(
  {
    // note - intentionally uses computed syntax to make it easy to sort the keys
    plugins: {
      [`react-compiler`]: reactCompilerPlugin,
      [`@typescript-eslint`]: tseslint.plugin,
      [`@stylistic`]: stylisticPlugin,
      // ['@typescript-eslint/internal']: tseslintInternalPlugin,
      [`deprecation`]: deprecationPlugin,
      // ['eslint-comments']: eslintCommentsPlugin,
      // ['eslint-plugin']: eslintPluginPlugin,
      [`import`]: importPlugin,
      // ['jest']: jestPlugin,
      // ['jsdoc']: jsdocPlugin,
      // ['jsx-a11y']: jsxA11yPlugin,
      [`react-hooks`]: reactHooksPlugin,
      [`react`]: reactPlugin,
      // ['simple-import-sort']: simpleImportSortPlugin,
      // ['unicorn']: unicornPlugin,
    },
  },

  {
    // config with just ignores is the replacement for `.eslintignore`
    ignores: [`.expo/`, `.vercel/`, `dist/`, `node_modules/`],
  },

  // extends ...
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // base config
  {
    files: [`{api,src}/**/*.{cjs,js,ts,tsx}`, `*.{cjs,mjs,js,ts}`],
    languageOptions: {
      globals: {
        ...globals.es2020,
        ...globals.node,
      },
      parserOptions: {
        allowAutomaticSingleRunInference: true,
        project: [`tsconfig.json`],
      },
    },
  },

  {
    files: [`bin/**/*`],
    languageOptions: {
      globals: {
        ...globals.es2022,
        ...globals.node,
      },
      parserOptions: {
        allowAutomaticSingleRunInference: true,
        project: [`bin/tsconfig.json`],
      },
    },
  },

  {
    extends: [
      ...compat.config(reactPlugin.configs.recommended),
      ...compat.config(reactHooksPlugin.configs.recommended),
    ],
    settings: {
      react: {
        version: `detect`,
      },
    },

    rules: {
      // Expo or react-native or metro or something handles this, so there's no
      // need to import React.
      "react/react-in-jsx-scope": `off`,

      "react/no-children-prop": [`error`, { allowFunctions: true }],

      "react-compiler/react-compiler": `error`,

      // make sure we're not leveraging any deprecated APIs
      "deprecation/deprecation": `error`,

      //
      // eslint-base
      //

      curly: [`error`, `all`],
      "logical-assignment-operators": `error`,
      "no-else-return": `error`,
      "no-console": `error`,
      "no-process-exit": `error`,
      "no-fallthrough": [
        `error`,
        { commentPattern: `.*intentional fallthrough.*` },
      ],
      "one-var": [`error`, `never`],

      "no-restricted-imports": [
        `error`,
        {
          paths: [
            {
              name: `react-native`,
              importNames: [`SafeAreaView`],
              message: `Please use \`useSafeAreaInsets\` from \`react-native-safe-area-context\` instead.`,
            },
            {
              name: `hanzi`,
              message: `Please use @/dictionary/hanzi instead.`,
            },
            {
              name: `lodash`,
              message: `Please use lodash/* instead.`,
            },
          ],
        },
      ],

      "object-shorthand": `error`,

      //
      // eslint-plugin-import
      //

      // enforces consistent type specifier style for named imports
      "import/consistent-type-specifier-style": `error`,
      // disallow non-import statements appearing before import statements
      "import/first": `error`,
      // Require a newline after the last import/require in a group
      "import/newline-after-import": `error`,
      // Forbid import of modules using absolute paths
      "import/no-absolute-path": `error`,
      // disallow AMD require/define
      "import/no-amd": `error`,
      // forbid default exports - we want to standardize on named exports so that imported names are consistent
      "import/no-default-export": `error`,
      // disallow imports from duplicate paths
      "import/no-duplicates": `error`,
      // Forbid the use of extraneous packages
      "import/no-extraneous-dependencies": [
        `error`,
        {
          devDependencies: true,
          peerDependencies: true,
          optionalDependencies: false,
        },
      ],
      // Forbid mutable exports
      "import/no-mutable-exports": `error`,
      // Prevent importing the default as if it were named
      "import/no-named-default": `error`,
      // Prohibit named exports
      "import/no-named-export": `off`, // we want everything to be a named export
      // Forbid a module from importing itself
      "import/no-self-import": `error`,
      // Require modules with a single export to use a default export
      "import/prefer-default-export": `off`, // we want everything to be named

      //
      // @typescript-eslint
      //

      "@typescript-eslint/no-var-requires": `off`,
      "@typescript-eslint/restrict-template-expressions": [
        `error`,
        { allowBoolean: true, allowNumber: true },
      ],
      "@typescript-eslint/switch-exhaustiveness-check": [
        `error`,
        { requireDefaultForNonUnion: true },
      ],

      //
      // @stylistic
      //
      "@stylistic/quotes": [`error`, `backtick`],
    },
  },
);
