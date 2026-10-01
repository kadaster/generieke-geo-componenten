---
description: "Use when editing GGC library package manifests, ng-packagr configuration, dependencies, or published assets."
applyTo: "projects/ggc-*/package.json,projects/ggc-*/ng-package.json"
---

# GGC Library Packaging

- Each publishable library is built with ng-packagr. Its `ng-package.json` defines the output directory and `src/public-api.ts` entry point; inspect a neighboring library before changing packaging options.
- Treat `src/public-api.ts` as the consumer contract. Export only intentional public APIs, and do not point package entry points at internal source files.
- Match dependency placement to the actual package contract. Angular and other host-provided libraries are commonly peer dependencies; `@kadaster/ggc-models` is commonly a package dependency. Some map/viewer peer dependencies are optional and coordinated with lazy integration code. Verify the owning library instead of copying another package's configuration blindly.
- Keep `peerDependenciesMeta`, `allowedNonPeerDependencies`, and any ng-packagr assets consistent with the corresponding dependency or build behavior. Ask before changing published dependency requirements, package versions, or release metadata.
- Package README and license assets are sourced from the library's `src` directory. Update their source files and use the documented README generator; do not edit generated package output under `dist`.
