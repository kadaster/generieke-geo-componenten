# Angular 22 Component Modernization

This audit records the component scope for TMS-11563. The 102 Angular components were inventoried from their `@Component` declarations and checked for decorator-based component inputs, outputs, queries, host bindings/listeners, `model()` usage, Angular 22's default change-detection strategy, and component-owned resources. The remaining public template directives were checked separately because consumers can import them from package public APIs.

## Decisions

- Migrated remaining component `EventEmitter` outputs to typed `output()` declarations. Output names, payload types, emission sites, and template bindings are unchanged.
- Migrated remaining component view/content queries to signal query functions. Projected templates remain optional; required map-control elements use required queries and initialize in `AfterViewInit`.
- Replaced the search component's document `HostListener` with host metadata and made its conditional input query safe when search UI is hidden.
- Replaced the 3D viewer's `HostBinding` with host metadata and dispose viewer subscriptions, camera event callbacks, the WebGL listener, and the owned Cesium viewer at destruction. Tied `GgcControlsComponent`'s root viewer-service subscription to the control component's lifetime.
- Scoped legend and toolbar subscriptions to their component lifetimes. Search and the Home example formatter likewise clean up their component-owned subscriptions.
- Relied on Angular 22's default `OnPush` change detection; no redundant `changeDetection` metadata is set. Template-facing state updated asynchronously is signal-backed.
- The two GGC Home `model()` values were not used with two-way bindings. They are local demo state and are now ordinary signals.
- The three remaining decorator-input directives are public exports and were migrated: `DatasetLabelTemplateDirective`, `LayerLabelTemplateDirective`, and `ValueTemplateDirective`. Their selectors and input names are unchanged. The dataset-tree directives remain marker inputs; `ValueTemplateDirective` keeps optional string/string-array keys and its `CONTENT` default.
- Other components were reviewed and need no component declaration change: no remaining decorator-based component API, no `model()` candidate, and no component behavior requiring a speculative rewrite. Existing selectors, defaults, and consumers are retained.

## Component Inventory

The per-project lists below include every component found in the source inventory. Components not listed under “Changed” were reviewed and need no change for this migration; they either already use the signal-first component APIs or have no component input/output/query/host declaration to modernize.

### ggc-dataset-tree (5)

Changed: `GgcDatasetSwitcherComponent`, `GgcDatasetTreeComponent`, `DatasetLabelTemplateDirective`, `LayerLabelTemplateDirective`.

No further change: `LayerSelectorComponent`, `LayerToggleComponent`, `ThemeSelectorComponent`.

### ggc-feature-info (3)

Changed: `GgcFeatureInfoComponent`, `GgcFeatureInfoTabsComponent`, `ValueTemplateDirective`.

No further change: `FeatureInfoDisplayComponent`.

### ggc-legend (6)

Changed: `GgcLegendComponent`.

No further change: `LegendEmptyComponent`, `GgcLegendIconComponent`, `LegendMapboxComponent`, `MapboxLegendItemComponent`, `GgcLegendUrlComponent`.

### ggc-map (13)

Changed: `GgcMapComponent`, `GgcMousePositionComponent`, `GgcScaleLineComponent`, and the inherited output in `AbstractConfigurableLayer`. The inherited output API applies to `GgcGeojsonLayerComponent`, `GgcImageLayerComponent`, `GgcVectorTileLayerComponent`, `GgcWmsLayerComponent`, and `GgcWmtsLayerComponent`.

No further component change: `GgcLayerBrtAchtergrondkaartComponent`, `GgcLoaderComponent`, `GgcMapDetailsContainerComponent`, `GgcScaleDenominatorComponent`, `GgcZoomLevelComponent`.

### ggc-map-3d (2)

Changed: `GgcViewerComponent`, `GgcControlsComponent`.

### ggc-print (2)

Changed: `GgcPrintFormComponent`.

No further change: `DownloadDialogComponent`.

### ggc-search-location (1)

Changed: `GgcSearchLocationComponent`.

### ggc-toolbar (4)

Changed: `GgcToolbarComponent`, `GgcToolbarItemComponent`, `GgcToolbarItemDrawComponent`, `GgcToolbarItemMeasureComponent`.

The toolbar-item `activeChanged`, draw `drawItemClicked`, and measure `measureItemClicked` outputs use typed `output()` APIs. Toolbar-item view queries and the toolbar projected-child query use signal queries. The container cleans up its service and child-output subscriptions. The existing public `toolbarItemTemplate` and `toolbarItem` reads remain available through getters.

### ggc-conversion

No Angular components are declared in this library.

### ggc-home (66)

Changed: `ExampleFormatComponent`, `ExampleDrawStyle`, `ExampleMeasureOwnStyleLabel`.

No further component change: `App`, `DownloadsNpmComponent`, `Example3dBasicComponent`, `Example3dDatasetSwitcherComponent`, `Example3dDatasetTreeLegendComponent`, `Example3dFeatureInfoComponent`, `Example3dFeatureInfoAutoConnectComponent`, `Example3dLayer3dTilesComponent`, `Example3dLayerCameraOptionsComponent`, `Example3dLayerGeojsonComponent`, `Example3dLayerWmtsComponent`, `Example3dSearchComponent`, `ExampleConversionComponent`, `ExampleDatasetSwitcherBasicComponent`, `ExampleDatasetSwitcherRadioButtonsComponent`, `ExampleDatasetTreeAdvComponent`, `ExampleDatasetTreeBasicComponent`, `ExampleDatasetTreeBasicListComponent`, `ExampleDatasetTreeLayerEnabledCallback`, `ExampleDatasetTreeTemplatesComponent`, `ExampleDrawAdvComponent`, `ExampleDrawBasicComponent`, `ExampleDrawCenterDrawComponent`, `ExampleDrawCenterEditBasicComponent`, `ExampleDrawEditBasicComponent`, `ExampleDrawTracingComponent`, `ExampleIndexComponent`, `ExampleDynamicLayerOgcBasicComponent`, `ExampleLayerGeojsonComponent`, `ExampleLayerGeojsonOgcComponent`, `ExampleLayerGeojsonWfsComponent`, `ExampleLayerHtmlConfig`, `ExampleLayerImageComponent`, `ExampleLayerJsonConfig`, `ExampleLayerVectorTileComponent`, `ExampleLayerWmsComponent`, `ExampleLayerWmtsComponent`, `ExampleLegendAdvComponent`, `ExampleLegendDatasetTreeComponent`, `ExampleLegendZoomComponent`, `ExampleFeatureInfoAdvComponent`, `ExampleFeatureInfoBasicComponent`, `ExampleFeatureInfoCustomNamesValuesComponent`, `ExampleFeatureInfoTabsComponent`, `ExampleFeatureInfoTemplateComponent`, `ExampleMapSelectComponent`, `ExampleMapSelectDatasetTreeComponent`, `ExampleMapSelectHoverClickComponent`, `ExampleMapSelectWmsComponent`, `ExampleMapZoomScalePositionComponent`, `ExampleMeasure`, `ExampleSearchLocationComponent`, `ExampleSearchLocationAdvComponent`, `ExampleSearchLocationAlternativeSearchComponent`, `ExampleSearchLocationOnlyLocationComponent`, `ExampleSnappingAdvComponent`, `ExampleSnappingBasicComponent`, `ExampleToolbar`, `ExampleToolbarLocation`, `GgcHomeComponent`, `IntroductionComponent`, `MenuBarComponent`, `QuickstartComponent`.

## Consumer Migration

Angular template bindings such as `[themes]`, `(events)`, `(legendsChange)`, `(activeChanged)`, `(drawItemClicked)`, and `(measureItemClicked)` do not change. Output names, event payloads, and emission order are preserved. TypeScript consumers that read a signal input directly must call it, for example `component.themes()`; callers should not write to an input signal.

Consumers reading directive inputs directly in TypeScript must likewise call the signal, for example `valueTemplateDirective.ggcTemplateKey()` or `valueTemplateDirective.templateType()`. Normal template usage such as `[ggcTemplateKey]`, `[templateType]`, `[ggcDatasetLabelTemplate]`, and `[ggcLayerLabelTemplate]` is unchanged.

Consumers that access a component output in TypeScript still use `subscribe()`, but the output is now an Angular `OutputEmitterRef`, not an RxJS `EventEmitter`. Code using EventEmitter-only APIs such as `.pipe()` or `.next()` must be migrated. For example:

```ts
component.events.subscribe((event) => handleEvent(event));
```

Signal queries are used internally for the migrated view and content queries. `GgcToolbarItemComponent` preserves its existing direct `toolbarItemTemplate` and `toolbarItem` reads through getters, including access through `ToolbarItemComponentEvent`.

The map mouse-position and scale-line controls now attach after their view targets exist (`AfterViewInit`), rather than during `OnInit`. This preserves the configured target and cleanup behavior while matching signal-query availability.

## Release Coordination

Direct TypeScript use of component outputs is a compatibility consideration for the next major release: `OutputEmitterRef` retains `subscribe()` but not RxJS `EventEmitter` methods such as `.pipe()` and `.next()`. Direct reads of signal inputs likewise require calling the input. Toolbar query reads retain their previous direct getter form. TMS-11459's signal modernization and TMS-11547's service work were supplied by the developer as Jira descriptions; Jira was not available through MCP in this session. The decision to ship these changes together and coordination with TMS-11459/TMS-11547 remain to be confirmed in Jira before release. No Jira fields were changed.