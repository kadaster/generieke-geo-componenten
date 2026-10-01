# GitHub Copilot Instructions

## Project context

- This is an Angular 22 / TypeScript 6 npm-workspaces monorepo: `projects/ggc-*` contains libraries and `projects/ggc-home` is the example/documentation application.
- Read the touched project's README and neighboring implementation. Follow any matching `.github/instructions/*.instructions.md` file; its `applyTo` glob scopes when it is included.

## Change policy

- Preserve existing worktree changes and touch only what the request requires. Do not modify generated output, dependencies, lockfiles, or release metadata unless required.
- Ask when requirements or trade-offs are unclear; do not invent project names, scripts, configuration options, or exports.
- Treat published GGC library APIs and consumer-visible behavior as compatibility contracts for third-party users. Before changing something that may break consumers (for example, renaming or removing an input/output, changing an event API, or changing a public type), inspect the impact and prefer a backwards-compatible path. If a breaking change may be necessary, explain the impact and get the developer’s explicit approval before implementing it; do not assume approval from the feature request alone.
- When addressing PR review comments, inspect the exact diff and surrounding behavior, then treat each comment as requested work unless the developer asks only for discussion. Verify the concern and implement the smallest appropriate correction; explain rather than blindly apply a suggestion that would change behavior or conflict with compatibility contracts. Validate each correction and report any concern that remains unresolved.

## Core principles

- Before introducing or changing a name or domain term, verify what the value or API represents and how it is used. Prefer established terminology from the API, domain model, documentation, and nearby code; avoid vague or overloaded terms. For example, if a map service stores validators in separate groups for drawing a feature, modifying its geometry, and moving it, `interactionType` describes the key that selects a group. `owner` could instead suggest that the key identifies which resource controls the validator's lifetime. If the meaning or canonical term remains unclear, surface the ambiguity and ask before encoding it in code or user-facing text.
- Don’t assume. Don’t hide confusion. Surface tradeoffs.
- Minimum code that solves the problem. Nothing speculative.
- Touch only what you must. Clean up only your own mess.
- Define success criteria. Loop until verified.
- When an API supports a generic type parameter, prefer specifying the type there (for example, `computed<SearchLocationOptions>(...)`) over asserting the result with `as SearchLocationOptions`. This lets TypeScript check that the value matches the type. Use an assertion only when no suitable generic or contextual type is available and it is genuinely necessary.
- When the developer corrects an unexpected result, identify the reusable cause and update these global instructions when the lesson applies across task types. Use a scoped instruction only when the correction is specific to files or workflows matched by its `applyTo`.

- Name variables holding instances or typed configuration values after their concrete class, type, or domain (for example, `myClass` for `new MyClass()` and `searchLocationOptions` for `SearchLocationOptions`), rather than an ambiguous generic name such as `options`. Preserve the distinction when multiple variants exist so the value's identity is clear at each use.

## Verification

- Define a check that demonstrates the requested change, run it, and report its result. Check `package.json` for the exact project scripts; for example, `npm run test:ggc-map`, `npm run lint:ggc-map`, and `npm run build:ggc-map`.
- Use `npm run test:all` or `npm run lint:all` only when the full suite is appropriate. Inspect `angular.json` for applicable GGC Home targets.
