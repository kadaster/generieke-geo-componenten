import { MapfishMap } from "./mapfish-map.model";

export interface Attributes {
  [propName: string]: object | string;
  map: MapfishMap;
}
