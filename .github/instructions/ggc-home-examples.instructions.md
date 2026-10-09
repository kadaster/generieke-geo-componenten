---
description: "Use when adding or changing GGC Home examples, including their generated structure, routes, and metadata."
applyTo: "projects/ggc-home/src/app/examples/**/*"
---

# GGC Home Examples

- Examples live under `projects/ggc-home/src/app/examples`. Before adding one, use `npm run plop:ggc-home-example` and follow the generated structure, routing, metadata, and nearby examples.
- The Plop generator intentionally retains the repository's `*.component.*` filenames. Keep those generated names consistent; do not rename the example files or change the generator as part of an individual example task.
- Keep examples aligned with the public APIs of the libraries they demonstrate. Do not modify generated documentation or unrelated example registrations.
- Before adding explanatory copy or list items, check nearby content for equivalent wording. Add an entry only when it describes distinct user-visible behavior; avoid duplicating an existing option with slightly different wording.
- To validate locally, consult `DEVELOPING.md` for building the required libraries before starting GGC Home with `ng serve -o`. Check `package.json` and `angular.json` for available lint/build targets.
