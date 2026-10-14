---
description: "Use when changing GGC UI controls, templates, styles, map interactions or GGC Home examples. Covers WCAG 2.1 A/AA application baseline and WCAG 2.2 AA new-work target."
applyTo: "projects/**/src/**/*.html,projects/**/src/**/*.scss,projects/**/src/**/*.css,projects/**/src/**/*.component.ts,projects/ggc-home/src/app/app.ts"
---
# Accessibility

- **WCAG 2.1 A/AA is the current legal baseline** for Kadaster applications under EN 301 549 / Besluit digitale toegankelijkheid overheid. GGC controls must support accessible consumers. Apply relevant **WCAG 2.2 AA additions to new work** as a development target, not a current legal claim. Checked 2026-10-14: [current obligation](https://www.digitoegankelijk.nl/wetgeving/wat-is-verplicht), [harmonization pending](https://www.digitoegankelijk.nl/nieuws/nieuwe-versie-EN301549-met-update-wcag). Recheck official sources when changing policy.
- Use semantic elements, associated visible labels, accessible names and keyboard-operable controls. Preserve focus visibility/order and return focus after dialogs. No positive tabindex or color-only information.
- Keep ARIA synchronized with state, link errors with `aria-describedby` / `aria-invalid`, and announce dynamic results/status/errors. Decorative images/icons are hidden appropriately; informative images need meaningful alternatives.
- Support contrast, 200% text zoom, 400% zoom/reflow at 320 CSS px and text spacing in controls/examples. New work also considers unobscured focus, target size, dragging alternatives, redundant entry and accessible authentication where relevant.
- Do not assume a blanket map exemption; discuss accessible alternatives for essential map information/interactions. Preserve consuming apps' ability to supply labels and translated messages rather than hard-coding app-specific behavior.
- Test changed semantics and keyboard/focus behavior in the existing unit/consumer test setup. Use GGC Home for relevant integration/manual checks; do not introduce a new e2e framework incidentally. Automated tests are not proof of conformance; report manual checks and gaps.
- Preserve public control contracts and get explicit approval for necessary breaking changes. Do not alter accessibility declarations through a code story.