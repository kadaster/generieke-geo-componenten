import { Segmenters } from "ol/interaction/Snap";

/**
 * Options om te snappen
 */
export interface SnapOptions {
  pixelTolerance?: number;
  /**
   * De layerIds waarnaar gesnapt moet worden
   */
  snapLayers?: string[];
  snapDrawLayers?: string[];
  vertex?: boolean;
  edge?: boolean;
  intersection?: boolean;
  segmenters?: Segmenters;
}
