/** Globals is commonjs */
import deprecationPlugin from "eslint-plugin-deprecation";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

// Based on https://github.com/typescript-eslint/typescript-eslint/blob/41323746de299e6d62b4d6122975301677d7c8e0/eslint.config.mjs
export default tseslint.config(
  {
    // note - intentionally uses computed syntax to make it easy to sort the keys
    plugins: {
      ["@typescript-eslint"]: tseslint.plugin,
      // ['@typescript-eslint/internal']: tseslintInternalPlugin,
      ["deprecation"]: deprecationPlugin,
      // ['eslint-comments']: eslintCommentsPlugin,
      // ['eslint-plugin']: eslintPluginPlugin,
      ["import"]: importPlugin,
      // ['jest']: jestPlugin,
      // ['jsdoc']: jsdocPlugin,
      // ['jsx-a11y']: jsxA11yPlugin,
      ["react-hooks"]: reactHooksPlugin,
      ["react"]: reactPlugin,
      // ['simple-import-sort']: simpleImportSortPlugin,
      // ['unicorn']: unicornPlugin,
    },
  },

  {
    // config with just ignores is the replacement for `.eslintignore`
    ignores: [".expo/", "dist/", "node_modules/"],
  },

  // extends ...
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // base config
  {
    languageOptions: {
      globals: {
        ...globals.es2020,
        ...globals.node,
      },
      parserOptions: {
        allowAutomaticSingleRunInference: true,
        project: ["tsconfig.json"],
      },
    },

    rules: {
      // make sure we're not leveraging any deprecated APIs
      "deprecation/deprecation": "error",

      //
      // eslint-base
      //

      curly: ["error", "all"],
      eqeqeq: [
        "error",
        "always",
        {
          null: "never",
        },
      ],
      "logical-assignment-operators": "error",
      "no-else-return": "error",
      "no-console": "error",
      "no-process-exit": "error",
      "no-fallthrough": [
        "error",
        { commentPattern: ".*intentional fallthrough.*" },
      ],
      "one-var": ["error", "never"],

      //
      // eslint-plugin-import
      //

      // enforces consistent type specifier style for named imports
      "import/consistent-type-specifier-style": "error",
      // disallow non-import statements appearing before import statements
      "import/first": "error",
      // Require a newline after the last import/require in a group
      "import/newline-after-import": "error",
      // Forbid import of modules using absolute paths
      "import/no-absolute-path": "error",
      // disallow AMD require/define
      "import/no-amd": "error",
      // forbid default exports - we want to standardize on named exports so that imported names are consistent
      "import/no-default-export": "error",
      // disallow imports from duplicate paths
      "import/no-duplicates": "error",
      // Forbid the use of extraneous packages
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: true,
          peerDependencies: true,
          optionalDependencies: false,
        },
      ],
      // Forbid mutable exports
      "import/no-mutable-exports": "error",
      // Prevent importing the default as if it were named
      "import/no-named-default": "error",
      // Prohibit named exports
      "import/no-named-export": "off", // we want everything to be a named export
      // Forbid a module from importing itself
      "import/no-self-import": "error",
      // Require modules with a single export to use a default export
      "import/prefer-default-export": "off", // we want everything to be named

      //
      // @typescript-eslint
      //

      "@typescript-eslint/no-var-requires": "off",
    },
  },
  {
    files: ["**/*.js"],
    extends: [tseslint.configs.disableTypeChecked],
    rules: {
      // turn off other type-aware rules
      "deprecation/deprecation": "off",
      "@typescript-eslint/internal/no-poorly-typed-ts-props": "off",

      // turn off rules that don't apply to JS code
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },
);
