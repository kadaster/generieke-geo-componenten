import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@kadaster\/ggc-map$/,
        replacement: path.resolve(
          require.resolve("@kadaster/ggc-map/package.json"),
          "../src/public-api.ts"
        )
      },
      {
        // nodig voor Vitest UI
        find: /^@kadaster\/ggc-models$/,
        replacement: path.resolve(
          require.resolve("@kadaster/ggc-models/package.json"),
          "../src/public-api.ts"
        )
      },
      {
        find: /^@geoblocks\/print$/,
        replacement: path.resolve(
          "/Users/jordymackay/workspace/generieke-geo-componenten/src/test/vitest-stubs/geoblocks-print.ts"
        )
      }
    ]
  },
  test: {
    globals: true,
    environment: "jsdom",
    // De Angular CLI vitest-runner zet isolate standaard op false (Karma-gedrag),
    // waardoor alle spec-files dezelfde modulecontext delen. Dat laat gedeelde
    // singletons (bv. cameraUtils) en spies tussen tests/bestanden lekken.
    // Expliciet forceren naar true geeft elk spec-bestand een eigen context.
    isolate: true,
    setupFiles: ["src/test/setup-tests.ts"],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      exclude: ["src/test/**", "**/*.spec.ts"]
    }
  },
  ssr: { noExternal: [/^ol/, /^geotiff/] },
  optimizeDeps: {
    exclude: ["ol"]
  }
});
