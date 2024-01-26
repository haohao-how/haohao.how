import adapter from "@sveltejs/adapter-auto";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default /** @satisfies {import('@sveltejs/kit').Config} */ ({
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter(),

    typescript: {
      config(x) {
        x.include.push(
          "../*.cjs",
          "../*.js",
          "../*.cts",
          "../*.ts",
          "../.*.cjs",
          "../.*.js",
          "../.*.cts",
          "../.*.ts",
        );
        return x;
      },
    },
  },
});

/** @type {number} */
const x = "";
x;
