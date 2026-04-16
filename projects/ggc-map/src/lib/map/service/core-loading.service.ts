import { Injectable } from "@angular/core";
import { EventsKey } from "ol/events";
import OlMap from "ol/Map";
import { unByKey } from "ol/Observable";
import { BehaviorSubject, Observable } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";
import { ObservableMapWrapper } from "../../core/utils/ObservableMapWrapper";

@Injectable({
  providedIn: "root"
})
export class CoreLoadingService {
  private eventsMap: Map<string, EventsKey[]> = new Map();
  private loadCounter: Map<string, number> = new Map<string, number>();
  private loadStatesMap = new ObservableMapWrapper<string, boolean>(
    () => new BehaviorSubject<boolean>(false)
  );

  addMapLoaders(mapIndex: string, map: OlMap): void {
    const loadstart = map.on("loadstart", () => {
      this.loadStatesMap.getOrCreateSubject(mapIndex).next(true);
    });

    const loadend = map.on("loadend", () => {
      this.loadStatesMap.getOrCreateSubject(mapIndex).next(false);
    });
    this.eventsMap.set(mapIndex, [loadstart, loadend]);
  }

  removeMapLoaders(mapIndex: string): void {
    const events = this.eventsMap.get(mapIndex);
    if (events) {
      events.forEach((key) => unByKey(key));
    }
  }

  destroyLoadersForMap(mapIndex: string): void {
    this.loadCounter.delete(mapIndex);
    this.loadStatesMap.delete(mapIndex);
  }

  isLoading(mapIndex: string): Observable<boolean> {
    return this.loadStatesMap
      .getOrCreateObservable(mapIndex)
      .pipe(distinctUntilChanged());
  }
}
