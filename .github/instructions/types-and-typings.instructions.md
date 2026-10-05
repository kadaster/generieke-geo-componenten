---
description: "Use when changing GGC domain models, public types, ambient declarations, or suffixless TypeScript model files."
applyTo: "projects/**/src/**/*.model.ts,projects/**/src/lib/**/model/**/*.ts,projects/**/src/typings/**/*.d.ts,projects/**/src/**/*.d.ts"
---

# TypeScript Models and Typings

- Model the actual domain and external contract. Follow the workspace's strict TypeScript configuration, prefer precise types, and use `unknown` at untrusted boundaries instead of asserting a shape without validation.
- Follow Angular's kebab-case, identifier-based filenames for new TypeScript files. Existing GGC models commonly use `*.model.ts` and `src/lib/model/`; preserve those local patterns when extending existing features. This `applyTo` matches those established patterns, while its description enables discovery for new suffixless model filenames; do not broaden it to every TypeScript file.
- Public library types must be intentionally re-exported from the owning project's `src/public-api.ts`. Do not expose internal types merely because they are convenient to import.
- Files under `src/typings` are ambient declaration shims in this repository. Keep declarations minimal and scoped to the missing external module/type; do not use them to silence unrelated TypeScript errors or redefine real package types.
- Check consumers and related tests before changing a published interface, event, or declaration: library type changes are public API changes.
