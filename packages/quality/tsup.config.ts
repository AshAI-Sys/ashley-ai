import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/inspection.ts",
    "src/capa.ts",
    "src/metrics.ts",
    "src/ai-quality.ts",
  ],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    "@ash-ai/database",
    "@ash-ai/ai",
    "sharp",
    "@tensorflow/tfjs",
    "@tensorflow/tfjs-node",
  ],
});
