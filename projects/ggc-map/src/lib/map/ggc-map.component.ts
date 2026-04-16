import type { ElementRef } from "@angular/core";
import {
  AfterViewInit,
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  Output,
  ViewChild
} from "@angular/core";
import { Coordinate } from "ol/coordinate";
import { EventsKey } from "ol/events";
import MapBrowserEvent from "ol/MapBrowserEvent";
import { Types as MapBrowserEventTypes } from "ol/MapBrowserEventType";
import MapEvent from "ol/MapEvent";
import { Types as MapEventTypes } from "ol/MapEventType";
import { ObjectEvent } from "ol/Object";
import { unByKey } from "ol/Observable";
import RenderEvent from "ol/render/Event";
import { MapRenderEventTypes } from "ol/render/EventType";
import { ViewObjectEventTypes } from "ol/View";
import { Subscription } from "rxjs";
import { GgcCrsConfigService } from "../core/service/ggc-crs-config.service";
import { CoreDrawService } from "../drawing/service/core-draw.service";
import {
  MapComponentEvent,
  MapComponentEventTypes,
  MapViewState
} from "../model/map-component-event.model";
import { CoreSelectionService } from "../service/select/core-selection.service";
import { CoreLoadingService } from "./service/core-loading.service";
import { CoreMapEventsService } from "./service/core-map-events.service";
import { CoreMapService } from "./service/core-map.service";
import { Webservice } from "../layer/model/webservice.model";
import { GgcLayerService } from "../service/select/ggc-layer.service";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";

/**
 * `<ggc-map></ggc-map>` toont een 2D kaart waar verschillende lagen aan toegevoegd kunnen worden.
 *
 * Let op: om de kaarten te tonen, moet het `ggc-map` element een specifieke hoogte meekrijgen vanuit CSS, zoals in het voorbeeld hieronder.
 *
 * @example
 * kaartConfig = [
 *     {
 *       url: "https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0?",
 *       type: "wmts",
 *       layers: [
 *         {
 *           layerId: "brtAchtergrondkaartStandaard",
 *           title: "BRT achtergrond kaart Standaard (WMTS)",
 *           layerName: "standaard",
 *           visible: true,
 *           zIndex: 0
 *         }
 *       ]
 *     }
 * ];
 *
 * <div style="height: 500px">
 *   <ggc-map [webServices]="kaartConfig"></ggc-map>
 * </div>
 */
@Component({
  selector: "ggc-map",
  templateUrl: "./ggc-map.component.html",
  styleUrls: ["./ggc-map.component.scss"]
})
export class GgcMapComponent implements AfterViewInit, OnDestroy {
  /** Naam van de kaart waarop getekend wordt. */
  @Input() mapIndex: string = DEFAULT_MAPINDEX;

  /** tabIndex van de kaart kan aangepast worden t.b.v. toetsenbordbesturing */
  @Input() mapTabIndex: number | undefined = undefined;

  /** ariaRole van de kaart */
  @Input() ariaRole = "application";

  /** ariaLabel van de kaart */
  @Input() ariaLabel = "viewer";

  @Output() events: EventEmitter<MapComponentEvent> =
    new EventEmitter<MapComponentEvent>();

  @ViewChild("mapElement", { static: true })
  private readonly mapElement: ElementRef;
  private readonly eventsMap: EventsKey[] = [];
  private _minZoomlevel = 0;
  private _maxZoomlevel = 14;
  private lastChangeResolutionEvent: ObjectEvent | undefined;
  private readonly coreMapService = inject(CoreMapService);
  private readonly mapEventsService = inject(CoreMapEventsService);
  private readonly coreLoadingService = inject(CoreLoadingService);
  private readonly coreSelectionService = inject(CoreSelectionService);
  private readonly coreDrawService = inject(CoreDrawService, {
    optional: true
  });
  private readonly ggcLayerService = inject(GgcLayerService);
  // ol event type name
  private readonly OL_MOVEEND: MapEventTypes = "moveend";
  private readonly OL_SINGLECLICK: MapBrowserEventTypes = "singleclick";
  private readonly OL_CHANGE_RESOLUTION: ViewObjectEventTypes =
    "change:resolution";
  private readonly OL_PRECOMPOSE: MapRenderEventTypes = "precompose";
  private readonly OL_RENDERCOMPLETE: MapRenderEventTypes = "rendercomplete";
  private isLoading$: Subscription;
  private _webServices: Webservice[];

  /** Lijst van webservices die lagen bevatten voor de kaart. */
  @Input()
  set webServices(webservices: Webservice[]) {
    this._webServices = webservices;
    this.loadWebservices();
  }

  /** minZoomlevel van de kaart */
  @Input()
  set minZoomlevel(value: number) {
    this._minZoomlevel = Math.max(
      0,
      Math.min(GgcCrsConfigService.MAX_ZOOMLEVEL, value)
    );
  }

  get minZoomlevel(): number {
    return this._minZoomlevel;
  }

  /** maxZoomlevel van de kaart */
  @Input()
  set maxZoomlevel(value: number) {
    this._maxZoomlevel = Math.max(
      1,
      Math.min(GgcCrsConfigService.MAX_ZOOMLEVEL, value)
    );
  }

  get maxZoomlevel(): number {
    return this._maxZoomlevel;
  }

  ngAfterViewInit(): void {
    if (this._minZoomlevel > this._maxZoomlevel) {
      this.events.emit(
        new MapComponentEvent(
          MapComponentEventTypes.UNSUCCESSFUL,
          this.mapIndex,
          `Kaart kon niet worden geladen omdat de waarde van minZoomLevel (${this._minZoomlevel}) ` +
            `hoger is dan die van maxZoomLevel (${this._maxZoomlevel}).`
        )
      );
    } else {
      const map = this.coreMapService.createAndGetMap(
        this.mapIndex,
        this._minZoomlevel,
        this._maxZoomlevel
      );
      map.setTarget(this.mapElement.nativeElement.id);

      this.eventsMap.push(
        map.on(this.OL_PRECOMPOSE, this.processEvent.bind(this)),
        map.on(this.OL_RENDERCOMPLETE, this.processEvent.bind(this)),
        map.on(this.OL_SINGLECLICK, this.processEvent.bind(this)),
        map.on(this.OL_MOVEEND, this.processEvent.bind(this))
      );
      // event on the view of this map.
      const view = map.getView();
      this.eventsMap.push(
        view.on(this.OL_CHANGE_RESOLUTION, this.processEvent.bind(this))
      );
      view.setZoom(3);

      this.initializeLoader();
      this.events.emit(
        new MapComponentEvent(
          MapComponentEventTypes.MAPINITIALIZED,
          this.mapIndex,
          "Het ggc-map component is geinitialiseerd."
        )
      );
    }
  }

  processEvent(mapEvent: MapEvent | RenderEvent | ObjectEvent) {
    switch (mapEvent.type) {
      case this.OL_CHANGE_RESOLUTION:
        this.lastChangeResolutionEvent = mapEvent as ObjectEvent;
        break;
      case this.OL_MOVEEND: {
        const mapViewState = this.getLocationFromMapEvent(mapEvent as MapEvent);
        this.events.emit(
          new MapComponentEvent(
            MapComponentEventTypes.ZOOMENDLOCATION,
            this.mapIndex,
            "Het zoomen is beeindigd, dit event bevat X en Y en zoomlevel.",
            undefined,
            mapViewState
          )
        );
        if (this.lastChangeResolutionEvent) {
          this.events.emit(
            new MapComponentEvent(
              MapComponentEventTypes.ZOOMEND,
              this.mapIndex,
              "Het zoomen is beeindigd, dit is het laatste ol.MapEvent.",
              undefined,
              mapEvent
            )
          );
          this.lastChangeResolutionEvent = undefined;
          this.mapEventsService.emitZoomendEventForMap(
            mapEvent as MapEvent,
            this.mapIndex
          );
        }
        break;
      }
      case this.OL_SINGLECLICK:
        // order of events is important, because the singleclick event should be emitted before
        // getFeatureInfo events on the ggc-layer componenten are emitted!
        // First emit MapComponent singleclick event and send singleclick event to the CoreSelectionService
        // then, send singleclick event on MapEventsService, because the ggc-layer componenten are subscribed to the mapEventsService
        this.events.emit(
          new MapComponentEvent(
            MapComponentEventTypes.SINGLECLICK,
            this.mapIndex,
            "Er is een singleClick gegenereerd.",
            undefined,
            mapEvent
          )
        );
        this.coreSelectionService.handleSingleclickEventForMap(
          (mapEvent as MapBrowserEvent).coordinate,
          this.mapIndex
        );
        this.mapEventsService.emitSingleclickEventForMap(
          mapEvent as MapBrowserEvent,
          this.mapIndex
        );
        break;
    }
  }

  private loadWebservices() {
    if (this._webServices) {
      this.ggcLayerService.loadWebservices(this._webServices, this.mapIndex);
    }
  }

  getLocationFromMapEvent(mapEvent: MapEvent): MapViewState {
    const zoom = mapEvent.map.getView().getZoom() as number;
    const coordinate = mapEvent.map.getView().getCenter() as Coordinate;
    return new MapViewState(coordinate, zoom);
  }

  ngOnDestroy() {
    // Unsubscribe from Observable by key
    while (this.eventsMap.length > 0) {
      unByKey(this.eventsMap.pop() as EventsKey);
    }

    if (this.isLoading$) {
      this.isLoading$.unsubscribe();
    }

    /* destroying the olMap, optional drawInteraction and selectionService. Destroying the OlMap itself last to prevent issues during
    destruction of the other parts */
    this.coreLoadingService.destroyLoadersForMap(this.mapIndex);
    if (this.coreDrawService) {
      this.coreDrawService.deleteLayers(this.mapIndex);
    }
    this.coreSelectionService.destroySelectionForMap(this.mapIndex);
    // destroying the events
    this.mapEventsService.destroyEventsForMap(this.mapIndex);
    // destroying the map
    this.coreMapService.destroyMap(this.mapIndex);
  }

  private initializeLoader(): void {
    this.isLoading$ = this.coreLoadingService
      .isLoading(this.mapIndex)
      .subscribe((value) => {
        const message = value
          ? `De kaart is aan het laden`
          : `De kaart is klaar met laden`;
        this.events.emit(
          new MapComponentEvent(
            MapComponentEventTypes.LOADING,
            this.mapIndex,
            message,
            undefined,
            value
          )
        );
      });
  }
}
