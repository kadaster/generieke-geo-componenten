import {
  ChangeDetectionStrategy,
  ElementRef,
  AfterViewInit,
  Component,
  inject,
  OnDestroy,
  ViewChild,
  input,
  effect,
  output,
  untracked
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
import { CoreLoadingService } from "./service/core-loading.service";
import { CoreMapEventsService } from "./service/core-map-events.service";
import { CoreMapService } from "./service/core-map.service";
import { Webservice } from "../layer/model/webservice.model";
import { GgcLayerService } from "../service/select/ggc-layer.service";
import {
  DEFAULT_MAPINDEX,
  MapComponentEvent,
  MapComponentEventTypes,
  MapViewState
} from "@kadaster/ggc-models";

/**
 * `<ggc-map></ggc-map>` toont een 2D kaart waar verschillende lagen aan toegevoegd
 * kunnen worden.
 *
 * @remarks
 *
 * Dit component vormt het hart van de GGC kaartarchitectuur en is
 *  verantwoordelijk voor:
 *   - initialisatie en vernietiging van de OpenLayers Map
 *   - koppelen van kaart‑events aan GGC‑events
 *   - laden van webservices en lagen
 *   - selectie, tekenen en loading‑status
 *
 * Let op: om de kaarten te tonen, moet het `ggc-map` element een specifieke
 * hoogte meekrijgen vanuit CSS, zoals in het voorbeeld hieronder.
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
  styleUrls: ["./ggc-map.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GgcMapComponent implements AfterViewInit, OnDestroy {
  /** Unieke naam/index van de kaart (default: DEFAULT_MAPINDEX) */
  mapIndex = input<string>(DEFAULT_MAPINDEX);

  /** tabIndex t.b.v. toetsenbordnavigatie */
  mapTabIndex = input<number | undefined>(undefined);

  /** ARIA role voor accessibility */
  ariaRole = input<string>("application");

  /** ARIA label voor screenreaders (default: "viewer") */
  ariaLabel = input<string>("viewer");

  /**
   * minZoomlevel van de kaart (geldige waarde: 0-25)
   * Waarde wordt geclamped binnen CRS‑limieten (0-25).
   * Wanneer minZoomlevel > maxZoomlevel wordt UNSUCCESSFUL event gestuurd.
   */
  readonly minZoomlevel = input(0, {
    transform: (value: number) => Math.max(0, Math.min(25, value))
  });

  /**
   * Maximum zoomlevel van de kaart (geldige waarde: 1-25)
   * Waarde wordt geclamped binnen CRS‑limieten (1-25).
   * Wanneer minZoomlevel > maxZoomlevel wordt UNSUCCESSFUL event gestuurd.
   */
  readonly maxZoomlevel = input(14, {
    transform: (value: number) =>
      Math.max(1, Math.min(GgcCrsConfigService.MAX_ZOOMLEVEL, value))
  });

  /**
   * Webservices met lagen die op de kaart geladen moeten worden.
   */
  readonly webServices = input<Webservice[]>([]);

  /**
   * Output event‑stream van het kaartcomponent.
   *
   * Emit o.a.:
   * - MAPINITIALIZED
   * - SINGLECLICK
   * - ZOOMEND / ZOOMENDLOCATION
   * - LOADING
   */
  events = output<MapComponentEvent>();

  /** DOM‑element waarin de kaart gerenderd wordt */
  @ViewChild("mapElement", { static: true })
  private readonly mapElement: ElementRef;
  private readonly eventsMap: EventsKey[] = [];
  private lastChangeResolutionEvent: ObjectEvent | undefined;
  private readonly coreMapService = inject(CoreMapService);
  private readonly mapEventsService = inject(CoreMapEventsService);
  private readonly coreLoadingService = inject(CoreLoadingService);
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

  constructor() {
    effect(() => {
      if (this.webServices()?.length) {
        untracked(() => {
          this.ggcLayerService.loadWebservices(
            this.webServices(),
            this.mapIndex()
          );
        });
      }
    });
  }

  /**
   * Initialiseert de kaart nadat de view beschikbaar is.
   *
   * - valideert zoomlevels
   * - creëert de OpenLayers map
   * - koppelt OL‑events aan GGC‑events
   */
  ngAfterViewInit(): void {
    if (this.minZoomlevel() > this.maxZoomlevel()) {
      this.events.emit(
        new MapComponentEvent(
          MapComponentEventTypes.UNSUCCESSFUL,
          this.mapIndex(),
          `Kaart kon niet worden geladen omdat de waarde van minZoomLevel (${this.minZoomlevel()}) ` +
            `hoger is dan die van maxZoomLevel (${this.maxZoomlevel()}).`
        )
      );
    } else {
      const map = this.coreMapService.createAndGetMap(
        this.mapIndex(),
        this.minZoomlevel(),
        this.maxZoomlevel()
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
      console.log("view", view);
      this.eventsMap.push(
        view.on(this.OL_CHANGE_RESOLUTION, this.processEvent.bind(this))
      );
      view.setZoom(3);
      console.log("naar initializeLoader()", this.mapIndex());
      this.initializeLoader();
      this.events.emit(
        new MapComponentEvent(
          MapComponentEventTypes.MAPINITIALIZED,
          this.mapIndex(),
          "Het ggc-map component is geinitialiseerd."
        )
      );
    }
  }

  /**
   * Verwerkt alle OpenLayers events en vertaalt deze
   * naar GGC MapComponent events.
   */
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
            this.mapIndex(),
            "Het zoomen is beeindigd, dit event bevat X en Y en zoomlevel.",
            undefined,
            mapViewState
          )
        );
        if (this.lastChangeResolutionEvent) {
          this.events.emit(
            new MapComponentEvent(
              MapComponentEventTypes.ZOOMEND,
              this.mapIndex(),
              "Het zoomen is beeindigd, dit is het laatste ol.MapEvent.",
              undefined,
              mapEvent
            )
          );
          this.lastChangeResolutionEvent = undefined;
          this.mapEventsService.emitZoomendEventForMap(
            mapEvent as MapEvent,
            this.mapIndex()
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
            this.mapIndex(),
            "Er is een singleClick gegenereerd.",
            undefined,
            mapEvent
          )
        );
        this.mapEventsService.emitSingleclickEventForMap(
          mapEvent as MapBrowserEvent,
          this.mapIndex()
        );
        break;
    }
  }

  /**
   * Haalt huidige kaartpositie en zoomniveau op.
   */
  getLocationFromMapEvent(mapEvent: MapEvent): MapViewState {
    const zoom = mapEvent.map.getView().getZoom() as number;
    const coordinate = mapEvent.map.getView().getCenter() as Coordinate;
    return new MapViewState(coordinate, zoom);
  }

  /**
   * Opruimen van events, subscriptions en map‑resources.
   */
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
    this.coreLoadingService.destroyLoadersForMap(this.mapIndex());
    if (this.coreDrawService) {
      this.coreDrawService.deleteLayers(this.mapIndex());
    }
    // destroying the events
    this.mapEventsService.destroyEventsForMap(this.mapIndex());
    // destroying the map
    this.coreMapService.destroyMap(this.mapIndex());
  }

  /**
   * Initialiseert de loader‑events van de kaart.
   */
  private initializeLoader(): void {
    this.isLoading$ = this.coreLoadingService
      .isLoading(this.mapIndex())
      .subscribe((value) => {
        const message = value
          ? `De kaart is aan het laden`
          : `De kaart is klaar met laden`;
        this.events.emit(
          new MapComponentEvent(
            MapComponentEventTypes.LOADING,
            this.mapIndex(),
            message,
            undefined,
            value
          )
        );
      });
  }
}
