export enum LayerChangedEventTrigger {
  LAYER_ADDED = "layerAdded",
  LAYER_REMOVED = "layerRemoved"
}

export interface CesiumLayerChangedEvent {
  layerId: string;
  eventTrigger: LayerChangedEventTrigger;
}

export interface LayerChangedEvent extends CesiumLayerChangedEvent {
  mapIndex: string;
}
