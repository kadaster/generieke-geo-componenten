---
description: "Use when adding or changing GGC Home examples, including their generated structure, routes, and metadata."
applyTo: "projects/ggc-home/src/app/examples/**/*"
---

# GGC Home Examples

- Examples live under `projects/ggc-home/src/app/examples`. Before adding one, use `npm run plop:ggc-home-example` and follow the generated structure, routing, metadata, and nearby examples.
- The Plop generator intentionally retains the repository's `*.component.*` filenames. Keep those generated names consistent; do not rename the example files or change the generator as part of an individual example task.
- Keep examples aligned with the public APIs of the libraries they demonstrate. Do not modify generated documentation or unrelated example registrations.
- For map-layer initialization and visibility, follow [map-layers.instructions.md](map-layers.instructions.md), including configuring known layers up front instead of conditionally constructing them in event handlers.
- Before adding explanatory copy or list items, check nearby content for equivalent wording. Add an entry only when it describes distinct user-visible behavior; avoid duplicating an existing option with slightly different wording.
- Write explanatory text in Dutch at B1 level, with short sentences and simple words. Use neutral phrasing without addressing the reader as "je", "jij" or "u"; prefer a concrete subject over unnecessarily passive constructions. Preserve the established style, such as "Dit voorbeeld laat zien...", and add only what the changed behavior needs instead of rewriting the introduction around implementation details.
- To validate locally, consult `DEVELOPING.md` for building the required libraries before starting GGC Home with `ng serve -o`. Check `package.json` and `angular.json` for available lint/build targets.
