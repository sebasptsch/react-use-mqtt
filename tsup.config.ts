import { defineConfig } from "tsup";

export default defineConfig({
  entryPoints: ["src/index.ts"],
  format: ["esm", "cjs"],
  splitting: true,
  dts: true,
  bundle: true,
  clean: true,
  sourcemap: true,
  minify: true,
  target: "es2019",
  external: ["react", "react-dom"],
});