import { Segmenters } from "ol/interaction/Snap";

export interface SnapOptions {
  pixelTolerance?: number;
  snapLayers?: string[];
  snapDrawLayers?: string[];
  vertex?: boolean;
  edge?: boolean;
  intersection?: boolean;
  segmenters?: Segmenters;
}
