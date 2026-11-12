---
description: "Use when configuring GGC map layers, initialization and visibility, or changing layer-type specific behavior in layer components, abstract directives and the layer service."
applyTo: "projects/ggc-map/src/lib/layer/**/*.ts,projects/ggc-map/src/lib/service/select/ggc-layer.service.ts"
---

# GGC Map Layers

- When the layers are known in advance, declare them in the initial map configuration with `visible: false` until needed. Update their configuration and use the existing visibility APIs when activating them; do not conditionally construct known layers in selection handlers. Reserve dynamic layer creation for layers that are genuinely determined at runtime.
- Implement layer-type specific behavior in the layer component itself, behind one function that every layer type shares, instead of a `switch` on `Webservice2DType` in a service. `GgcLayerService` owns the layer configuration and orchestration and must not know the source options of a layer type.
- When not every layer type supports such a function, declare it on `AbstractBaseLayer` as a no-op placeholder, like the existing `enable()` / `disable()` placeholders, and override it in the layer types that do. Callers can then invoke it on any layer component without knowing its type.
- Let a layer component apply its own configuration to its OpenLayers source, both while it builds that source in `ngOnInit()` and on an already created source, so a change does not require removing and re-adding the layer.
- Cover layer-type specific behavior in the spec of the layer component; keep the service spec on configuration and orchestration.
