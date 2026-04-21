import {
  Cartesian3,
  Cesium3DTileset,
  Color,
  Entity,
  GeoJsonDataSource,
  Resource,
  ScreenSpaceEventType
} from "@cesium/engine";
import { DrawingType } from "./enums";
import {
  LegendType,
  Webservice3DType
} from "@kadaster/ggc-models";

export interface Position {
  lat: number;
  lon: number;
  alt?: number;
}

export interface Orientation {
  heading?: number;
  pitch?: number;
  roll?: number;
}

export interface CameraPosition {
  cameraPosition: Position;
  orientation?: Orientation;
}

export interface LookAtPosition {
  lookAtPosition: Position;
  orientation?: Orientation;
  range?: number;
}

export interface LookAtObject {
  geojson: string;
}

export interface CameraValues {
  cameraPosition: Position;
  orientation: Orientation;
  lookAtPosition?: Position;
  range?: number;
}

export type CameraOptions = CameraPosition | LookAtPosition | LookAtObject;

export interface SelectionConfig {
  eventType: ScreenSpaceEventType;
  highlightColor?: Color;
}

export interface SelectionEvent {
  type: ScreenSpaceEventType;
  selectionEventType: SelectionEventType;
  location?: number[] | number[][];
  feature?: any;
  layerName?: string;
}

export enum SelectionEventType {
  SELECTIONSERVICE_SELECTIONUPDATED = "selectionServiceSelectionUpdated",
  SELECTIONSERVICE_SELECTIONCLEARED = "selectionServiceClearedSelection"
}

export interface DrawEvent {
  type: DrawingType;
  location: number[];
  terrainHeight: number | undefined;
}

export interface Webservice {
  type: Webservice3DType;
  url: string;
  layers: LayerConfig[];
  title?: string;
}

export interface LayerConfig {
  layerId: string;
  layerName: string;
  title?: string;
  legendUrl?: string;
  zIndex?: number;
  visible?: boolean;
  url?: string;

  /**
   * De legend die hoort bij deze laag.
   */
  activeLegend?: LegendType;
}

export interface GeoJsonLayerConfig extends LayerConfig {
  /**
   * Optioneel: Een Cesium GeoJsonDataSource. LoadOptions object waarmee default
   * styling kan worden aangepast voor de kaartlaag. Standaard wordt de optie
   * clampToGround op true gezet, maar dit kan weer overschreven worden in de
   * loadOptions. Polygon outlines kunnen niet worden weergegeven op een 3D terrein
   * in Cesium, dus om in de 3D viewer/Cesium geometry outlines te tonen,
   * moet clampToGround op false worden gezet.
   * Zie voor alle mogelijkheden: [LoadOptions](https://cesium.com/learn/cesiumjs/ref-doc/GeoJsonDataSource.html#.LoadOptions)
   */
  loadOptions?: GeoJsonDataSource.LoadOptions;
}

/**
 * Configuratie voor het laden van een 3D-tileset.
 *
 * @example
 * protected tilesetConfigs: TilesetConfig[] = [
 * {
 *     layerName: "Gebouwen",
 *     constructorOptions: {
 *         maximumScreenSpaceError: 8,
 *         dynamicScreenSpaceError: true,
 *         dynamicScreenSpaceErrorFactor: 8,
 *     },
 * }]
 */
export interface TilesetConfig {
  /**
   * Een string met de layer id
   */
  layerId: string;

  /**
   * Optioneel, Een object met opties voor het aanmaken van een 3dTileset in Cesium.
   * Voor alle mogelijkheden van ConstructorOptions zie:[ConstructorOptions](https://cesium.com/learn/cesiumjs/ref-doc/Cesium3DTileset.html#.ConstructorOptions)
   */
  constructorOptions?: Cesium3DTileset.ConstructorOptions;

  /**
   * Optioneel: Een functie die op basis van de huidige cameraValues bepaalt of
   * de 3Dtileset getoond wordt.
   */
  cameraValuesShowFunction?: cameraValuesShowFunction;
}

/**
 * Configuratie voor het laden van GeoJSON-data.
 */
export interface GeoJsonConfig {
  /**
   * Een string met de layer id
   */
  layerId: string;

  /**
   * Optioneel: Een Cesium Resource object voor het ophalen van de GeoJson.
   * Dit kan bijvoorbeeld gebruikt worden wanneer een header meegestuurd moet worden.
   * Zie voor alle mogelijkheden [Resource](https://cesium.com/learn/cesiumjs/ref-doc/Resource.html)
   */
  resource?: Resource;

  /**
   * Optioneel: Een object met de GeoJson features.
   */
  features?: object;

  /**
   * Optioneel: Een functie van het type EntitiesFunction. Deze functie verwacht
   * een Entity als parameter en heeft void als return type. In deze functie kan
   * de styling van een Entity (een GeoJson feature wordt in Cesium als Entity weergegeven)
   * aangepast worden. Hieronder is een voorbeeld gegeven waarbij een ander icoon
   * wordt ingesteld op basis van de waarde van een property van het feature.
   */
  entitiesFunction?: EntitiesFunction;

  /**
   * Optioneel: Een functie van het type EntitiesFunction. Werkt hetzelfde als de
   * entitiesFunction, maar deze styling wordt gebruikt als een entity geselecteerd
   * wordt en dus gehighlight.
   */
  entitiesHighlightFunction?: EntitiesFunction;
}

export type EntitiesFunction = (entity: Entity) => void;

export type cameraValuesShowFunction = (cameraValues: CameraValues) => boolean;

export interface ViewerOptions {
  terrainModelUrl?: string;
  elementId?: string;
  animation?: boolean;
  timeline?: boolean;
  directionalLightOptions?: DirectionalLightOptions;
}

export interface DirectionalLightOptions {
  direction: Cartesian3 | "cameraDirection";
  color?: Color;
  intensity?: number;
}
