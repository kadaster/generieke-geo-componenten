---
description: "Use when creating or changing Angular directives or pipes, including their selectors, transformations, and tests."
applyTo: "projects/**/src/**/*.directive.ts,projects/**/src/**/*.pipe.ts"
---

# Angular Directives and Pipes

Use the Angular [directive guide](https://angular.dev/guide/directives), [pipe guide](https://angular.dev/guide/templates/pipes), and [style guide](https://angular.dev/style-guide) alongside local conventions.

- Directives should add reusable behavior to host elements; keep presentation-specific behavior in components and avoid a directive when a native template binding is sufficient.
- GGC attribute directive selectors use the `ggc` prefix and camelCase; this is enforced by ESLint. Preserve existing selector names because they are part of consumer templates.
- Angular 22 directives and pipes are standalone by default. Add them to the consuming standalone component's `imports`; use `standalone: false` only for an intentional NgModule declaration.
- Prefer the `host` metadata property over `@HostBinding` and `@HostListener` in new directives. Preserve existing host APIs during unrelated changes.
- Always prefer Angular-managed template output bindings over imperative subscriptions to directive outputs when the relationship can be expressed in the template. Use a programmatic subscription only for a genuine imperative bridge, and clean it up with the subscriber's lifetime (`takeUntilDestroyed()`, effect cleanup, or explicit `unsubscribe()`); the output owner's destruction only covers the output's lifetime.
- Angular CLI 22 retains `.directive.ts` and `.pipe.ts` file suffixes. Keep selector names, pipe names, and exports compatible with existing templates and public APIs.
- Keep pipes focused on one deterministic transformation. Implement `PipeTransform`, retain the pure default, and avoid impure pipes unless there is a demonstrated need. If transformation logic is reused outside templates, extract it into a standalone function instead of injecting a pipe.
- Prefer one directive or pipe concept per file, use the repository's neighboring filename and export patterns, and add focused tests for behavior changes.
