import { StyleLike } from "ol/style/Style";
import { Feature } from "ol";

export interface IProperties {
  [key: string]: string;
}

export type LegendItem = {
  sourceLayer: unknown;
  name: string;
  title: string;
  geoType: LayerType;
  style: StyleLike;
  feature: Feature | undefined;
  properties: IProperties;
};

export interface MapboxStyle {
  version: number;
  metadata?: Metadata;
  name: string;
  id: string;
  sprite: string;
  glyphs: string;
  layers: Layer[];
  sources: NonNullable<unknown>;
}

export interface Metadata {
  "ol:webfonts"?: string;
  "gokoala:title-items"?: string;
}

export interface Layer {
  filterCopy: Filter;
  id: string;
  type: LayerType;
  paint: Paint;
  source: string;
  layout?: Layout;
  "source-layer": string;
  filter: Filter;
}

export type Filter = filterval[];
export type filterval = string | bigint | filterval[];

export interface Paint {
  "fill-color"?: Pattern | string;
  "fill-opacity"?: number;
  "line-color"?: Pattern | string;
  "line-width"?: number;
  "fill-outline-color"?: string;
  "fill-pattern"?: Pattern;
  "circle-radius"?: number;
  "circle-color"?: Pattern | string;
  "text-color"?: Pattern | string;
}

export enum Line {
  Round = "round"
}

export interface Layout {
  visibility?: string;
  "line-join"?: Line;
  "line-cap"?: Line;
  "text-field"?: string;
  "text-size"?: number;
  "text-font"?: string[];
  "symbol-placement"?: LayerType;
  "icon-image"?: string;
  "icon-size"?: number;
  "text-offset"?: number[];
}
/*
stops is een array van waarde-kleur paren. Het werkt als een soort "lookup table":
afhankelijk van de waarde van een attribuut, wordt een bepaalde kleur gekozen.
Bijv:
"fill-color": {
  "property": "type",
  "stops": [
    ["water", "#80BDE3"],
    ["land", "#A0D995"]
  ]
}
- Als type == "water" → kleur #80BDE3
- Als type == "land" → kleur #A0D995
*/
export interface StopsPattern {
  property: string;
  type: string;
  stops: Array<string[]>;
}

/*
Een MatchPattern is wordt gebruikt om waarden te matchen en daar een stijl (zoals kleur) aan te koppelen.
Het wordt vaak gebruikt om bijvoorbeeld verschillende kleuren toe te wijzen aan verschillende categorieën van een eigenschap.
Bijv:
"fill-color": [
  "match",
  ["get", "type"],
  "water", "#80BDE3",
  "land", "#A0D468",
  "#CCCCCC"
]
- "match": het type expressie
- ["get", "type"]: haalt de waarde van de eigenschap type uit een feature
- "water", "#80BDE3": als type gelijk is aan "water", gebruik dan kleur #80BDE3
- "land", "#A0D468": als type gelijk is aan "land", gebruik dan kleur #A0D468
- "#CCCCCC": default waarde als geen match gevonden wordt
*/
export type MatchPattern = Array<string | string>;

export type Pattern = MatchPattern | StopsPattern;

export enum LayerType {
  Circle = "circle",
  Fill = "fill",
  Line = "line",
  Raster = "raster",
  Symbol = "symbol"
}
