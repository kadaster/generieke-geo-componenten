---
description: "Use when adding or changing behavior of GGC map layers that differs per layer type, including the layer components, their abstract directives, and the layer service that orchestrates them."
applyTo: "projects/ggc-map/src/lib/layer/**/*.ts,projects/ggc-map/src/lib/service/select/ggc-layer.service.ts"
---

# GGC Map Layers

- Implement layer-type specific behavior in the layer component itself, behind one function that every layer type shares, instead of a `switch` on `Webservice2DType` in a service. `GgcLayerService` owns the layer configuration and orchestration and must not know the source options of a layer type.
- When not every layer type supports such a function, declare it on `AbstractBaseLayer` as a no-op placeholder, like the existing `enable()` / `disable()` placeholders, and override it in the layer types that do. Callers can then invoke it on any layer component without knowing its type.
- Let a layer component apply its own configuration to its OpenLayers source, both while it builds that source in `ngOnInit()` and on an already created source, so a change does not require removing and re-adding the layer.
- Cover layer-type specific behavior in the spec of the layer component; keep the service spec on configuration and orchestration.
