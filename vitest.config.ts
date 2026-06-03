import { defineConfig } from "vitest/config";
import path from "node:path";
import { resolve } from "path";

const resolveOLMock = (p: string) =>
  path.resolve(__dirname, `src/test/mocks/open-layers/${p}`);

console.log("Vitest configuration started");
export default defineConfig({
  resolve: {
    alias: [
      { find: /^ol\/Map$/, replacement: resolveOLMock("Map.ts") },
      { find: /^ol\/Feature$/, replacement: resolveOLMock("Feature.ts") },
      {
        find: /^ol\/style\/Text$/,
        replacement: resolveOLMock("style/Text.ts")
      },
      {
        find: /^ol\/style\/Fill$/,
        replacement: resolveOLMock("style/Fill.ts")
      },
      {
        find: /^ol\/style\/Stroke$/,
        replacement: resolveOLMock("style/Stroke.ts")
      },
      {
        find: /^ol\/style\/Circle$/,
        replacement: resolveOLMock("style/Circle.ts")
      },
      {
        find: /^ol\/style\/RegularShape$/,
        replacement: resolveOLMock("style/RegularShape.ts")
      },
      {
        find: /^ol\/style\/Icon$/,
        replacement: resolveOLMock("style/Icon.ts")
      },
      { find: /^ol\/style\/.+$/, replacement: resolveOLMock("style/Style.ts") },
      {
        find: /^ol\/geom\/.+$/,
        replacement: resolveOLMock("geom/Geometry.ts")
      },
      {
        find: "@kadaster/ggc-cesium",
        replacement: path.resolve(__dirname, "src/test/mocks/cesium/Cesium.ts")
      },
      {
        find: "@kadaster/ggc-map",
        replacement: path.resolve(__dirname, "dist/ggc-map")
      },
      {
        find: "@kadaster/ggc-dataset-tree",
        replacement: path.resolve(__dirname, "dist/ggc-dataset-tree")
      },
      {
        find: "@kadaster/ggc-feature-info",
        replacement: path.resolve(__dirname, "dist/ggc-feature-info")
      },
      {
        find: "@kadaster/ggc-legend",
        replacement: path.resolve(__dirname, "dist/ggc-legend")
      },
      {
        find: "@kadaster/ggc-map",
        replacement: path.resolve(__dirname, "dist/ggc-map")
      },
      {
        find: "@kadaster/ggc-models",
        replacement: path.resolve(__dirname, "dist/ggc-map")
      },
      {
        find: "@kadaster/ggc-search-location",
        replacement: path.resolve(__dirname, "dist/ggc-search-location")
      },
      {
        find: "@kadaster/ggc-toolbar",
        replacement: path.resolve(__dirname, "dist/ggc-toolbar")
      }
    ]
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/test.ts", "src/test/setup-tests.ts"],
    server: {
      // deps: {
      //   inline: [/^ol/, /^@kadaster\/generieke-geo-componenten-/]
      // }
    },
    coverage: {
      provider: "istanbul",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      exclude: ["src/test/**", "**/*.spec.ts"]
    }
  },
  ssr: { noExternal: true },
  optimizeDeps: {
    exclude: ["ol"]
  }
});
