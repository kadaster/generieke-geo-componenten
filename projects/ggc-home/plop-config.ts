// Beschikbare directories voor voorbeelden in /ggc-home/src/app/examples
export const directoryChoices = [
  "examples",
  "examples/example-3d",
  "examples/example-dataset-switcher",
  "examples/example-dataset-tree",
  "examples/example-draw",
  "examples/example-format",
  "examples/example-index",
  "examples/example-layer",
  "examples/example-legend",
  "examples/example-map",
  "examples/example-measure",
  "examples/example-search-location",
  "examples/example-snapping",
  "examples/example-toolbar"
] as const;

// Beschikbare component tags voor voorbeelden
export const componentTagChoices = [
  "GGC_DATASET_SWITCHER",
  "GGC_DATASET_TREE",
  "GGC_LEGEND",
  "GGC_MAP",
  "GGC_SEARCH_LOCATION",
  "GGC_TOOLBAR",
  "GGC_FEATURE_INFO",
  "GGC_3D"
] as const;

// Beschikbare feature tags voor voorbeelden
export const tagChoices = [
  "CONTROLS",
  "DATASET",
  "DRAW",
  "HIGHLIGHT",
  "IMPORT",
  "KEYBOARD",
  "LAYER",
  "LEGEND",
  "LOCATION",
  "MEASURE",
  "MODIFY",
  "OBJECTINFO",
  "OGC API",
  "SCALE",
  "SEARCH",
  "SELECT",
  "SNAP",
  "STYLE",
  "TOOLBAR",
  "TRACE",
  "ZOOM"
] as const;

// Beschikbare thema's voor categorisatie van voorbeelden
export const themeChoices = [
  "INFORMATIE_OP_KAART",
  "KAARTBEDIENING",
  "KAARTLAGEN",
  "KAARTWEERGAVE_KIEZEN",
  "LEGENDA",
  "TEKENEN",
  "WERKBALK",
  "ZOEKEN"
] as const;

// Layout opties
export const layoutChoices = [
  {
    name: "Een kolom (alleen kaart)",
    value: "one-column"
  },
  {
    name: "Twee kolommen (bediening links, kaart rechts)",
    value: "two-column"
  },
  {
    name: "Drie kolommen (bediening links, kaart midden, bediening rechts)",
    value: "three-column"
  }
] as const;
