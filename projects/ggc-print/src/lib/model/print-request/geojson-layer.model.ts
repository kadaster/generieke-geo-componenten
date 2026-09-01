import { Layer } from "./layer.model";
import { GeoJSONFeatureCollection } from "ol/format/GeoJSON";

export interface GeoJSONLayerOptions {
  style: object;
  geoJson: GeoJSONFeatureCollection | string;
}

export class GeoJSONLayer extends Layer {
  style: object;
  geoJson: GeoJSONFeatureCollection | string;

  constructor(geojsonLayerOptions: GeoJSONLayerOptions) {
    super({ type: "Vector", opacity: 1 });
    this.geoJson = geojsonLayerOptions.geoJson;
    this.style = geojsonLayerOptions.style;
  }
}
