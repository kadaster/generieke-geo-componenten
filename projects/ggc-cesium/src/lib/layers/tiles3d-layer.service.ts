import { inject, Injectable } from "@angular/core";
import {
  Cesium3DTileFeature,
  Cesium3DTileset,
  Primitive,
  PrimitiveCollection
} from "@cesium/engine";
import { BaseLayerService } from "./base-layer.service";
import {
  cameraValuesShowFunction,
  LayerConfig,
  TilesetConfig
} from "../model/interfaces";
import { map, Subscription } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";
import { CoreCameraService } from "../service/core-camera.service";
import { LayerChangedEventTrigger } from "@kadaster/ggc-models";

/**
 * Service voor het beheren van 3D Tiles lagen in Cesium.
 *
 * Deze service maakt gebruik van Cesium3DTileset en PrimitiveCollection
 * om lagen dynamisch toe te voegen en te beheren op basis van camera-instellingen.
 */
@Injectable({
  providedIn: "root"
})
export class Tiles3dLayerService extends BaseLayerService {
  protected layers: PrimitiveCollection | null;
  /**
   * This weakMap is needed to keep track of layerIds of Cesium layers, as this
   * information gets lost otherwise
   */
  protected layerIdToCesiumLayer: Map<string, Primitive> = new Map();
  private tilesetConfigs: TilesetConfig[] = [];
  private readonly cameraSubscriptions: Map<string, Subscription> = new Map();

  private readonly cameraService = inject(CoreCameraService);

  constructor() {
    super();
    this.layers = new PrimitiveCollection();
  }

  public setLayers(collection: PrimitiveCollection) {
    this.layers = collection;
  }

  /**
   * Stelt de configuraties in voor de tilesets en activeert camera-subscripties indien nodig.
   *
   * @param tilesetConfigs - Array van TilesetConfig objecten.
   */
  setConfigs(tilesetConfigs: TilesetConfig[]) {
    this.tilesetConfigs = tilesetConfigs;
  }

  /**
   * Voegt een nieuwe 3D tileset-laag toe aan de viewer.
   *
   * @param url - De URL van de tileset.
   * @param layer - De Layer configuratie.
   */
  public addLayer(url: string, layer: LayerConfig): void {
    if (!this.layerMap.has(layer.layerId)) {
      this.layerMap.set(layer.layerId, {});
    }
    const layerObject = this.layerMap.get(layer.layerId)!;
    if (!layerObject?.layerLoading) {
      layerObject.layerLoading = true;
      const config = this.tilesetConfigs?.find((config) => {
        return config.layerId === layer.layerId;
      });
      this.createTileset(url, config?.constructorOptions)
        .then((tileset) => {
          const layerObject = this.layerMap.get(layer.layerId)!;
          layerObject.layerLoading = undefined;
          layerObject.layer = tileset;
          if (layerObject.showFromDataset === undefined) {
            layerObject.showFromDataset = true;
          }
          const newLayer = (this.layers as PrimitiveCollection).add(tileset);
          this.layerIdToCesiumLayer.set(layer.layerId, newLayer);
          if (config?.cameraValuesShowFunction) {
            this.subscribeToFunction(
              layer.layerId,
              config?.cameraValuesShowFunction
            );
          }
        })
        .catch((error) => {
          console.log(
            "Fout bij het laden van tileset van layer met id:" +
              layer.layerId +
              " en url: " +
              url +
              ". Error: " +
              error
          );
        });
    }
    super.addLayer(url, layer);
  }

  getEnabled(layerId: string): boolean | undefined {
    return this.layerIdToCesiumLayer.get(layerId)?.show;
  }

  /**
   * Haalt de naam van de laag op die hoort bij een Cesium3DTileFeature.
   *
   * @param feature - Een Cesium3DTileFeature object.
   * @returns De naam van de laag als string.
   */
  public getLayerName(feature: Cesium3DTileFeature | undefined): string {
    if (feature == undefined || feature.tileset === undefined) {
      return "";
    }
    const tilesets = Array.from(this.layerMap.entries()).find((entry) => {
      const path1 = (entry[1].layer as Cesium3DTileset).resource.request.url;
      const path2 = feature.tileset.resource.request.url;
      return path1 === path2;
    });
    if (tilesets && tilesets.length > 0) {
      return tilesets[0];
    } else {
      return "";
    }
  }

  public removeLayer(layerId: string): void {
    super.removeLayer(layerId);
    const layer = this.layerIdToCesiumLayer.get(layerId);
    if (layer) {
      this.layers!.remove(layer);
      this.layerIdToCesiumLayer.delete(layerId);
    }
    this.cameraSubscriptions.get(layerId)?.unsubscribe();
    this.cameraSubscriptions.delete(layerId);
  }

  /**
   * Verwijdert alle lagen ruimt subscripties en configuraties op.
   */
  destroyLayers() {
    super.destroyLayers();
    this.layers = null;
    this.tilesetConfigs = [];
    this.layerIdToCesiumLayer.clear();
    this.cameraSubscriptions.forEach((sub) => sub.unsubscribe());
    this.cameraSubscriptions.clear();
  }

  /**
   * Abonneert op camera-waardes en togglet de zichtbaarheid van lagen op basis van een callback.
   *
   * @param layerId - Naam van de laag.
   * @param callbackFunction - cameraValuesShowFunctiom die bepaalt of de laag zichtbaar moet zijn.
   */
  private subscribeToFunction(
    layerId: string,
    callbackFunction: cameraValuesShowFunction
  ) {
    const subscription = this.cameraService
      .getCameraValuesObservable()
      .pipe(
        map((cameraValues) => {
          return callbackFunction(cameraValues);
        }),
        distinctUntilChanged()
      )
      .subscribe((result) => {
        const layer = this.layerIdToCesiumLayer.get(layerId);
        if (layer) {
          layer.show = result;
          const eventTrigger = result
            ? LayerChangedEventTrigger.LAYER_ADDED
            : LayerChangedEventTrigger.LAYER_REMOVED;
          this.layerChangedSubject.next({ layerId, eventTrigger });
        }
      });
    this.cameraSubscriptions.set(layerId, subscription);
  }

  /**
   * Maakt een nieuwe Cesium3DTileset op basis van een URL en constructor-opties.
   *
   * @param url - De URL van de tileset.
   * @param constructorOptions - Optionele Cesium3DTileset.ConstructorOptions.
   * @returns Een Promise met de geladen Cesium3DTileset.
   */
  private createTileset(
    url: string,
    constructorOptions: Cesium3DTileset.ConstructorOptions = {}
  ): Promise<Cesium3DTileset> {
    return Cesium3DTileset.fromUrl(url, constructorOptions);
  }
}
