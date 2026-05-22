import { Routes } from "@angular/router";
import { ExampleSnappingBasicComponent } from "./examples/example-snapping/example-snapping-basic/example-snapping-basic.component";
import { ExampleSnappingAdvComponent } from "./examples/example-snapping/example-snapping-adv/example-snapping-adv.component";
import { ExampleSearchLocationComponent } from "./examples/example-search-location/example-search-location/example-search-location.component";
import { ExampleIndexComponent } from "./examples/example-index/example-index.component";
import { ExampleDatasetTreeBasicComponent } from "./examples/example-dataset-tree/example-dataset-tree-basic/example-dataset-tree-basic.component";
import { ExampleDatasetTreeAdvComponent } from "./examples/example-dataset-tree/example-dataset-tree-adv/example-dataset-tree-adv.component";
import { ExampleLegendAdvComponent } from "./examples/example-legend/example-legend-adv/example-legend-adv.component";
import { ExampleLegendZoomComponent } from "./examples/example-legend/example-legend-zoom/example-legend-zoom.component";
import { ExampleLegendDatasetTreeComponent } from "./examples/example-legend/example-legend-dataset-tree/example-legend-dataset-tree.component";
import { ExampleDatasetTreeTemplatesComponent } from "./examples/example-dataset-tree/example-dataset-tree-templates/example-dataset-tree-templates.component";
import { ExampleDatasetSwitcherBasicComponent } from "./examples/example-dataset-switcher/example-dataset-switcher-basic/example-dataset-switcher-basic.component";
import { ExampleSearchLocationWoonplaatsComponent } from "./examples/example-search-location/example-search-location-woonplaats/example-search-location-woonplaats.component";
import { ExampleDatasetTreeLayerEnabledCallback } from "./examples/example-dataset-tree/example-dataset-tree-layer-enabled-callback/example-dataset-tree-layer-enabled-callback.component";
import { GgcHomeComponent } from "./ggc-home/ggc-home.component";
import { ExampleSearchLocationAdvComponent } from "./examples/example-search-location/example-search-location-adv/example-search-location-adv.component";
import { ExampleDatasetTreeBasicListComponent } from "./examples/example-dataset-tree/example-dataset-tree-basic-list/example-dataset-tree-basic-list.component";
import { ExampleLayerImageComponent } from "./examples/example-layer/example-layer-image/example-layer-image.component";
import { ExampleLayerWmsComponent } from "./examples/example-layer/example-layer-wms/example-layer-wms.component";
import { ExampleLayerWmtsComponent } from "./examples/example-layer/example-layer-wmts/example-layer-wmts.component";
import { ExampleLayerGeojsonComponent } from "./examples/example-layer/example-layer-geojson/example-layer-geojson.component";
import { ExampleLayerGeojsonWfsComponent } from "./examples/example-layer/example-layer-geojson-wfs/example-layer-geojson-wfs.component";
import { ExampleLayerGeojsonOgcComponent } from "./examples/example-layer/example-layer-geojson-ogc/example-layer-geojson-ogc.component";
import { ExampleLayerVectorTileComponent } from "./examples/example-layer/example-layer-vector-tile/example-layer-vector-tile.component";
import { ExampleLayerHtmlConfig } from "./examples/example-layer/example-layer-html-config/example-layer-html-config.component";
import { ExampleLayerJsonConfig } from "./examples/example-layer/example-layer-json-config/example-layer-json-config.component";
import { ExampleToolbarLocation } from "./examples/example-toolbar/example-toolbar-location/example-toolbar-location.component";
import { ExampleToolbar } from "./examples/example-toolbar/example-toolbar/example-toolbar.component";
import { QuickstartComponent } from "./quickstart/quickstart.component";
import { ExampleDrawBasicComponent } from "./examples/example-draw/example-draw-basic/example-draw-basic.component";
import { ExampleDrawEditBasicComponent } from "./examples/example-draw/example-draw-edit-basic/example-draw-edit-basic.component";
import { ExampleDrawAdvComponent } from "./examples/example-draw/example-draw-adv/example-draw-adv.component";
import { ExampleDrawCenterDrawComponent } from "./examples/example-draw/example-draw-center-draw/example-draw-center-draw.component";
import { ExampleMeasure } from "./examples/example-measure/example-measure/example-measure.component";
import { ExampleDrawStyle } from "./examples/example-draw/example-draw-style/example-draw-style.component";
import { ExampleMeasureOwnStyleLabel } from "./examples/example-measure/example-measure-own-style-label/example-measure-own-style-label.component";
import { ExampleDatasetSwitcherRadioButtonsComponent } from "./examples/example-dataset-switcher/example-dataset-switcher-radio-buttons/example-dataset-switcher-radio-buttons.component";
import { DownloadsNpmComponent } from "./download-npm/downloads-npm.component";
import { IntroductionComponent } from "./introduction/introduction.component";
import { ExampleDrawTracingComponent } from "./examples/example-draw/example-draw-tracing/example-draw-tracing.component";
import { ExampleDrawCenterEditBasicComponent } from "./examples/example-draw/example-draw-center-edit-basic/example-draw-center-edit-basic.component";
import { ExampleMapZoomScalePositionComponent } from "./examples/example-map/example-map-zoom-scale-position/example-map-zoom-scale-position.component";
import { ExampleMapSelectComponent } from "./examples/example-map/example-map-select/example-map-select.component";
import { ExampleMapSelectHoverClickComponent } from "./examples/example-map/example-map-select-hover-click/example-map-select-hover-click.component";

export const routes: Routes = [
  {
    path: "",
    title: "GGC Home",
    component: GgcHomeComponent,
    data: { label: "GGC home" }
  },
  {
    path: "quick-start",
    title: "Quick start | GGC-Home",
    component: QuickstartComponent
  },
  {
    path: "introduction",
    title: "Introductie | GGC-Home",
    component: IntroductionComponent
  },
  {
    path: "downloads-npm",
    title: "Downloads (NPM) | GGC-Home",
    component: DownloadsNpmComponent
  },
  {
    path: "example-index",
    title: "Voorbeelden | GGC-Home",
    component: ExampleIndexComponent,
    data: { label: "Example Index" }
  },
  {
    path: "layer-image",
    title: "Layer-image | GGC-Home",
    component: ExampleLayerImageComponent,
    data: { label: "Layer Image" }
  },
  {
    path: "layer-wms",
    title: "Layer-wms | GGC-Home",
    component: ExampleLayerWmsComponent,
    data: { label: "Layer WMS" }
  },
  {
    path: "layer-wmts",
    title: "Layer-wmts | GGC-Home",
    component: ExampleLayerWmtsComponent,
    data: { label: "Layer WMTS" }
  },
  {
    path: "layer-geojson",
    title: "Layer-GeoJSON | GGC-Home",
    component: ExampleLayerGeojsonComponent,
    data: { label: "Layer GeoJSON" }
  },
  {
    path: "layer-geojson-wfs",
    title: "Layer-GeoJSON-wfs | GGC-Home",
    component: ExampleLayerGeojsonWfsComponent,
    data: { label: "Layer GeoJSON WFS" }
  },
  {
    path: "layer-geojson-ogc",
    title: "Layer-GeoJSON-ogc | GGC-Home",
    component: ExampleLayerGeojsonOgcComponent,
    data: { label: "Layer GeoJSON OGC" }
  },
  {
    path: "layer-vector-tile",
    title: "Layer-vector-tile | GGC-Home",
    component: ExampleLayerVectorTileComponent,
    data: { label: "Layer Vector Tile" }
  },
  {
    path: "layer-html-config",
    title: "Layer-html-config | GGC-Home ",
    component: ExampleLayerHtmlConfig,
    data: { label: "Layer HTML config" }
  },
  {
    path: "layer-json-config",
    title: "Layer-JSON-config | GGC-Home",
    component: ExampleLayerJsonConfig,
    data: { label: "Layer JSON config)" }
  },
  {
    path: "snapping-basic",
    title: "Snappen | GGC-Home",
    component: ExampleSnappingBasicComponent,
    data: { label: "Snapping-basic" }
  },
  {
    path: "snapping-advanced",
    title: "Snappen-uitgebreid | GGC-Home",
    component: ExampleSnappingAdvComponent,
    data: { label: "Snapping-advanced" }
  },
  {
    path: "search-location",
    title: "Zoeken | GGC-Home",
    component: ExampleSearchLocationComponent,
    data: { label: "search-location" }
  },
  {
    path: "search-location-adv",
    title: "Zoeken-uitgebreid | GGC-Home",
    component: ExampleSearchLocationAdvComponent,
    data: { label: "search-location-adv" }
  },
  {
    path: "search-location-woonplaats",
    title: "Zoeken-woonplaats | GGC-Home",
    component: ExampleSearchLocationWoonplaatsComponent,
    data: { label: "search-location-woonplaats" }
  },
  {
    path: "dataset-tree-basic",
    title: "Dataset boomstructuur | GGC-Home",
    component: ExampleDatasetTreeBasicComponent,
    data: { label: "dataset-tree-basic" }
  },
  {
    path: "dataset-tree-basic-list",
    title: "Dataset lijst | GGC-Home",
    component: ExampleDatasetTreeBasicListComponent,
    data: { label: "dataset-tree-basic-list" }
  },
  {
    path: "dataset-tree-advanced",
    title: "Dataset-uitgebreid | GGC-Home",
    component: ExampleDatasetTreeAdvComponent,
    data: { label: "dataset-tree-advanced" }
  },
  {
    path: "dataset-tree-label-template",
    title: "Dataset label template | GGC-Home",
    component: ExampleDatasetTreeTemplatesComponent,
    data: { label: "dataset-tree, template" }
  },
  {
    path: "dataset-switcher",
    title: "Dataset wisselen | GGC-Home",
    component: ExampleDatasetSwitcherBasicComponent,
    data: { label: "dataset-switcher" }
  },
  {
    path: "dataset-switcher-radio-buttons",
    title: "Dataset wisselen radio buttons | GGC-Home",
    component: ExampleDatasetSwitcherRadioButtonsComponent,
    data: { label: "dataset-switcher" }
  },
  {
    path: "legend-advanced",
    title: "Legenda-uitgebreid | GGC-Home",
    component: ExampleLegendAdvComponent,
    data: { label: "legend-advanced" }
  },

  {
    path: "legend-basic",
    title: "Legenda weergeven | GGC-Home",
    component: ExampleLegendZoomComponent,
    data: { label: "legend-basic" }
  },
  {
    path: "legend-dataset-tree",
    title: "Legenda Dataset | GGC-Home",
    component: ExampleLegendDatasetTreeComponent,
    data: { label: "legend-dataset-tree" }
  },
  {
    path: "dataset-tree-layer-enabled-callback",
    title: "Dataset callback | GGC-Home",
    component: ExampleDatasetTreeLayerEnabledCallback,
    data: { label: "dataset-tree-layer-enabled-callback" }
  },
  {
    path: "toolbar",
    title: "Toolbar | GGC-Home",
    component: ExampleToolbar,
    data: { label: "toolbar" }
  },
  {
    path: "toolbar-location",
    title: "Toolbar locatie | GGC-Home",
    component: ExampleToolbarLocation,
    data: { label: "toolbar-location" }
  },
  {
    path: "draw-basic",
    title: "Tekenen | GGC-Home",
    component: ExampleDrawBasicComponent,
    data: { label: "draw-basic" }
  },
  {
    path: "draw-adv",
    title: "Tekenen-uitgebreid | GGC-Home",
    component: ExampleDrawAdvComponent,
    data: { label: "draw-adv" }
  },
  {
    path: "draw-edit-basic",
    title: "Bewerken | GGC-Home",
    component: ExampleDrawEditBasicComponent,
    data: { label: "draw-edit-basic" }
  },
  {
    path: "draw-center-edit-basic",
    title: "Bewerken centrum kaart | GGC-Home",
    component: ExampleDrawCenterEditBasicComponent,
    data: { label: "draw-cetner-edit-basic" }
  },
  {
    path: "draw-center-draw",
    title: "Bewerken centrum kaart | GGC-Home",
    component: ExampleDrawCenterDrawComponent,
    data: { label: "draw-center-draw" }
  },
  {
    path: "draw-tracing",
    title: "Tracing | GGC-Home",
    component: ExampleDrawTracingComponent,
    data: { label: "draw-tracing" }
  },
  {
    path: "measure",
    title: "Meten | GGC-Home",
    component: ExampleMeasure,
    data: { label: "measure" }
  },
  {
    path: "draw-style",
    title: "Tekenen styling | GGC-Home",
    component: ExampleDrawStyle,
    data: { label: "draw-style" }
  },
  {
    path: "measure-own-style-label",
    title: "Meten styling | GGC-Home",
    component: ExampleMeasureOwnStyleLabel,
    data: { label: "measure-own-style-label" }
  },
  {
    path: "example-map-zoom-scale-position",
    title: "Kaart eigenschappen tonen | GGC-Home",
    component: ExampleMapZoomScalePositionComponent,
    data: { label: "example-map-zoom-scale-position" }
  },
  {
    path: "example-map-select",
    title: "Selecteren op de kaart | GGC-Home",
    component: ExampleMapSelectComponent,
    data: { label: "example-map-select" }
  },
  {
    path: "example-map-select-hover-click",
    title: "Selecteren met hover en klik | GGC-Home",
    component: ExampleMapSelectHoverClickComponent,
    data: { label: "example-map-select-hover-click" }
  }
];
