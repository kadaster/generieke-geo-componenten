import { inject, Injectable } from "@angular/core";
import MapBrowserEvent from "ol/MapBrowserEvent";
import MapEvent from "ol/MapEvent";
import { Observable, ReplaySubject, Subject } from "rxjs";
import { ObservableMapWrapper } from "@kadaster/ggc-models";
import { CoreLoadingService } from "./core-loading.service";

@Injectable({
  providedIn: "root"
})
export class CoreMapEventsService {
  private coreLoadingServiceService = inject(CoreLoadingService);

  private singleclickMap = new ObservableMapWrapper<string, MapBrowserEvent>(
    () => new Subject<MapBrowserEvent>()
  );

  // ReplaySubject for zoomend, because it doesn't have an initial value and emits the last value on subscribing
  private zoomendMap = new ObservableMapWrapper<string, MapEvent>(
    () => new ReplaySubject<MapEvent>(1)
  );

  destroyEventsForMap(mapIndex: string): void {
    this.destroySingleclickForMap(mapIndex);
    this.destroyZoomendForMap(mapIndex);
  }

  // should only be called from map.component.ts
  emitSingleclickEventForMap(evt: MapBrowserEvent, mapIndex: string): void {
    this.singleclickMap.getOrCreateSubject(mapIndex).next(evt);
  }

  getSingleclickObservableForMap(
    mapIndex: string
  ): Observable<MapBrowserEvent> {
    return this.singleclickMap.getOrCreateObservable(mapIndex);
  }

  destroySingleclickForMap(mapIndex: string): void {
    this.singleclickMap.delete(mapIndex);
  }

  // should only be called from map.component.ts
  emitZoomendEventForMap(evt: MapEvent, mapIndex: string): void {
    this.zoomendMap.getOrCreateSubject(mapIndex).next(evt);
  }

  getZoomendObservableForMap(mapIndex: string): Observable<MapEvent> {
    return this.zoomendMap.getOrCreateObservable(mapIndex);
  }

  destroyZoomendForMap(mapIndex: string): void {
    this.zoomendMap.delete(mapIndex);
  }

  getLoadingObservableForMap(mapIndex: string): Observable<boolean> {
    return this.coreLoadingServiceService.isLoading(mapIndex);
  }
}
