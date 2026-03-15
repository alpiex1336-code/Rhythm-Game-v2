import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  root: ".",
  publicDir: "public",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: "index.html",
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/@spotify/basic-pitch/model/*",
          dest: "basic-pitch-model",
        },
      ],
    }),
  ],
});
