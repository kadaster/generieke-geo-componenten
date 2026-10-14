---
description: "Use when creating or changing GGC forms, form controls, validation or GGC Home form examples. Covers new Signal Forms, existing typed Reactive Forms and published control compatibility."
---
# Forms

- New independent forms use **Signal Forms** (`form()`, schema validators and `FormField` / `[formField]` from `@angular/forms/signals`, stable in Angular 22). Verify APIs against the installed version, not the latest guide alone.
- Existing forms and extensions stay **typed Reactive Forms**. A new field/child in an existing FormGroup is an extension, not an independent form. Do not migrate existing forms or introduce template-driven forms incidentally.
- Library controls are consumer contracts: preserve existing ControlValueAccessor, inputs/outputs, reset/disabled/validation semantics and published types. New internal form strategy is not permission to change a control's public API.
- Before using existing/third-party controls in a Signal Form, verify installed compatibility. Explain and ask before introducing a bridge, replacement or migration; never silently mix ownership models or force consumers to migrate.
- Validation messages follow the owning UI's established language/translation contract; Kadaster application/GGC Home UI text remains consistent with neighboring examples. Do not hard-code a new language into a reusable library API.
- Follow [accessibility.instructions.md](accessibility.instructions.md) for labels, error announcements and keyboard interaction. Test changed validation, touched/dirty state, reset, disabled controls, submission/server errors and consumer integration where affected.
- Cleanup Reactive Forms `valueChanges` subscriptions with `takeUntilDestroyed()`; follow the touched library's test/build scripts and public API compatibility gates.