import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: [
      {
        // nodig voor Vitest UI
        find: /^@kadaster\/ggc-models$/,
        replacement: path.resolve(
          require.resolve("@kadaster/ggc-models/package.json"),
          "../src/public-api.ts"
        )
      }
    ]
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/test/setup-tests.ts"],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      exclude: ["src/test/**", "**/*.spec.ts"],
    }
  },
  ssr: { noExternal: [/^ol/, /^geotiff/] },
  optimizeDeps: {
    exclude: ["ol"],
  }
});
