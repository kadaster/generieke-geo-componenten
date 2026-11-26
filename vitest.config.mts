import { defineConfig } from "vitest/config";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const nodeRequire = createRequire(import.meta.url);
const configDirectory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@kadaster\/ggc-map$/,
        replacement: path.resolve(
          nodeRequire.resolve("@kadaster/ggc-map/package.json"),
          "../src/public-api.ts"
        )
      },
      {
        // nodig voor Vitest UI
        find: /^@kadaster\/ggc-models$/,
        replacement: path.resolve(
          nodeRequire.resolve("@kadaster/ggc-models/package.json"),
          "../src/public-api.ts"
        )
      },
      {
        find: /^@geoblocks\/print$/,
        replacement: path.resolve(
          configDirectory,
          "src/test/vitest-stubs/geoblocks-print.ts"
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
      exclude: ["src/test/**", "**/*.spec.ts"]
    }
  },
  ssr: { noExternal: [/^ol/, /^geotiff/] },
  optimizeDeps: {
    exclude: ["ol"]
  }
});
