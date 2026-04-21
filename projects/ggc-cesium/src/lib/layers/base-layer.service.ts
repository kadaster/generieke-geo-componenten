import { Injectable } from "@angular/core";
import { LayerObject } from "../model/core-interfaces";
import { Observable, Subject } from "rxjs";
import {
  CesiumLayerChangedEvent,
  LayerChangedEventTrigger
} from "@kadaster/ggc-models";
import { LayerConfig } from "../model/interfaces";

@Injectable({
  providedIn: "root"
})
export abstract class BaseLayerService {
  protected layerMap: Map<string, LayerObject> = new Map<string, LayerObject>();
  protected layerChangedSubject: Subject<CesiumLayerChangedEvent> =
    new Subject();

  getLayerChangedObservable(): Observable<CesiumLayerChangedEvent> {
    return this.layerChangedSubject.asObservable();
  }

  addLayer(url: string, layer: LayerConfig): void {
    this.layerChangedSubject.next({
      layerId: layer.layerId,
      eventTrigger: LayerChangedEventTrigger.LAYER_ADDED
    });
  }

  isVisible(layerId: string): boolean {
    return this.layerMap.has(layerId);
  }

  abstract getEnabled(_layerId: string): boolean | undefined;

  removeLayer(layerId: string): void {
    this.layerMap.delete(layerId);
    this.layerChangedSubject.next({
      layerId: layerId,
      eventTrigger: LayerChangedEventTrigger.LAYER_REMOVED
    });
  }

  destroyLayers() {
    this.layerMap.clear();
  }
}
