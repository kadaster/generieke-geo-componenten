---
description: "Use when creating or changing Angular components, including CLI-style suffixless files, GGC legacy component-suffixed files, APIs, selectors, and views."
applyTo: "projects/**/src/**/*.component.ts,projects/**/src/**/*.component.html,projects/**/src/**/*.component.scss,projects/ggc-home/src/app/app.ts"
---

# Angular Components

Follow the [Angular style guide](https://angular.dev/style-guide) and [component guide](https://angular.dev/guide/components). The style guide explicitly prioritizes consistency when its recommendation conflicts with an established file or project pattern.

- Keep each component focused on its UI responsibility. Move reusable business logic or data work into a service or a domain utility when that reduces component complexity.
- Use kebab-case filenames based on the component class, with the same basename for its TypeScript, template, stylesheet, and `*.spec.ts`. Angular CLI 22 generates `feature.ts`, `feature.html`, and the project's configured stylesheet (CSS by default); the class name retains the `Component` suffix. For new components, follow this suffixless Angular convention unless a project generator or established local boundary dictates otherwise. Existing GGC libraries use `*.component.*`, and the GGC Home Plop generator deliberately creates that form: preserve those files and use the generator for examples. This instruction's `applyTo` matches the legacy names; its description is used to discover suffixless component files. Do not broaden `applyTo` to every TypeScript file.
- GGC component selectors must use the `ggc` prefix, kebab-case, and an element selector; ESLint enforces this rule. Preserve existing selectors and public inputs/outputs.
- Angular 22 components are standalone by default. For new components, declare template dependencies in the component `imports`; set `standalone: false` only when an NgModule declaration is intentional. Do not add redundant `standalone: true` or migrate an existing NgModule boundary without a requirement.
- For a single external stylesheet, use the current `styleUrl` metadata property and the stylesheet extension configured for the project. Keep `styleUrls` when maintaining an existing component or when multiple stylesheets are intentional.
- For new components, prefer signal `input()`, `output()`, and query functions such as `viewChild()`/`contentChild()`. Use `model()` only for genuine two-way binding. Name inputs without a selector prefix and outputs in camelCase without an `on` prefix. Do not migrate existing decorator APIs or public names without an explicit requirement; verify APIs against the workspace's pinned Angular version.
- Prefer the Angular CLI's default `OnPush` change detection for new components. Keep existing change-detection behavior unless the task requires changing it.
- Keep template-only members `protected`; mark Angular-managed inputs, outputs, and queries `readonly` where supported. Group Angular metadata, injected dependencies, inputs/outputs, and queries before methods, in line with local lint rules.
- Keep lifecycle hooks small, implement the corresponding Angular lifecycle interface, and name event handlers for the action they perform.
- Before choosing a reactivity API or replacing input handling, trace each value's sources, writers, and side effects. Do not assume signals should replace lifecycle hooks, or that internal/async writes rule out `linkedSignal()`.
- Choose by semantics: `computed()` for pure derived state; `linkedSignal()` for writable state derived from a source, including state with internal/async writers when resetting it on source changes matches the intended behavior; `effect()` mainly for synchronizing with imperative/non-reactive APIs; and `ngOnChanges` for explicit per-input orchestration of actions or events. These APIs can coexist in one component.
- Check initial values, later input changes, internal/async writes, and meaningful `undefined` versus `null` behavior. Preserve existing behavior unless an intentional change is required, and test both local writes and source-driven resets when using `linkedSignal()`.
- Prefer the `host` metadata property over `@HostBinding` and `@HostListener` in new code. Preserve existing host APIs during unrelated changes.
- Meet the accessibility requirements in `CONTRIBUTING.md`: semantic elements, keyboard operation, accessible names, associated labels, and appropriate ARIA.
