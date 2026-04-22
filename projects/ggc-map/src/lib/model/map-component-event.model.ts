import { Coordinate } from "ol/coordinate";

/**
 * Mogelijke types voor kaartevents.
 *
 * Deze enum wordt gebruikt in {@link MapComponentEvent} om het type
 * gebeurtenis eenduidig te identificeren, zoals zoomacties,
 * klikinteracties en selection-updates.
 */
export enum MapComponentEventTypes {
  /** Kaart is succesvol geïnitialiseerd */
  MAPINITIALIZED = "mapInitialized",
  /** Zoomactie is beëindigd */
  ZOOMEND = "zoomEnd",
  /** Zoomactie naar een specifieke locatie is beëindigd */
  ZOOMENDLOCATION = "zoomEndLocation",
  /** Enkelvoudige klik op de kaart */
  SINGLECLICK = "singleClick",
  /** WMS capabilities zijn opgehaald */
  WMSCAPABILITIES = "WmsCapabilities",
  /** WMS feature-informatie is opgehaald */
  WMSFEATUREINFO = "WmsFeatureInfo",
  /** WMTS capabilities zijn opgehaald */
  WMTSCAPABILITES = "WmtsCapabilites",
  /** WMTS feature-informatie is opgehaald*/
  WMTSFEATUREINFO = "WmtsFeatureInfo",
  /** feature-informatie van een vector laag is opgehaald*/
  VECTORFEATUREINFO = "vectorFeatureInfo",
  /** feature-informatie van een GeoJson vector laag is opgehaald*/
  GEOJSONFEATUREINFO = "geoJsonFeatureInfo",
  /** Actie is succesvol uitgevoerd */
  SUCCESSFUL = "successful",
  /** Actie is niet succesvol uitgevoerd */
  UNSUCCESSFUL = "unsuccessful",
  /** Kaart of laag is aan het laden */
  LOADING = "loading",
  /** Kaartklik afkomstig van de selection service */
  SELECTIONSERVICE_MAPCLICKED = "selectionServiceMapClicked",
  /** Selection service heeft de selectie gewist */
  SELECTIONSERVICE_CLEARSELECTION = "selectionServiceClearSelection",
  /** Selection service heeft een nieuwe selectie gezet */
  SELECTIONSERVICE_SELECTIONUPDATED = "selectionServiceSelectionUpdated"
}

/**
 * Standaard event-object voor communicatie vanuit kaartcomponenten
 * en kaartservices.
 *
 * Wordt gebruikt om kaartinteracties, statusupdates en resultaten
 * eenduidig door te geven aan afnemende componenten.
 */
export class MapComponentEvent {
  /**
   * Maakt een nieuw MapComponentEvent aan.
   *
   * @param type Type van het event (zie MapComponentEventTypes)
   * @param mapIndex Index of naam van de kaart waarop het event betrekking heeft
   * @param message Beschrijvende tekst van het event (het zoomen is beeindingd, ...)
   * @param layerName (optioneel) Naam van de laag die het event heeft veroorzaakt
   * @param value (optioneel) het oorspronkelijke event indien aanwezig
   */
  constructor(
    public type: MapComponentEventTypes,
    public mapIndex: string,
    public message: string,
    public layerName?: string,
    public value?: any
  ) {}
}

/**
 * Beschrijft de huidige status van een kaartview.
 *
 * Wordt gebruikt om de centrering en het zoomniveau van een kaart
 * vast te leggen of te herstellen.
 */
export class MapViewState {
  constructor(
    public center: Coordinate,
    public zoom: number
  ) {}
}
