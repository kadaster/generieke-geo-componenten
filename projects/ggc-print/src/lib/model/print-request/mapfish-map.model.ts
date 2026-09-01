import { Layer } from "./layer.model";

export interface MapfishMapOptions {
  projection: string;
  dpi: number;
  rotation?: number;
  center: [number, number];
  longitudeFirst?: boolean;
  scale: number;
  layers: Layer[];
}

export class MapfishMap {
  projection: string;
  dpi: number;
  rotation?: number;
  center: [number, number];
  longitudeFirst?: boolean;
  scale: number;
  layers: Layer[];

  constructor(mapfishMapOptions: MapfishMapOptions) {
    this.projection = mapfishMapOptions.projection;
    this.center = mapfishMapOptions.center;
    this.dpi = mapfishMapOptions.dpi;
    this.rotation = mapfishMapOptions.rotation;
    this.longitudeFirst = mapfishMapOptions.longitudeFirst;
    this.scale = mapfishMapOptions.scale;
    this.layers = mapfishMapOptions.layers;
  }
}
