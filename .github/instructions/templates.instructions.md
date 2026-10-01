---
description: "Use when editing Angular HTML templates, bindings, control flow, accessibility, or template security."
applyTo: "projects/**/src/**/*.html"
---

# Angular Templates

Use the official [Angular template guide](https://angular.dev/guide/templates) and [accessibility guidance](https://angular.dev/best-practices/a11y).

- Keep templates declarative and readable. Follow the nearest feature's control-flow and binding style; do not rewrite established templates just to adopt newer syntax.
- In new or substantially rewritten templates, prefer Angular's built-in `@if`, `@for`, and `@switch` blocks over structural `*ngIf`, `*ngFor`, and `ngSwitch`. Preserve existing syntax during unrelated edits. Every `@for` block must use a stable, unique `track` key; use `$index` only for static collections.
- Put complex or repeated behavior in the component, a computed value, a pipe, or a service as appropriate. Use event-handler names that describe the action, not only the DOM event.
- Prefer native HTML and Angular bindings. For new class/style bindings, prefer `[class]`/`[class.name]` and `[style]`/`[style.name]` over adding `NgClass` or `NgStyle`; retain existing directives when changing unrelated code.
- Use semantic, keyboard-operable controls with accessible names and associated labels. Supply meaningful image alternatives, avoid positive `tabindex` and autofocus, and use ARIA only when native semantics are insufficient.
- Respect [Angular's security model](https://angular.dev/best-practices/security): never add executable `<script>` content, build templates from data, or bypass sanitization for untrusted data. Avoid direct DOM APIs when a template binding can express the behavior.
