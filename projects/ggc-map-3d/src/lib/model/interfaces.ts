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
import { LegendType, Webservice3DType } from "@kadaster/ggc-models";

/**
 * Een geografische positie in latitude, longitude en optioneel altitude.
 */
export interface Position {
  /**
   * Latitude in graden.
   */
  lat: number;

  /**
   * Longitude in graden.
   */
  lon: number;

  /**
   * Optionele hoogte (in meters).
   */
  alt?: number;
}

/**
 * Oriëntatie van de camera.
 */
export interface Orientation {
  /**
   * Richting (heading) in graden.
   */
  heading?: number;

  /**
   * Kanteling (pitch) in graden.
   */
  pitch?: number;

  /**
   * Rotatie (roll) in graden.
   */
  roll?: number;
}

/**
 * Configuratie voor het direct positioneren van de camera.
 */
export interface CameraPosition {
  /**
   * De positie waar de camera naartoe vliegt.
   */
  cameraPosition: Position;

  /**
   * Optionele oriëntatie van de camera.
   */
  orientation?: Orientation;
}

/**
 * Configuratie waarbij de camera naar een specifieke positie kijkt.
 */

export interface LookAtPosition {
  /**
   * De positie waarnaar gekeken wordt.
   */
  lookAtPosition: Position;

  /**
   * Optionele oriëntatie van de camera.
   */
  orientation?: Orientation;

  /**
   * Afstand van de camera tot de positie.
   */
  range?: number;
}

/**
 * Configuratie waarbij de camera gericht wordt op een GeoJSON object.
 */
export interface LookAtObject {
  /**
   * GeoJSON string waarop gefocust wordt.
   */
  geojson: string;
}

/**
 * De actuele camerawaarden.
 */
export interface CameraValues {
  /**
   * Huidige camera positie.
   */
  cameraPosition: Position;

  /**
   * Huidige oriëntatie.
   */
  orientation: Orientation;

  /**
   * Optionele positie waarnaar wordt gekeken.
   */
  lookAtPosition?: Position;

  /**
   * Optionele afstand tot target.
   */
  range?: number;
}

/**
 * Gecombineerd type voor alle mogelijke camera configuraties.
 */

export type CameraOptions = CameraPosition | LookAtPosition | LookAtObject;

/**
 * Configuratie voor selectiegedrag binnen de viewer.
 */
export interface SelectionConfig {
  /**
   * Type interactie event (bijv. click).
   */
  eventType: ScreenSpaceEventType;

  /**
   * Kleur voor highlight van selectie.
   */
  highlightColor?: Color;

  /**
   * Index voor selectiecontext om zo onderscheid te maken tussen meerder selecties op de 3D kaart.
   */
  selectIndex?: string;
}

/**
 * Event dat wordt geëmit bij selectie-interacties.
 */
export interface SelectionEvent {
  /**
   * Type input event.
   */
  type: ScreenSpaceEventType;

  /**
   * Type selectie-event.
   */
  selectionEventType: SelectionEventType;

  /**
   * Locatie van selectie (coördinaten).
   */
  location?: number[] | number[][];

  /**
   * Feature die geselecteerd is.
   */
  feature?: any;

  /**
   * Naam van de bijbehorende laag.
   */
  layerName?: string;

  /**
   * Selectie index van de selectie indien opgegeven.
   */
  selectIndex?: string;
}

/**
 * Mogelijke selectie-event types.
 */
export enum SelectionEventType {
  SELECTIONSERVICE_SELECTIONUPDATED = "selectionServiceSelectionUpdated",
  SELECTIONSERVICE_SELECTIONCLEARED = "selectionServiceClearedSelection"
}

/**
 * Event dat ontstaat bij tekenen op de kaart.
 */
export interface DrawEvent {
  /**
   * Type tekenactie.
   */
  type: DrawingType;

  /**
   * Coördinaten van getekend object.
   */
  location: number[];

  /**
   * Hoogte op terrein (indien beschikbaar).
   */
  terrainHeight: number | undefined;
}

/**
 * Configuratie voor een 3D webservice.
 */
export interface Webservice {
  /**
   * Type webservice.
   */
  type: Webservice3DType;

  /**
   * URL van de service.
   */
  url: string;

  /**
   * Lagen binnen de service.
   */
  layers: LayerConfig[];

  /**
   * Optionele titel van de service. Kan worden gebruikt binnen de legenda
   */
  title?: string;
}

/**
 * Basisconfiguratie voor een laag.
 */
export interface LayerConfig {
  /**
   * Unieke laag identifier.
   */
  layerId: string;

  /**
   * Naam van de laag.
   */
  layerName: string;

  /**
   * Optionele titel die wordt gebruikt in de weergave binnen de dataset-tree of legenda.
   */
  title?: string;

  /**
   * URL naar legenda.
   */
  legendUrl?: string;

  /**
   * Z-index voor render volgorde.
   */
  zIndex?: number;

  /**
   * Bepaalt of laag zichtbaar is.
   */
  visible?: boolean;

  /**
   * Url met de data voor de laag.
   */
  url?: string;

  /**
   * De legend die hoort bij deze laag.
   */
  activeLegend?: LegendType;
}

/**
 * Configuratie voor een GeoJSON laag.
 */
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
   * aangepast worden.
   */
  entitiesFunction?: EntitiesFunction;

  /**
   * Optioneel: Een functie van het type EntitiesFunction. Werkt hetzelfde als de
   * entitiesFunction, maar deze styling wordt gebruikt als een entity geselecteerd
   * wordt en dus gehighlight.
   */
  entitiesHighlightFunction?: EntitiesFunction;
}

/**
 * Functie type voor het aanpassen van een {@link Entity}, bijvoorbeeld de style veranderen of een SVG koppelen.
 *
 * @param entity De entity die aangepast moet worden
 */
export type EntitiesFunction = (entity: Entity) => void;

/**
 * Functie die bepaalt of een laag zichtbaar is afhankelijk van camerawaarden.
 *
 * @param cameraValues Huidige {@link CameraValues}
 * @returns `true` indien zichtbaar
 */
export type cameraValuesShowFunction = (cameraValues: CameraValues) => boolean;

/**
 * Configuratie voor de Cesium viewer.
 */
export interface ViewerOptions {
  /**
   * URL naar terrain model.
   */
  terrainModelUrl?: string;

  /**
   * ID van het HTML element waarin de viewer wordt geladen.
   */
  elementId?: string;

  /**
   * Toon animatie controls.
   */
  animation?: boolean;

  /**
   * Toon timeline.
   */
  timeline?: boolean;

  /**
   * Opties voor directional lighting.
   */
  directionalLightOptions?: DirectionalLightOptions;
}

/**
 * Configuratie voor directional lighting in de scene.
 */
export interface DirectionalLightOptions {
  /**
   * Richting van het licht of "cameraDirection".
   */
  direction: Cartesian3 | "cameraDirection";

  /**
   * Kleur van het licht.
   */
  color?: Color;

  /**
   * Intensiteit van het licht.
   */
  intensity?: number;
}
