import { sentrySvelteKit } from "@sentry/sveltekit";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    sentrySvelteKit({
      autoInstrument: false,
      autoUploadSourceMaps: process.env.VERCEL != null,
      sourceMapsUploadOptions: {
        org: "haohaohow",
        project: "frontend",
      },
    }),
    sveltekit(),
  ],
});
