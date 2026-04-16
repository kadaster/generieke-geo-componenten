import { Extent } from "ol/extent";
import { Units } from "ol/proj/Units";

export interface CrsConfig {
  projectionCode: string;
  extent: Extent;
  resolutions: number[];
  matrixSet: string;
  matrixIds: string[];
  matrixSizes: number[];
  units: Units;
}
