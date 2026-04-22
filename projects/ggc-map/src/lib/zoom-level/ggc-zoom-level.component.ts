import { Component, inject, Input, OnDestroy, OnInit } from "@angular/core";
import OlMap from "ol/Map";
import { Subscription } from "rxjs";
import { CoreMapEventsService } from "../map/service/core-map-events.service";
import { CoreMapService } from "../map/service/core-map.service";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";

/**
 * Component dat het actuele zoomniveau van een OpenLayers‑kaart weergeeft.
 *
 * Het zoomniveau wordt bijgewerkt bij ieder`zoomend`‑event van
 * de gekoppelde kaart en afgerond op twee decimalen.
 */
@Component({
  selector: "ggc-zoom-level",
  templateUrl: "./ggc-zoom-level.component.html",
  imports: []
})
export class GgcZoomLevelComponent implements OnInit, OnDestroy {
  /**
   * Index van de kaart waarvan het zoomniveau
   * wordt weergegeven.
   */
  @Input() mapIndex: string = DEFAULT_MAPINDEX;
  protected zoomLevel: number | undefined;
  private map: OlMap;
  private zoomendSubscription: Subscription;
  private readonly coreMapService = inject(CoreMapService);
  private readonly mapEventsService = inject(CoreMapEventsService);

  /**
   * Initialiseert het component:
   * - haalt de kaart op aan de hand van de mapIndex
   * - abonneert zich op zoom-events
   * - werkt het zoomniveau bij bij iedere zoomwijziging
   */
  ngOnInit() {
    this.map = this.coreMapService.getMap(this.mapIndex);
    const zoomendObservable = this.mapEventsService.getZoomendObservableForMap(
      this.mapIndex
    );
    this.zoomendSubscription = zoomendObservable.subscribe(() => {
      this.getZoomLevel();
    });
  }

  /**
   * Leest het huidige zoomniveau uit de kaart
   * en rondt dit af op twee decimalen.
   */
  private getZoomLevel(): void {
    const zoomLevel = this.map.getView().getZoom();
    if (zoomLevel) {
      this.zoomLevel = Math.round(zoomLevel * 100) / 100;
    } else {
      this.zoomLevel = undefined;
    }
  }

  /**
   * Ruimt resources op door de subscription
   * op het zoom-event te beëindigen.
   */
  ngOnDestroy(): void {
    if (this.zoomendSubscription) {
      this.zoomendSubscription.unsubscribe();
    }
  }
}
