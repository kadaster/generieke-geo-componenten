// Beschikbare directories voor voorbeelden in /ggc-home/src/app/examples
export const directoryChoices = [
  { name: "examples (root - niet genest)", value: "examples" },
  { name: "examples/example-3d", value: "examples/example-3d" },
  { name: "examples/example-dataset-switcher", value: "examples/example-dataset-switcher" },
  { name: "examples/example-dataset-tree", value: "examples/example-dataset-tree" },
  { name: "examples/example-draw", value: "examples/example-draw" },
  { name: "examples/example-format", value: "examples/example-format" },
  { name: "examples/example-index", value: "examples/example-index" },
  { name: "examples/example-layer", value: "examples/example-layer" },
  { name: "examples/example-legend", value: "examples/example-legend" },
  { name: "examples/example-map", value: "examples/example-map" },
  { name: "examples/example-measure", value: "examples/example-measure" },
  { name: "examples/example-search-location", value: "examples/example-search-location" },
  { name: "examples/example-snapping", value: "examples/example-snapping" },
  { name: "examples/example-toolbar", value: "examples/example-toolbar" },
  "Aangepaste map..."
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
