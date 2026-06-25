import { Injectable } from "@angular/core";
import { LayerObject } from "../model/core-interfaces";
import { Observable, Subject } from "rxjs";
import {
  CesiumLayerChangedEvent,
  LayerChangedEventTrigger
} from "@kadaster/ggc-models";
import { LayerConfig } from "../model/interfaces";

/**
 * Abstracte basisservice voor het beheren van lagen binnen de Cesium viewer.
 *
 * Deze service:
 * - Houdt een interne mapping bij van actieve lagen;
 * - Emit events wanneer lagen worden toegevoegd of verwijderd;
 * - Definieert een basiscontract voor concrete layer services;
 * - Wordt uitgebreid door specifieke implementaties (bijv. WMTS, GeoJSON, 3D tiles).
 *
 * Concrete implementaties dienen minimaal {@link getEnabled} te implementeren.
 */
@Injectable({
  providedIn: "root"
})
export abstract class BaseLayerService {
  protected layerMap: Map<string, LayerObject> = new Map<string, LayerObject>();
  protected layerChangedSubject: Subject<CesiumLayerChangedEvent> =
    new Subject();

  /**
   * Geeft een observable die layer change events emit.
   *
   * @returns Observable met {@link CesiumLayerChangedEvent}
   */
  getLayerChangedObservable(): Observable<CesiumLayerChangedEvent> {
    return this.layerChangedSubject.asObservable();
  }

  /**
   * Wordt aangeroepen wanneer een laag wordt toegevoegd.
   *
   * Deze methode emit een event, maar het daadwerkelijke toevoegen
   * van de laag gebeurt in concrete implementaties.
   *
   * @param url URL van de laagbron
   * @param layer Configuratie van de laag ({@link LayerConfig})
   */
  addLayer(url: string, layer: LayerConfig): void {
    this.layerChangedSubject.next({
      layerId: layer.layerId,
      eventTrigger: LayerChangedEventTrigger.LAYER_ADDED
    });
  }

  /**
   * Controleert of een laag zichtbaar (actief) is.
   *
   * @param layerId ID van de laag
   * @returns `true` indien aanwezig in de interne map
   */
  isVisible(layerId: string): boolean {
    return this.layerMap.has(layerId);
  }

  /**
   * Geeft aan of een laag enabled is.
   *
   * @param _layerId ID van de laag
   * @returns Boolean of undefined indien onbekend
   */
  abstract getEnabled(_layerId: string): boolean | undefined;

  /**
   * Verwijdert een laag uit de interne map en emit een event.
   *
   * @param layerId ID van de laag
   */
  removeLayer(layerId: string): void {
    this.layerMap.delete(layerId);
    this.layerChangedSubject.next({
      layerId: layerId,
      eventTrigger: LayerChangedEventTrigger.LAYER_REMOVED
    });
  }

  /**
   * Verwijdert alle lagen uit de interne map.
   *
   * Wordt typisch gebruikt bij cleanup van de viewer.
   */
  destroyLayers() {
    this.layerMap.clear();
  }
}
