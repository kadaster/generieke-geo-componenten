import { build } from "esbuild";

await build({
  entryPoints: ["dist/ggc-search-location-element/browser/main.js"],
  bundle: true,
  minify: true,
  format: "iife",
  outfile: "dist/ggc-search-location-element/ggc-search-location.js"
});

console.log("Single bundle generated");
