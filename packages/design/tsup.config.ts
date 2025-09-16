import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts", 
    "src/workflow.ts",
    "src/collaboration.ts", 
    "src/validation.ts",
    "src/mockup.ts",
    "src/estimation.ts"
  ],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["@ash-ai/database", "@ash-ai/ai", "sharp", "canvas", "fabric"],
});