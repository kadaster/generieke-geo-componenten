---
description: "Use when creating or changing Angular unit tests for components, directives, pipes, and services."
applyTo: "projects/**/src/**/*.spec.ts,src/**/*.spec.ts"
---

# Angular Test Instructions

- Angular recommends focused tests for behavior and supports component, directive, pipe, and service test patterns. See the [Angular testing guide](https://angular.dev/guide/testing); in this repository tests use Vitest through the Angular CLI.
- Keep tests colocated with implementation as `*.spec.ts`. Follow the nearby TestBed or direct-unit-test pattern and existing setup/stubs.
- Prefer assertions on observable behavior over private implementation details. Cover changed behavior, including relevant edge cases, without adding speculative tests.
- Always prefer a host component template binding such as `(changed)="capture($event)"` for output integration tests; Angular removes that listener with the fixture view. A focused unit test may subscribe directly to `OutputRef`, but keep the output owner fixture within the test's lifetime and ensure TestBed destroys it. Angular then cleans up that output subscription automatically. If the subscriber outlives the output owner or fixture, retain the `OutputRefSubscription` and call `unsubscribe()` during teardown.
- Check `package.json` for the exact project scripts. Run focused validation for the touched project, such as `npm run test:ggc-map`, and its lint/build scripts when relevant.
- Use `npm run test:all` only when a full-suite check is appropriate. GGC Home test targets are defined in `angular.json`; do not assume a script exists.
