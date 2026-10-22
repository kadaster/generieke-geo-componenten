---
description: "Use when creating or updating AGENTS.md, Copilot instructions, scoped instruction files, skills or their metadata."
applyTo: "AGENTS.md,.github/copilot-instructions.md,.github/instructions/**/*.instructions.md,.github/skills/**/SKILL.md"
---

# Instruction Maintenance

- Capture the general cause and desired behavior, not conversation history or a one-off requirement. Tell the developer which instruction changed and why.
- Put cross-task lessons in both `AGENTS.md` and `.github/copilot-instructions.md` and keep their shared rules synchronized; put area-specific lessons in the relevant scoped instruction or skill.
- When renaming instructions or skills, update their index, links and applicable frontmatter together.
- Keep instruction files concise. Do not put general agent behavior in a file-scoped instruction or duplicate scoped details in the global files.
- Make examples self-contained: include enough context to understand the concept and why it illustrates the rule without relying on the conversation or code diff that prompted it.
- Before adding or changing a rule, inspect relevant existing instructions and overlapping scopes; avoid duplicate or conflicting guidance.
- After editing instructions, verify YAML frontmatter, check any `applyTo` patterns against intended files, confirm on-demand descriptions are discoverable, and check links and formatting.
