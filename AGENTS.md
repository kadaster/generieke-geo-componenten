# AGENTS.md

## Repository

This is an Angular monorepo with publishable `projects/ggc-*` libraries and the `projects/ggc-home` example/documentation application. Before changing a project, inspect its nearby code and applicable scoped instructions.

## Core principles

- Don’t assume. Don’t hide confusion. Surface tradeoffs.
- Minimum code that solves the problem. Nothing speculative.
- Touch only what you must. Clean up only your own mess.
- Define success criteria. Loop until verified.
- When an API supports a generic type parameter, prefer specifying the type there (for example, `computed<SearchLocationOptions>(...)`) over asserting the result with `as SearchLocationOptions`. This lets TypeScript check that the value matches the type. Use an assertion only when no suitable generic or contextual type is available and it is genuinely necessary.
- Name variables holding instances or typed configuration values after their concrete class, type, or domain (for example, `myClass` for `new MyClass()` and `searchLocationOptions` for `SearchLocationOptions`), rather than an ambiguous generic name such as `options`. Preserve the distinction when multiple variants exist so the value's identity is clear at each use.
- Treat published GGC library APIs and consumer-visible behavior as compatibility contracts for third-party users. Before changing something that may break consumers (for example, renaming or removing an input/output, changing an event API, or changing a public type), inspect the impact and prefer a backwards-compatible path. If a breaking change may be necessary, explain the impact and get the developer’s explicit approval before implementing it; do not assume approval from the feature request alone.
- When a story or the codebase uses different terms for the same entity, identify one canonical term from the existing API, domain model, and documentation, then use it consistently. If the intended term remains unclear, ask the developer before changing code or user-facing text.
- When addressing PR review comments, inspect the exact diff and surrounding behavior, then treat each comment as requested work unless the developer asks only for discussion. Verify the concern and implement the smallest appropriate correction; explain rather than blindly apply a suggestion that would change behavior or conflict with compatibility contracts. Validate each correction and report any concern that remains unresolved.
- When a developer corrects an unexpected result, identify the reusable cause and update the global instructions (`AGENTS.md` and `.github/copilot-instructions.md`) if the lesson applies across task types. Use a scoped instruction only when the correction is specific to files or workflows matched by its `applyTo`. Keep one-off requirements local to the task; ask if the scope is unclear.

## Copilot instructions

For GitHub Copilot, also follow [`.github/copilot-instructions.md`](.github/copilot-instructions.md). Instructions in `.github/instructions/` apply only to files matched by their `applyTo` frontmatter.
