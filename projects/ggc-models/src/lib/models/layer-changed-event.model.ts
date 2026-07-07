export enum LayerChangedEventTrigger {
  LAYER_ADDED = "layerAdded",
  LAYER_REMOVED = "layerRemoved",
  LAYER_INITIALIZED = "layerInitialized"
}

export interface CesiumLayerChangedEvent {
  layerId: string;
  eventTrigger: LayerChangedEventTrigger;
}

export interface LayerChangedEvent extends CesiumLayerChangedEvent {
  mapIndex: string;
}
