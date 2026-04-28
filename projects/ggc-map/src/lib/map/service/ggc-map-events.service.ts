import { inject, Injectable } from "@angular/core";
import MapEvent from "ol/MapEvent";
import { Observable } from "rxjs";
import { CoreMapEventsService } from "./core-map-events.service";

/**
 * Service die kaartgerelateerde OpenLayers-events exposeert
 * via observables.
 *
 * Deze service fungeert als façade over {@link CoreMapEventsService}
 * en biedt een vereenvoudigde API voor het luisteren naar
 * kaartinteracties.
 */

@Injectable({
  providedIn: "root"
})
export class GgcMapEventsService {
  private coreMapEventsService = inject(CoreMapEventsService);

  /**
   * Returned een observable die emit zodra een zoomactie
   * op de opgegeven kaart is beëindigd.
   *
   * @param mapName Index van de kaart
   * @returns Observable met {@link MapEvent} bij het einde van een zoomactie
   */
  getZoomendObservableForMap(mapName: string): Observable<MapEvent> {
    return this.coreMapEventsService.getZoomendObservableForMap(mapName);
  }
}
