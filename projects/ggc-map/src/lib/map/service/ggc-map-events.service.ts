import { inject, Injectable } from "@angular/core";
import MapEvent from "ol/MapEvent";
import { Observable } from "rxjs";
import { CoreMapEventsService } from "./core-map-events.service";

@Injectable({
  providedIn: "root"
})
export class GgcMapEventsService {
  private coreMapEventsService = inject(CoreMapEventsService);

  getZoomendObservableForMap(mapName: string): Observable<MapEvent> {
    return this.coreMapEventsService.getZoomendObservableForMap(mapName);
  }
}
