import type { StorybookConfig } from "@storybook/sveltekit";
import turbosnap from "vite-plugin-turbosnap";
import { mergeConfig } from "vite";
import { join, dirname } from "path";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-interactions"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/sveltekit"),
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  // Copied from https://github.com/IanVS/vite-plugin-turbosnap docs
  async viteFinal(config, { configType }) {
    return mergeConfig(config, {
      plugins:
        configType === "PRODUCTION"
          ? [
              turbosnap({
                // This should be the base path of your storybook. In monorepos,
                // you may only need process.cwd().
                rootDir: config.root ?? process.cwd(),
              }),
            ]
          : [],
    });
  },
};
export default config;
