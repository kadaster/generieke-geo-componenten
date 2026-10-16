# Angular 22 Service Modernization (TMS-11547)

This audit covers 65 service files: 61 across the libraries and 4 in GGC Home. The per-project counts are: `ggc-conversion` 1, `ggc-dataset-tree` 4, `ggc-feature-info` 4, `ggc-legend` 5, `ggc-map` 22, `ggc-map-3d` 12, `ggc-print` 6, `ggc-search-location` 5, `ggc-toolbar` 2, and `ggc-home` 4.

This is the living review record for TMS-11547. For each service discussed, record the decision, observable consumer impact, compatibility status, and verification here. Do not describe a proposed API as implemented until it is present in the code; mark unresolved behavior and release decisions as open.

## Service Inventory

- `ggc-conversion`: `GgcConversionService`.
- `ggc-dataset-tree`: `CoreDatasetTreeService`, `GgcDatasetTreeModelCreateService`, `GgcDatasetTreeConnectService`, `DatasetTreeMapConnectService`.
- `ggc-feature-info`: `GgcFeatureInfoConnectService`, `FeatureInfoEventService`, `FeatureInfoMapConnectService`, `GgcFeatureInfoConfigService`.
- `ggc-home`: `AlternativeSuggestService`, `EventTrackerService`, `PiwikScriptLoaderService`, `SessionStorageService`.
- `ggc-legend`: `GgcLegendConnectService`, `CoreLegendService`, `GgcLegendService`, `GgcLegendMapConnectService`, `MapboxStyleService`.
- `ggc-map`: `GgcCrsConfigService`, `CoreDrawLayerService`, `CoreDrawValidationService`, `CoreDrawService`, `CoreMeasureDrawStyleService`, `CoreSnapService`, `GgcDrawService`, `GgcSnapService`, `CoreOgcApiCapabilitiesService`, `CoreOgcApiFeaturesService`, `CoreWmsWmtsCapabilitiesRequestService`, `CoreWmsWmtsCapabilitiesService`, `GgcCapabilitiesService`, `GgcOgcApiCapabilitiesService`, `CoreLoadingService`, `CoreMapEventsService`, `CoreMapService`, `GgcMapEventsService`, `GgcMapService`, `CoreSelectionService`, `GgcLayerService`, `GgcSelectionService`.
- `ggc-map-3d`: `BaseLayerService`, `GeoJsonLayerService`, `GgcSharedLayerService`, `Tiles3dLayerService`, `WmtsLayerService`, `CoreCameraService`, `CoreSelectionService`, `CoreViewerService`, `GgcDrawingService`, `GgcLocationService`, `GgcSelectionService`, `GgcViewerService`.
- `ggc-print`: `AttributesControlService`, `ProcessCapabilitiesService`, `GgcMapfishInteractionService`, `PrintConfigService`, `PrintPreviewService`, `GgcMapfishPrintrequestCreateService`.
- `ggc-search-location`: `GgcSearchLocationConnectService`, `GgcAdditionalSuggestionSourceService`, `GgcSearchLocationService`, `GgcSearchRdService`, `PdokLocationApiService`.
- `ggc-toolbar`: `GgcToolbarConnectService`, `GgcToolbarService`.

## DI and Lifetime

- The 64 root-provided services use Angular 22 `@Service()`. Their root lifetime is unchanged.
- `PrintPreviewService` remains `@Injectable()` without `providedIn: 'root'`; its component-level provider scope is intentional.
- The duplicate `@Injectable()` on `CoreOgcApiCapabilitiesService` was removed.
- Optional map/viewer integrations remain lazy and optional; no new mandatory 2D or 3D dependency was introduced.

## Signal State and RxJS Events

- `GgcToolbarService.activeToolbarItem` is read-only signal state and is consumed by `GgcToolbarComponent`; writes remain through `setActiveToolbarItem()`.
- Proposed additional signal APIs for loading, viewer state, camera state, zoom state, and 2D/3D current selection were removed after review because no production consumer justified maintaining duplicate state or adding an unused API. Existing Observable and synchronous getter behavior is retained.
- `CoreLoadingService.isLoading()` remains the per-map loading API. Its `BehaviorSubject` and `distinctUntilChanged()` behavior remain unchanged; no parallel loading signal is exposed.
- `CoreViewerService` keeps its `BehaviorSubject` Observable, including the initial `undefined` and every update, and its synchronous `getViewer()` getter. `CoreCameraService` keeps its `ReplaySubject(1)` Observable and replay behavior.
- The OpenLayers `View` remains the source of truth for zoom. `GgcZoomLevelComponent` and `GgcScaleDenominatorComponent` continue to respond to the existing `zoomend` event; `CoreMapService` does not mirror zoom in a signal.
- 2D and 3D selection state remains Map-backed and available through the existing synchronous getters and RxJS event APIs. No `getCurrentFeatureCollectionSignal()` API is added.
- `CoreMapService` and the `GgcMapService` facade expose a map-destroy Observable. `GgcSearchLocationService` subscribes only while tracking and clears a matching browser geolocation watch on map destruction; the optional map integration remains lazy.
- RxJS remains the event and HTTP-composition API. Repeated events, filtering, ordering, retry, replay, and cache behavior were not replaced with `toObservable()` or Resources.

## Event API Encapsulation

- `PdokLocationApiService.collectionsLoadedSubject` is private; `collectionsLoaded$` keeps its `ReplaySubject(1)` replay behavior. Consumers should read the Observable, not write to the subject.
- `GgcSearchLocationService.getGeolocationPositionErrorSubject()` was removed and replaced with `getGeolocationPositionErrorObservable()`. The component now subscribes to the read-only Observable; error timing and payload are unchanged. The service is exported from the package public API, so this is a source-breaking rename for consumers calling the old method.
- `FeatureInfoEventService.eventSubject` is private; `events$` and `emit()` remain the read/write API.
- `CoreLegendService` keeps its replaying event stream behind `getExpandAllObservable()` and `emitExpandAll()`. `GgcLegendService` commands remain unchanged; the core service is not exported from the package public API.
- `GgcToolbarService.getActiveToolbarItemObservable()` was replaced by the read-only `activeToolbarItem` signal, with writes still through `setActiveToolbarItem()`. The toolbar service is exported from the package public API, so consumers of the old getter must migrate.
- `PdokLocationApiService` is exported from the package public API. Hiding `collectionsLoadedSubject` is a source break for consumers that accessed or wrote to that property; `collectionsLoaded$` remains the read API.

## Breaking API Changes

The following are **source-breaking changes for existing consumers of the published packages**. Code using the old members will no longer compile. Updating the GGC components in this repository does not migrate third-party applications.

| Package and API | Before | After | Consumer migration |
| --- | --- | --- | --- |
| `@kadaster/ggc-search-location` `GgcSearchLocationService` | `getGeolocationPositionErrorSubject()` returned a writable `Subject`. | That method is removed; `getGeolocationPositionErrorObservable()` returns a read-only `Observable`. | Rename the call and subscribe to read errors. Code that called `.next()`, `.error()`, or `.complete()` must stop writing to this stream. |
| `@kadaster/ggc-toolbar` `GgcToolbarService` | `getActiveToolbarItemObservable()` returned a `BehaviorSubject`. | That method is removed; read current state through `activeToolbarItem()` and write through `setActiveToolbarItem()`. | Replace subscriptions/current-value reads with signal reads in reactive consumers; keep writes on the setter. |
| `@kadaster/ggc-search-location` `PdokLocationApiService` | `collectionsLoadedSubject` was a publicly accessible `ReplaySubject`. | The subject is private; `collectionsLoaded$` remains the public read-only `Observable` with `ReplaySubject(1)` replay. | Read/subscribe through `collectionsLoaded$`. Code accessing the subject directly, especially writers, must migrate. |

**Release decision: open.** These migration notes make the source breaks explicit but do not approve their release/versioning. Confirm the compatibility and versioning decision, and include the migrations in release notes before publishing affected packages.

## Behavioral Compatibility Changes

These changes do not break TypeScript compilation, but can change runtime behavior for existing consumers.

- **Geolocation tracking on map destruction:** before this change, `getLocation(true, mapIndex)` kept the browser watch active until explicitly stopped or an error occurred. Now the watch and map-destroy subscription are stopped when that same map is destroyed. A consumer that recreates the map and expects continuous tracking must call `getLocation(true, mapIndex)` again after the new map is ready. `getLocation(false, mapIndex)` remains a one-shot request and is unaffected.
- No GGC Home example currently demonstrates continuous tracking: the toolbar location example calls `getLocation(false)`, and the `<ggc-search-location>` component also requests a one-shot location. The restart requirement therefore applies to direct service consumers that opt into `track = true`.
- **Compatibility decision: open.** Confirm that ending tracking with the map lifetime is intended before release. If continuous tracking across map recreation is an expected contract, this cleanup changes that behavior and needs a different lifecycle design or an explicit migration notice.

## Pipeline Decisions

- PDOK autocomplete keeps its 400 ms debounce, `distinctUntilChanged()`, `switchMap()` cancellation, and `null` result for short terms. Combined search keeps `forkJoin`, suggestion ordering, and retries only on the PDOK request. `item()` remains a one-shot GET Observable with the existing retry policy.
- OGC API landing-page, styles, tiles, and aggregate-capabilities pipelines remain RxJS with their existing ordering, errors, parsing, and cache behavior. The current cache semantics were not corrected as part of migration.
- WMS/WMTS capabilities continue to use cached HTTP Observables and `shareReplay(1)`; sharing and replay remain unchanged.
- Print status polling retains its existing Observable contract. A proposed `take(1)` completion change was reverted because it altered behavior rather than migrating state.
- MapIndex- and selectIndex-filtered map, selection, dataset-tree, camera-visibility, drawing, snapping, and legend notifications remain RxJS events.

## Resource Cleanup

- `CoreLoadingService.removeMapLoaders()` unbinds and removes the map's listener-key entry. The `CoreMapService` layer-add listener is unbound at map destruction.
- `GgcMapComponent` explicitly calls `destroySelectionsForMap()` before destroying its map. This is preventive lifecycle cleanup; no prior user-reported leak or failure was identified during review.
- Draw/modify event-map entries and draw/modify/translate interactions are removed by per-map layer teardown. The per-feature geometry-change listener used during drawing is unbound on drawend or interaction removal.
- Draw validators are keyed by map and interaction owner (`draw`, `modify`, `move`). Normal end-events validate only their own interaction; explicitly stopping an interaction destroys only that owner's feature-change listeners. This is an intentional behavior change from map-wide validation and is recorded below.
- Geolocation tracking watches are cleared when the matching map-destroy event arrives; tracking can be restarted by calling `getLocation(true, mapIndex)` after map recreation.
- OpenLayers interactions and Cesium viewer-owned handlers retain their existing owner cleanup.
- `CoreSnapService` source-listener retention and shared cross-map snap-feature state were reviewed but not changed: correcting them requires a separate per-map resource/state redesign and is outside this migration. This remains a follow-up risk.

## Consumer Migration

Only make the changes below if your application uses the affected service API. These are consumer actions, not changes required in every GGC application.

### Location errors (`@kadaster/ggc-search-location`)

If your code calls `getGeolocationPositionErrorSubject()`, rename it to `getGeolocationPositionErrorObservable()` and subscribe to the result:

```ts
searchLocationService
  .getGeolocationPositionErrorObservable()
  .subscribe((error) => console.error(error));
```

The Observable is for reading errors. Do not call `.next()`, `.error()`, or `.complete()` on it. If your code only uses `<ggc-search-location>`, no change is needed for this API.

### Active toolbar item (`@kadaster/ggc-toolbar`)

If your code reads `getActiveToolbarItemObservable()`, that method no longer exists. Read the current value with `activeToolbarItem()`; keep using `setActiveToolbarItem(value)` to change it:

```ts
const activeItem = toolbarService.activeToolbarItem();
toolbarService.setActiveToolbarItem("search");
```

### PDOK collections (`@kadaster/ggc-search-location`)

If your code reads `collectionsLoadedSubject`, subscribe to `collectionsLoaded$` instead. It still replays the latest collection result to new subscribers. Do not publish values through the subject.

### Location tracking when a map is recreated

If your application directly calls `getLocation(true, mapIndex)`, destroying that map now stops its browser location watch. After recreating the map, call `getLocation(true, mapIndex)` again if tracking should resume. This does not apply to one-time calls with `getLocation(false, mapIndex)` or normal `<ggc-search-location>` usage, which requests a one-time location.

### Selection and map events

No migration is needed for selection reads or selection events: the existing synchronous getters and event Observables remain. `GgcMapService.getMapDestroyedObservable()` is an additive API; existing consumers do not need to use it.

## Review Decisions and Open Points

- **Signal scope:** keep the toolbar signal because `GgcToolbarComponent` consumes it. Do not add parallel, unused state signals for loading, viewer, camera, zoom, or current selection without an identified consumer and an explicit API decision.
- **Draw validation:** retain validator ownership by `draw`, `modify`, and `move`. The `valid` value on end-events now reflects only that interaction's validators rather than aggregating all validators for the map. This was accepted in review as the intended per-interaction behavior; tests should continue to protect owner isolation and cleanup.
- **Map selection teardown:** retain the explicit 2D selection cleanup on map destruction as preventive resource management. The review found no previously reported failure; do not describe it as a confirmed bug fix.
- **Geolocation tracking across map recreation (open):** tracking now stops with its map. GGC Home has no continuous-tracking example, but direct `getLocation(true, mapIndex)` consumers may rely on the previous watch lifetime; confirm the desired behavior before release.
- **3D selection clear behavior (open):** `CoreSelectionService.clearSelection()` now removes the current selection entry, so `GgcSelectionService.getCurrentFeatureCollection()` returns `undefined` after clearing. This differs from the previous behavior and needs an explicit compatibility decision before it is described as a non-breaking refactor.
- **Public API/release decision (open):** the source breaks listed in [Breaking API Changes](#breaking-api-changes) still need explicit compatibility and versioning approval before publication.
- Keep this section current as each service is reviewed: record decisions and compatibility impact here before treating a discussed change as approved.

## Verification and Context Limits

- The story text and acceptance criteria were supplied by the developer. Jira/MCP, issue comments, linked issues, and attachments were unavailable and were not reviewed.
- Repository-wide `npm run test:all` passed 1124 tests across 11 project suites. It ran before the later review-driven signal removals; after those removals, focused tests passed for the affected map and map-3d selection, camera, and viewer services.
- `npm run lint:all` omits `ggc-feature-info`; `npm run lint:ggc-feature-info` was run separately. Together, all 11 project lint targets completed with no errors and 66 existing warnings. After later edits, `ggc-map` and `ggc-map-3d` lint targets were rerun; `ggc-map` has 42 warnings and `ggc-map-3d` passes cleanly.
- Production builds and `npm run build:ggc-home` were recorded as passing before the later review-driven edits; they have not been rerun since those edits.
- The repository has no Cypress/Playwright dependency, npm script, or Angular e2e target. Cypress, BrowserStack, B1, and manual WCAG checks were therefore not run. GGC Home examples were compile-checked by the production build, not manually browser-tested.
