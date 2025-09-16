import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts", 
    "src/workflow.ts", 
    "src/scheduling.ts", 
    "src/mrp.ts"
  ],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["@ash-ai/database", "@ash-ai/ai"],
});