---
description: "Use when writing or changing TypeScript in GGC projects: typing strictness, naming, formatting, and comments."
applyTo: "projects/**/src/**/*.ts"
---

# TypeScript Style

- Avoid `any` in new code even though ESLint allows it; use precise types, `unknown` with narrowing, or types from the owning library and `@kadaster/ggc-models`.
- Avoid non-null assertions (`!`) in new code; prefer `input.required()`, control-flow narrowing, or explicit checks.
- Use string-literal union types for finite sets of values; use `interface` for data shapes and a `class` only when a constructor or behavior is needed.
- Follow Prettier (`.prettierrc.json`, no trailing commas) and the local ESLint rules; run the project's lint script on touched files.
- Write comments only for what the code cannot express, in English, one short line.
