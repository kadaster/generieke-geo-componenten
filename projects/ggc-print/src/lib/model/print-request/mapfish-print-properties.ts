import { Coordinate } from "ol/coordinate";

export interface MapfishPrintProperties {
  scale: number;
  layout: string;
  center: Coordinate;
  extraPrintlayers: string[];
  mapAreaSize: MapAreaSizeInPixels;
  attributes: object;
  outputFilenameFunction?: (value: Map<string, string>) => string;
  mapIndex?: string;
}

export interface MapAreaSizeInPixels {
  width: number;
  height: number;
}
