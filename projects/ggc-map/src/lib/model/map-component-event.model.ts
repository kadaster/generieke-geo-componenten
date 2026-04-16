import { Coordinate } from "ol/coordinate";

export enum MapComponentEventTypes {
  MAPINITIALIZED = "mapInitialized",
  ZOOMEND = "zoomEnd",
  ZOOMENDLOCATION = "zoomEndLocation",
  SINGLECLICK = "singleClick",
  WMSCAPABILITIES = "WmsCapabilities",
  WMSFEATUREINFO = "WmsFeatureInfo",
  WMTSCAPABILITES = "WmtsCapabilites",
  WMTSFEATUREINFO = "WmtsFeatureInfo",
  VECTORFEATUREINFO = "vectorFeatureInfo",
  GEOJSONFEATUREINFO = "geoJsonFeatureInfo",
  SUCCESSFUL = "successful",
  UNSUCCESSFUL = "unsuccessful",
  LOADING = "loading",
  SELECTIONSERVICE_MAPCLICKED = "selectionServiceMapClicked",
  SELECTIONSERVICE_CLEARSELECTION = "selectionServiceClearSelection",
  SELECTIONSERVICE_SELECTIONUPDATED = "selectionServiceSelectionUpdated"
}

export class MapComponentEvent {
  // type: MapComponentEventTypes; // singleClick, zoomEnd, ...
  // mapIndex: string; // naam van de map
  // layerName: string // naam van de layer, alleen wanneer het event door een ggc-layer component wordt gegooid
  // message: string; // de gebruiker heeft op een button geklikt, het zoomen is beeindingd, ...
  // value?: any; // optioneel, het oorspronkelijke event indien aanwezig
  constructor(
    public type: MapComponentEventTypes,
    public mapIndex: string,
    public message: string,
    public layerName?: string,
    public value?: any
  ) {}
}

export class MapViewState {
  constructor(
    public center: Coordinate,
    public zoom: number
  ) {}
}
