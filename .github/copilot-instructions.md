# GitHub Copilot Instructions

## Project context

- This is an Angular 22 / TypeScript 6 npm-workspaces monorepo: `projects/ggc-*` contains libraries and `projects/ggc-home` is the example/documentation application.
- Read the touched project's README and neighboring implementation. Follow any matching `.github/instructions/*.instructions.md` file; its `applyTo` glob scopes when it is included.

## Change policy

- Preserve existing worktree changes and touch only what the request requires. Do not modify generated output, dependencies, lockfiles, or release metadata unless required.
- Ask when requirements or trade-offs are unclear; do not invent project names, scripts, configuration options, or exports.

## Core principles

- Don’t assume. Don’t hide confusion. Surface tradeoffs.
- Minimum code that solves the problem. Nothing speculative.
- Touch only what you must. Clean up only your own mess.
- Define success criteria. Loop until verified.
- When the developer corrects an unexpected result, identify the reusable cause and update these global instructions when the lesson applies across task types. Use a scoped instruction only when the correction is specific to files or workflows matched by its `applyTo`.

## Verification

- Define a check that demonstrates the requested change, run it, and report its result. Check `package.json` for the exact project scripts; for example, `npm run test:ggc-map`, `npm run lint:ggc-map`, and `npm run build:ggc-map`.
- Use `npm run test:all` or `npm run lint:all` only when the full suite is appropriate. Inspect `angular.json` for applicable GGC Home targets.
