import { MapAreaSizeInPixels } from "../model/print-request/mapfish-print-properties";
import { Coordinate } from "ol/coordinate";
import { Extent } from "ol/extent";

export const POINTS_PER_INCH = 72;
export const MM_PER_INCHES = 25.4;

export const calculatePrintRectangle = (
  mapAreaSize: MapAreaSizeInPixels,
  scale: number,
  center: Coordinate
): Extent => {
  const w =
    (((mapAreaSize.width / POINTS_PER_INCH) * MM_PER_INCHES) / 1000.0) * scale;
  const h =
    (((mapAreaSize.height / POINTS_PER_INCH) * MM_PER_INCHES) / 1000.0) * scale;
  const minx = center[0] - w / 2;
  const miny = center[1] - h / 2;
  const maxx = center[0] + w / 2;
  const maxy = center[1] + h / 2;
  return [minx, miny, maxx, maxy];
};
