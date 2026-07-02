import { Injectable } from "@angular/core";
import {
  Color,
  DataSource,
  DataSourceCollection,
  Entity,
  GeoJsonDataSource,
  Resource
} from "@cesium/engine";

import { BaseLayerService } from "./base-layer.service";
import { GeoJsonConfig, GeoJsonLayerConfig } from "../model/interfaces";

/**
 * Service voor het laden en beheren van GeoJSON-lagen in Cesium.
 *
 * Deze service gebruikt GeoJsonDataSource om GeoJSON-data te laden
 * en te visualiseren.
 * Configuratie gebeurt via GeoJsonConfig.
 */
@Injectable({
  providedIn: "root"
})
export class GeoJsonLayerService extends BaseLayerService {
  protected layers: DataSourceCollection | null;
  /**
   * This weakMap is needed to keep track of layerIds of Cesium layers, as this
   * information gets lost otherwise
   */
  protected layerIdToCesiumLayer: Map<string, DataSource> = new Map();

  /**
   * Opslag van configuraties voor GeoJSON-lagen.
   * Elke configuratie bevat informatie over de bron, opties en functies voor entiteiten.
   */
  private geoJsonConfigs: GeoJsonConfig[] = [];

  /**
   * Constructor initialiseert de datasources en het serviceschema.
   */
  constructor() {
    super();
    this.layers = new DataSourceCollection();
  }

  public setLayers(collection: DataSourceCollection) {
    this.layers = collection;
  }

  /**
   * Zet de configuraties voor GeoJSON-lagen.
   *
   * @param geojsonConfigs - Een array van GeoJsonConfig.
   */
  setConfigs(geojsonConfigs: GeoJsonConfig[]) {
    this.geoJsonConfigs = geojsonConfigs;
  }

  /**
   * Voegt een GeoJSON-laag toe aan de kaart.
   *
   * @param url - URL of object met GeoJSON-data.
   * @param layer - De Layer die wordt toegevoegd.
   */
  public addLayer(url: string, layer: GeoJsonLayerConfig): void {
    const config = this.geoJsonConfigs?.find((config) => {
      return config.layerId === layer.layerId;
    });
    const loadOptions = {
      stroke: this.toCesiumColor(layer.loadOptions?.stroke),
      strokeWidth: layer.loadOptions?.strokeWidth ?? undefined,
      fill: this.toCesiumColor(layer.loadOptions?.fill),
      clampToGround: layer.loadOptions?.clampToGround ?? false,
      markerSymbol: layer.loadOptions?.markerSymbol,
      markerColor: this.toCesiumColor(layer.loadOptions?.markerColor),
      markerSize: layer.loadOptions?.markerSize ?? undefined
    };

    const data: Resource | string | object =
      config?.resource ?? config?.features ?? url;
    GeoJsonDataSource.load(data, {
      ...loadOptions
    }).then((dataSource) => {
      for (const entity of dataSource.entities.values) {
        //title
        entity.name = layer.title;
        if (config?.entitiesFunction !== undefined) {
          config.entitiesFunction(entity);
        }
      }
      (this.layers as DataSourceCollection).add(dataSource).then((item) => {
        this.layerMap.set(layer.layerId, {
          layer: item as GeoJsonDataSource,
          showFromDataset: true
        });
        this.layerIdToCesiumLayer.set(layer.layerId, item);
        super.addLayer(url, layer);
      });
    });
  }

  getEnabled(layerId: string): boolean | undefined {
    return this.layerIdToCesiumLayer.get(layerId)?.show;
  }

  /**
   * Geeft de naam van de laag terug op basis van een Entity.
   *
   * @param entity - Een Cesium Entity.
   * @returns De id (name in entity van cesium) van de laag of een lege string.
   */
  public getLayerName(entity: Entity | undefined): string {
    return entity?.name ?? "";
  }

  /**
   * Haalt de functie op die entiteiten bewerkt voor een specifieke laag.
   *
   * @param layerId - Id van de laag.
   * @returns Een functie die een Entity bewerkt, of undefined.
   */
  getEntitiesFunction(layerId: string) {
    const config = this.geoJsonConfigs?.find(
      (config) =>
        config.layerId === layerId && config.entitiesFunction !== undefined
    );
    return config?.entitiesFunction;
  }

  /**
   * Haalt de functie op die entiteiten visueel highlight voor een specifieke laag.
   *
   * @param layerId - Id van de laag.
   * @returns Een functie die een Entity highlight, of undefined.
   */
  getEntitiesHighlightFunction(layerId: string) {
    const config = this.geoJsonConfigs?.find(
      (config) =>
        config.layerId === layerId &&
        config.entitiesHighlightFunction !== undefined
    );
    return config?.entitiesHighlightFunction;
  }

  public removeLayer(layerId: string): void {
    super.removeLayer(layerId);
    const layer = this.layerIdToCesiumLayer.get(layerId);
    if (layer) {
      this.layerIdToCesiumLayer.delete(layerId);
      this.layers!.remove(layer);
    }
  }

  /**
   * Verwijdert alle lagen en reset de configuraties.
   */
  destroyLayers() {
    super.destroyLayers();
    this.layerIdToCesiumLayer.clear();
    this.layers = null;
    this.geoJsonConfigs = [];
  }

  private toCesiumColor(value: unknown, fallback?: Color): Color | undefined {
    if (value instanceof Color) return value;
    if (typeof value !== "string") return fallback;
    try {
      return Color.fromCssColorString(value);
    } catch {
      // Ongeldige kleurstring -> val terug op fallback of undefined
      return fallback;
    }
  }
}
