import { Component, inject, Input, OnDestroy, OnInit } from "@angular/core";
import OlMap from "ol/Map";
import { Subscription } from "rxjs";
import { CoreMapEventsService } from "../map/service/core-map-events.service";
import { CoreMapService } from "../map/service/core-map.service";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";

@Component({
  selector: "ggc-zoom-level",
  templateUrl: "./ggc-zoom-level.component.html",
  imports: []
})
export class GgcZoomLevelComponent implements OnInit, OnDestroy {
  @Input() mapIndex: string = DEFAULT_MAPINDEX;
  protected zoomLevel: number | undefined;
  private map: OlMap;
  private zoomendSubscription: Subscription;
  private readonly coreMapService = inject(CoreMapService);
  private readonly mapEventsService = inject(CoreMapEventsService);

  ngOnInit() {
    this.map = this.coreMapService.getMap(this.mapIndex);
    const zoomendObservable = this.mapEventsService.getZoomendObservableForMap(
      this.mapIndex
    );
    this.zoomendSubscription = zoomendObservable.subscribe(() => {
      this.getZoomLevel();
    });
  }

  private getZoomLevel(): void {
    const zoomLevel = this.map.getView().getZoom();
    if (zoomLevel) {
      this.zoomLevel = Math.round(zoomLevel * 100) / 100;
    } else {
      this.zoomLevel = undefined;
    }
  }

  ngOnDestroy(): void {
    if (this.zoomendSubscription) {
      this.zoomendSubscription.unsubscribe();
    }
  }
}
