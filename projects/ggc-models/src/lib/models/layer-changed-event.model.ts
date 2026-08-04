/**
 * The different event types when a layer is changed
 */
export enum LayerChangedEventTrigger {
  // Triggered when a layer is (re-)added to the map.
  LAYER_ADDED = "layerAdded",
  // Triggered when a layer is removed from the map.
  LAYER_REMOVED = "layerRemoved",
  // Is thrown when the layer configuration is read
  LAYER_INITIALIZED = "layerInitialized",
  // Is thrown if the features inside the geojson layer are loaded
  LAYER_LOADED = "layerLoaded"
}

export interface CesiumLayerChangedEvent {
  layerId: string;
  eventTrigger: LayerChangedEventTrigger;
}

export interface LayerChangedEvent extends CesiumLayerChangedEvent {
  mapIndex: string;
}
