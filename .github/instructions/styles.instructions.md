---
description: "Use when editing CSS or SCSS for GGC Angular components, including encapsulation, public style hooks, and accessibility."
applyTo: "projects/**/src/**/*.css,projects/**/src/**/*.scss"
---

# Angular Component Styles

Follow Angular's [component styling guide](https://angular.dev/guide/components/styling) and the feature's existing SCSS conventions.

- GGC is a long-lived component library consumed by other applications. Keep library components focused on behavior and add only the visual styling needed for usable structure, state, and accessibility; avoid baking brand colors, typography, or decorative choices into components.
- Keep consumer customization possible through stable, intentional styling hooks such as documented host classes or CSS custom properties. Do not make private DOM structure or `::ng-deep` selectors a required theming API.
- GGC Home is a usage example and reference for generic GGC styling, including its global design tokens in `projects/ggc-home/src/styles.scss`; it is not a requirement that consuming applications adopt that theme. Keep component-specific styles local, while shared demo/theme tokens may remain global.
- Keep generic styling, the planned Kadaster base style, and application/department additions as separable layers. Consumers must be able to add their own styling over the base without changing component behavior.
- Keep component styles with their feature and use Angular's component style scoping unless global styling is intentionally required. Use the stylesheet extension configured for the project; Angular CLI defaults to CSS while GGC Home is configured for SCSS.
- Preserve public CSS classes, host behavior, and consumer styling hooks. Avoid unrelated selector or encapsulation changes.
- Do not introduce `::ng-deep` in new styles; Angular strongly discourages it. Preserve existing uses unless the task addresses that styling boundary.
- Do not move component-specific styles into global stylesheets or add a styling dependency for a local component change.
- Check keyboard focus visibility, contrast, and responsive behavior when changing user-facing styles; follow `CONTRIBUTING.md` accessibility requirements.
