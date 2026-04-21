import { Routes } from "@angular/router";
import { ExampleSnappingBasicComponent } from "./examples/example-snapping/example-snapping-basic/example-snapping-basic.component";
import { ExampleSnappingAdvComponent } from "./examples/example-snapping/example-snapping-adv/example-snapping-adv.component";
import { ExampleSearchLocationComponent } from "./examples/example-search-location/example-search-location/example-search-location.component";
import { ExampleIndexComponent } from "./examples/example-index/example-index.component";
import { ExampleDatasetTreeBasicComponent } from "./examples/example-dataset-tree/example-dataset-tree-basic/example-dataset-tree-basic.component";
import { ExampleDatasetTreeAdvComponent } from "./examples/example-dataset-tree/example-dataset-tree-adv/example-dataset-tree-adv.component";
import { ExampleLegendBasicComponent } from "./examples/example-legend/example-legend-basic/example-legend-basic.component";
import { ExampleLegendAdvComponent } from "./examples/example-legend/example-legend-adv/example-legend-adv.component";
import { ExampleLegendZoomComponent } from "./examples/example-legend/example-legend-zoom/example-legend-zoom.component";
import { ExampleLegendDatasetTreeComponent } from "./examples/example-legend/example-legend-dataset-tree/example-legend-dataset-tree.component";
import { ExampleLegendOgcApiTilesComponent } from "./examples/example-legend/example-legend-ogc-api-tiles/example-legend-ogc-api-tiles.component";
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
import { ExampleLayerBasicComponent } from "./examples/example-layer/example-layer-basic/example-layer-basic.component";
import { ExampleLayerAdvancedComponent } from "./examples/example-layer/example-layer-advanced/example-layer-advanced.component";
import { ExampleLayerAdvanced2Component } from "./examples/example-layer/example-layer-advanced2/example-layer-advanced2.component";
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

export const routes: Routes = [
  {
    path: "",
    title: "GGC home",
    component: GgcHomeComponent,
    data: { label: "GGC home" }
  },
  {
    path: "quick-start",
    title: "Quick start",
    component: QuickstartComponent
  },
  {
    path: "example-index",
    title: "example-index",
    component: ExampleIndexComponent,
    data: { label: "Example Index" }
  },
  {
    path: "layer-image",
    title: "layer-image",
    component: ExampleLayerImageComponent,
    data: { label: "Layer Image" }
  },
  {
    path: "layer-wms",
    title: "layer-wms",
    component: ExampleLayerWmsComponent,
    data: { label: "Layer WMS" }
  },
  {
    path: "layer-wmts",
    title: "layer-wmts",
    component: ExampleLayerWmtsComponent,
    data: { label: "Layer WMTS" }
  },
  {
    path: "layer-geojson",
    title: "layer-geojson",
    component: ExampleLayerGeojsonComponent,
    data: { label: "Layer GeoJSON" }
  },
  {
    path: "layer-geojson-wfs",
    title: "layer-geojson-wfs",
    component: ExampleLayerGeojsonWfsComponent,
    data: { label: "Layer GeoJSON WFS" }
  },
  {
    path: "layer-geojson-ogc",
    title: "layer-geojson-ogc",
    component: ExampleLayerGeojsonOgcComponent,
    data: { label: "Layer GeoJSON OGC" }
  },
  {
    path: "layer-vector-tile",
    title: "layer-vector-tile",
    component: ExampleLayerVectorTileComponent,
    data: { label: "Layer Vector Tile" }
  },
  {
    path: "layer-basic",
    title: "layer-basic",
    component: ExampleLayerBasicComponent,
    data: { label: "Layer (basic)" }
  },
  {
    path: "layer-advanced",
    title: "layer-advanced",
    component: ExampleLayerAdvancedComponent,
    data: { label: "Layer (advanced)" }
  },
  {
    path: "layer-advanced2",
    title: "layer-advanced2",
    component: ExampleLayerAdvanced2Component,
    data: { label: "Layer (advanced)" }
  },
  {
    path: "snapping-basic",
    title: "snapping-basic",
    component: ExampleSnappingBasicComponent,
    data: { label: "Snapping-basic" }
  },
  {
    path: "snapping-advanced",
    title: "snapping-advanced",
    component: ExampleSnappingAdvComponent,
    data: { label: "Snapping-advanced" }
  },
  {
    path: "search-location",
    title: "search-location",
    component: ExampleSearchLocationComponent,
    data: { label: "search-location" }
  },
  {
    path: "search-location-adv",
    title: "search-location-adv",
    component: ExampleSearchLocationAdvComponent,
    data: { label: "search-location-adv" }
  },
  {
    path: "search-location-woonplaats",
    title: "search-location-woonplaats",
    component: ExampleSearchLocationWoonplaatsComponent,
    data: { label: "search-location-woonplaats" }
  },
  {
    path: "dataset-tree-basic",
    title: "dataset-tree-basic",
    component: ExampleDatasetTreeBasicComponent,
    data: { label: "dataset-tree-basic" }
  },
  {
    path: "dataset-tree-basic-list",
    title: "dataset-tree-basic-list",
    component: ExampleDatasetTreeBasicListComponent,
    data: { label: "dataset-tree-basic-list" }
  },
  {
    path: "dataset-tree-advanced",
    title: "dataset-tree-advanced",
    component: ExampleDatasetTreeAdvComponent,
    data: { label: "dataset-tree-advanced" }
  },
  {
    path: "dataset-tree-label-template",
    title: "dataset-tree-label-template",
    component: ExampleDatasetTreeTemplatesComponent,
    data: { label: "dataset-tree, template" }
  },
  {
    path: "dataset-switcher",
    title: "dataset-switcher",
    component: ExampleDatasetSwitcherBasicComponent,
    data: { label: "dataset-switcher" }
  },
  {
    path: "dataset-switcher-radio-buttons",
    title: "dataset-switcher-radio-buttons",
    component: ExampleDatasetSwitcherRadioButtonsComponent,
    data: { label: "dataset-switcher" }
  },
  {
    path: "legend-basic",
    title: "legend-basic",
    component: ExampleLegendBasicComponent,
    data: { label: "legend-basic" }
  },
  {
    path: "legend-advanced",
    title: "legend-advanced",
    component: ExampleLegendAdvComponent,
    data: { label: "legend-basic" }
  },

  {
    path: "legend-zoom",
    title: "legend-zoom",
    component: ExampleLegendZoomComponent,
    data: { label: "legend-zoom" }
  },
  {
    path: "legend-dataset-tree",
    title: "legend-dataset-tree",
    component: ExampleLegendDatasetTreeComponent,
    data: { label: "legend-dataset-tree" }
  },
  {
    path: "legend-ogc-api-tiles",
    title: "legend-ogc-api-tiles",
    component: ExampleLegendOgcApiTilesComponent,
    data: { label: "legend-dataset-tree ogc-api-tiles" }
  },
  {
    path: "dataset-tree-layer-enabled-callback",
    title: "dataset-tree-layer-enabled-callback",
    component: ExampleDatasetTreeLayerEnabledCallback,
    data: { label: "dataset-tree-layer-enabled-callback" }
  },
  {
    path: "toolbar",
    title: "toolbar",
    component: ExampleToolbar,
    data: { label: "toolbar" }
  },
  {
    path: "toolbar-location",
    title: "toolbar-location",
    component: ExampleToolbarLocation,
    data: { label: "toolbar-location" }
  },
  {
    path: "draw-basic",
    title: "draw-basic",
    component: ExampleDrawBasicComponent,
    data: { label: "draw-basic" }
  },
  {
    path: "draw-adv",
    title: "draw-adv",
    component: ExampleDrawAdvComponent,
    data: { label: "draw-adv" }
  },
  {
    path: "draw-edit-basic",
    title: "draw-edit-basic",
    component: ExampleDrawEditBasicComponent,
    data: { label: "draw-edit-basic" }
  },
  {
    path: "draw-center-draw",
    title: "draw-center-draw",
    component: ExampleDrawCenterDrawComponent,
    data: { label: "draw-center-draw" }
  },
  {
    path: "measure",
    title: "measure",
    component: ExampleMeasure,
    data: { label: "measure" }
  },
  {
    path: "draw-style",
    title: "draw-style",
    component: ExampleDrawStyle,
    data: { label: "draw-style" }
  },
  {
    path: "measure-own-style-label",
    title: "measure-own-style-label",
    component: ExampleMeasureOwnStyleLabel,
    data: { label: "measure-own-style-label" }
  }
];
