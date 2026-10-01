---
description: "Use when changing shared Angular CLI/Vitest configuration, setup files, aliases, stubs, or spec TypeScript configuration."
applyTo: "angular.json,vitest.config.ts,src/test/**/*.ts,projects/*/tsconfig.spec.json"
---

# GGC Test Infrastructure

- The workspace runs Vitest through the Angular CLI with `jsdom`, global test APIs, and `src/test/setup-tests.ts`. Read the [Vitest configuration](../../vitest.config.ts) and setup before changing test infrastructure.
- Keep `isolate: true`: it prevents module-level state and spies from leaking between spec files. The shared setup restores spies after each test and tears down Angular TestBed after each test.
- Preserve the configured package aliases and stubs unless the owning test/build behavior is intentionally changing. They resolve selected GGC packages to public source entry points and provide a test stub for the optional print package.
- Keep runner settings aligned across `angular.json`, `vitest.config.ts`, and project `tsconfig.spec.json` files. Validate configuration changes with focused affected-project tests and the broader suite when appropriate.
- Before adding global providers, browser APIs, mocks, or new setup files, check whether the shared setup already supplies them and ensure new setup files are included in the relevant spec TypeScript configuration.
