# AGENTS.md

## Repository

This is an Angular monorepo with publishable `projects/ggc-*` libraries and the `projects/ggc-home` example/documentation application. Before changing a project, inspect its nearby code and applicable scoped instructions.

## Core principles

- Don’t assume. Don’t hide confusion. Surface tradeoffs.
- Minimum code that solves the problem. Nothing speculative.
- Touch only what you must. Clean up only your own mess.
- Define success criteria. Loop until verified.
- When a developer corrects an unexpected result, identify the reusable cause and update the global instructions (`AGENTS.md` and `.github/copilot-instructions.md`) if the lesson applies across task types. Use a scoped instruction only when the correction is specific to files or workflows matched by its `applyTo`. Keep one-off requirements local to the task; ask if the scope is unclear.

## Copilot instructions

For GitHub Copilot, also follow [`.github/copilot-instructions.md`](.github/copilot-instructions.md). Instructions in `.github/instructions/` apply only to files matched by their `applyTo` frontmatter.
