---
description: "Use when editing repository or package README documentation and public TypeScript API documentation."
applyTo: "README.md,projects/**/src/README*.md"
---

# Documentation Instructions

- Keep package documentation in the appropriate source README, including `README.project.md` for project-specific additions. The generated `README.md` files are assembled by `npm run generate-readme-files`; do not edit generated output directly.
- For TypeScript API documentation, follow the existing TypeDoc/JSDoc style and ensure public library APIs are exported through that library's `src/public-api.ts`.
- Keep documentation consistent with actual package behavior and configuration. Verify commands against `package.json` and `DEVELOPING.md` rather than guessing.
