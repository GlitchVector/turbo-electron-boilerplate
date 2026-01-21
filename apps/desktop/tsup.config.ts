import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    main: "src/main.ts",
    preload: "src/preload.ts",
  },
  format: ["cjs"],
  outDir: "dist",
  clean: true,
  sourcemap: true,
  target: "node20",
  platform: "node",
  external: ["electron", "@repo/shared"],
});
