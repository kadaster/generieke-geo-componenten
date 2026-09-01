import { MapAreaSizeInPixels } from "../print-request/mapfish-print-properties";
import { Attribute } from "../capabilities/attribute";

export interface Template {
  name: string;
  attributes?: Attribute[];
  mapAreaSize: MapAreaSizeInPixels;
}
