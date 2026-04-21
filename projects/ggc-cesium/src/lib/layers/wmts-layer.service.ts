import { Injectable } from "@angular/core";
import {
  ImageryLayer,
  ImageryLayerCollection,
  WebMapTileServiceImageryProvider
} from "@cesium/engine";
import { BaseLayerService } from "./base-layer.service";
import { LayerObject } from "../model/core-interfaces";
import { LayerConfig } from "../model/interfaces";

/**
 * Service voor het toevoegen en beheren van WMTS-lagen in een ImageryLayerCollection.
 *
 * Deze service maakt gebruik van WebMapTileServiceImageryProvider om lagen toe te voegen
 * op basis van een Service configuratie.
 */
@Injectable({
  providedIn: "root"
})
export class WmtsLayerService extends BaseLayerService {
  protected layers: ImageryLayerCollection | null;
  /**
   * This weakMap is needed to keep track of layerIds of Cesium layers, as this
   * information gets lost otherwise
   */
  protected layerIdToCesiumLayer: Map<string, ImageryLayer> = new Map();

  constructor() {
    super();
    this.layers = new ImageryLayerCollection();
  }

  public setLayers(collection: ImageryLayerCollection) {
    this.layers = collection;
  }

  /**
   * Voegt een WMTS-laag toe aan de viewer.
   *
   * @param url - De URL van de WMTS-service.
   * @param layer - De Layer configuratie.
   */
  public addLayer(url: string, layer: LayerConfig): void {
    const provider = new WebMapTileServiceImageryProvider({
      url: url,
      layer: layer.layerName,
      style: "default",
      tileMatrixSetID: "EPSG:3857",
      maximumLevel: 19,
      format: "image/png",
      credit: layer.layerName
    });
    const layerObject: LayerObject = {
      showFromDataset: true,
      zIndex: layer.zIndex
    };
    this.layerMap.set(layer.layerId, layerObject);

    const layers = this.layers as ImageryLayerCollection;
    layerObject.layer = layers.addImageryProvider(
      provider,
      this.calulateZIndexForLayer(layer)
    );
    this.layerIdToCesiumLayer.set(layer.layerId, layerObject.layer);
    super.addLayer(url, layer);
  }

  getEnabled(layerId: string): boolean | undefined {
    return this.layerIdToCesiumLayer.get(layerId)?.show;
  }

  removeLayer(layerId: string) {
    super.removeLayer(layerId);
    const layer = this.layerIdToCesiumLayer.get(layerId);
    if (layer) {
      this.layers!.remove(layer);
      this.layerIdToCesiumLayer.delete(layerId);
    }
  }

  destroyLayers() {
    this.layers = null;
    this.layerIdToCesiumLayer.clear();
    super.destroyLayers();
  }

  /**
   * Berekent de z-index voor een laag op basis van sortering.
   *
   * @param layer - De Layer waarvoor de index berekend wordt.
   * @returns De index waarop de laag moet worden toegevoegd.
   */
  private calulateZIndexForLayer(layer: LayerConfig): number {
    const sortedLayers = [...this.layerMap.entries()].sort(
      (a, b) => (a[1].zIndex ?? 0) - (b[1].zIndex ?? 0)
    );
    return sortedLayers.findIndex(
      (arrayLayerObject) => arrayLayerObject[0] === layer.layerId
    );
  }
}
