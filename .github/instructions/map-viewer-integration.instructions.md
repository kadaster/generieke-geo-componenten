---
description: "Use when changing GGC connect services that integrate optional 2D map or 3D viewer libraries."
applyTo: "projects/ggc-dataset-tree/src/lib/**/*connect.service.ts,projects/ggc-feature-info/src/lib/**/*connect.service.ts,projects/ggc-legend/src/lib/**/*connect.service.ts,projects/ggc-search-location/src/lib/**/*connect.service.ts,projects/ggc-toolbar/src/lib/**/*connect.service.ts"
---

# GGC Map and Viewer Integration

- Several GGC libraries integrate with `ggc-map` (OpenLayers 2D) and optionally `ggc-map-3d` (Cesium) through dedicated connect services. Before changing an integration, inspect the owning package's `package.json`, `peerDependenciesMeta`, connect service, and nearby integration tests.
- Preserve optional integrations: do not add static imports or make an optional map/viewer package mandatory without an explicit dependency-contract decision. Follow the local lazy-import, injector lookup, caching, and unavailable-service behavior; these details vary by library.
- Reuse shared contracts from `@kadaster/ggc-models`, including `ViewerType`, event types, and map-index constants. Do not duplicate these values or conflate the distinct 2D and Cesium map indexes.
- Keep viewer-specific behavior explicit. Some operations are 2D-only, some support both viewers, and 3D services may not use `mapIndex`; verify the owning public API and tests before changing behavior.
- Keep the library boundary intact: communicate through supported public APIs and connect services rather than reaching into another package's internal source paths.
