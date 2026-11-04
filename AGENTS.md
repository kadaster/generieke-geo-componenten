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
- Before introducing or changing a name or domain term, verify what the value or API represents and how it is used. When a story or the codebase uses different terms for the same entity, identify one canonical term from the API, domain model, documentation, and nearby code, then use it consistently. Avoid vague or overloaded terms. For example, if a map service stores validators in separate groups for drawing a feature, modifying its geometry, and moving it, `interactionType` describes the key that selects a group. `owner` could instead suggest that the key identifies which resource controls the validator's lifetime. If the intended meaning or canonical term remains unclear, surface the ambiguity and ask the developer before encoding it in code or user-facing text.
- When addressing PR review comments, inspect the exact diff and surrounding behavior, then treat each comment as requested work unless the developer asks only for discussion. Verify the concern and implement the smallest appropriate correction; explain rather than blindly apply a suggestion that would change behavior or conflict with compatibility contracts. Validate each correction and report any concern that remains unresolved.
- Learn from developer discussions and corrections: identify the cause of the misunderstanding or the reusable improvement. If the intended improvement to the instructions is obvious, update them immediately in the same task and tell the developer what changed. Otherwise, explicitly ask the developer whether instructions should be updated to prevent the misunderstanding or capture the improvement next time, and wait for their answer before editing instructions. Do not turn a one-off task requirement into a permanent rule.
- Before editing instructions, read [instruction-maintenance.instructions.md](.github/instructions/instruction-maintenance.instructions.md).

## Copilot instructions

For GitHub Copilot, also follow [`.github/copilot-instructions.md`](.github/copilot-instructions.md), which repeats the shared rules for IDEs that do not read this file (JetBrains Copilot Chat reads only the Copilot files). Change the shared rules in both files together. Instructions in `.github/instructions/` apply only to files matched by their `applyTo` frontmatter.

- For Jira stories follow [implement-jira-story](.github/skills/implement-jira-story/SKILL.md): MCP with a pasted-context fallback, direct Agent mode for simple work, Plan mode for complex work.
