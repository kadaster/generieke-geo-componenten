---
description: "Use when creating or changing Angular services, including @Service/@Injectable choice, dependency injection, provider scope, or service-owned resources."
applyTo: "projects/**/src/**/*.service.ts"
---

# Angular Services

Follow Angular's [style guide](https://angular.dev/style-guide#prefer-the-inject-function-over-constructor-parameter-injection) and [service/DI guidance](https://angular.dev/guide/di/creating-and-using-services).

- Use services for reusable data access, business logic, or state that should not be owned by a view. Keep UI-specific behavior in the component.
- The Angular CLI 22 service generator creates `*.service.ts` files and uses `@Service()` by default. Prefer `@Service()` for a new root-provided singleton that uses `inject()`. Use `@Injectable()` when constructor injection, non-root scope, or advanced provider configuration is needed.
- Prefer `inject()` for new dependency declarations. Preserve constructor injection and the established decorator in an existing service unless the task includes a refactor.
- Choose provider lifetime intentionally. Do not make configured or per-map state a global singleton; use the existing library/component scope where appropriate.
- Keep one cohesive service per file and place it by feature responsibility, following nearby directory and filename conventions. Prefer a pure function over a service when no Angular DI or shared state is needed.
- Make external subscriptions, map/event listeners, and other owned resources' lifetimes explicit; release them at the owning scope's destruction.
- Use only APIs available in the Angular version pinned by this workspace. Do not introduce newer APIs solely because they appear in the latest online guide.
