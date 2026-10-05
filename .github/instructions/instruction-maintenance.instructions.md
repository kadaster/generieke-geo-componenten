---
description: "Use when creating or updating AGENTS.md, Copilot instructions, or scoped instruction files and their metadata."
applyTo: "AGENTS.md,.github/copilot-instructions.md,.github/instructions/**/*.instructions.md"
---

# Instruction Maintenance

- When a developer corrects an unexpected result, update the relevant instruction in the same task unless the developer asks only to discuss it. Put reusable behavior that applies across task types in `AGENTS.md` and `.github/copilot-instructions.md`; use a file-scoped instruction only for guidance specific to its matched files or workflow.
- Keep instruction files concise. Do not put general agent behavior in a file-scoped instruction or duplicate scoped details in the global files.
- Before adding or changing a rule, inspect relevant existing instructions and overlapping scopes; avoid duplicate or conflicting guidance.
- After editing instructions, verify YAML frontmatter, confirm the `applyTo` pattern matches its intended files, and check formatting.
