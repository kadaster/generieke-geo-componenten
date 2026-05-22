import { inject, Injectable } from "@angular/core";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import { Observable, Subject } from "rxjs";
import {
  MapComponentEvent,
  MapComponentEventTypes
} from "../../model/map-component-event.model";
import { SelectOptions } from "../../model/select-options";
import { GgcMapService } from "../../map/service/ggc-map.service";
import { Select } from "ol/interaction";
import { never, singleClick } from "ol/events/condition";
import { Coordinate } from "ol/coordinate";
import Layer from "ol/layer/Layer";

/**
 * Interne representatie van een actieve select‑interactie.
 * Bevat zowel de kaartindex als de bijbehorende OpenLayers Select‑interaction.
 */
interface ActiveSelectInteraction {
  /**
   * De kaartindex waarvoor deze select‑interactie actief is.
   */
  readonly mapIndex: string;

  /**
   * De OpenLayers Select‑interaction.
   */
  readonly select: Select;
}

@Injectable({
  providedIn: "root"
})
export class CoreSelectionService {
  static readonly messageClearSelection = "Selectie is gewist";
  static readonly messageMapClicked =
    "Er is geklikt in de kaart en de feature info wordt opgehaald.";
  static readonly messageSelectionUpdated =
    "Nieuwe feature info van een kaartlaag toegevoegd aan de selectie.";
  static readonly messageCoordinateDoesNotMatch =
    "Er is iets mis gegaan in de CoreSelectionService: het coordinaat van de kaartlaag komt" +
    " niet overeen met het verwachte coordinaat van het klik-event in de kaart.";

  private readonly subjectMap: Map<string, Subject<MapComponentEvent>> =
    new Map();
  private readonly observableMap: Map<string, Observable<MapComponentEvent>> =
    new Map();

  private readonly activeSelectInteraction: Map<
    string,
    ActiveSelectInteraction
  > = new Map();
  private readonly activeMapClickEventsKeys: Map<string, any> = new Map();
  private readonly activeSelectEventsKeys: Map<string, any> = new Map();

  private readonly ggcMapService = inject(GgcMapService);

  getObservableForMap(mapIndex: string): Observable<MapComponentEvent> {
    this.createIfNotExistsSubjectAndObservableForMap(mapIndex);
    return this.observableMap.get(mapIndex) as Observable<MapComponentEvent>;
  }

  startSelect(
    options: SelectOptions,
    mapIndex: string,
    selectIndex: string | undefined
  ) {
    selectIndex = selectIndex ?? mapIndex;
    this.stopSelect(selectIndex);

    const map = this.ggcMapService.getMap(mapIndex);

    let condition;
    let toggleCondition;

    switch (options.selectMode) {
      case "multi":
        condition = options.condition ?? singleClick;
        toggleCondition = options.condition ?? singleClick;
        break;
      case "openlayersDefault":
        break;
      case "single":
      default:
        condition = options.condition ?? singleClick;
        toggleCondition = never;
        break;
    }

    let layerFilters;
    if (options.layerIds) {
      layerFilters = [];
      for (const layerId of options.layerIds) {
        const layer = this.ggcMapService.getLayer(layerId, mapIndex);
        if (layer) {
          layerFilters.push(layer as Layer);
        }
      }
    }

    const select = new Select({
      condition,
      toggleCondition,
      layers: layerFilters,
      style: options.style,
      filter: options.filter,
      hitTolerance: options.hitTolerance,
      multi: options.selectMode != "single"
    });

    map.addInteraction(select);
    this.activeSelectInteraction.set(selectIndex, { mapIndex, select });

    const clickEvent = () => {
      this.emitEvent(
        selectIndex,
        new MapComponentEvent(
          MapComponentEventTypes.SELECTIONSERVICE_MAPCLICKED,
          mapIndex,
          CoreSelectionService.messageMapClicked
        )
      );
    };
    map.on("singleclick", clickEvent);
    this.activeMapClickEventsKeys.set(selectIndex, clickEvent);

    const selectionUpdatedEvent = () => {
      let selectedFeatures: Feature[] = [];
      const select = this.getActiveSelectInteraction(selectIndex)?.select;
      if (select) {
        selectedFeatures = select.getFeatures().getArray();
      }
      this.emitEvent(
        selectIndex,
        new MapComponentEvent(
          MapComponentEventTypes.SELECTIONSERVICE_SELECTIONUPDATED,
          selectIndex,
          CoreSelectionService.messageSelectionUpdated,
          undefined,
          selectedFeatures
        )
      );
    };
    select.on("select", selectionUpdatedEvent);
    this.activeSelectEventsKeys.set(selectIndex, selectionUpdatedEvent);
  }

  stopSelect(selectIndex: string) {
    const activeSelectInteraction =
      this.getActiveSelectInteraction(selectIndex);
    if (!activeSelectInteraction) {
      return;
    }

    const map = this.ggcMapService.getMap(activeSelectInteraction.mapIndex);
    if (!map) {
      return;
    }

    const select = activeSelectInteraction.select;
    // trigger selection updated
    select.clearSelection();
    map.removeInteraction(select);
    this.activeSelectInteraction.delete(selectIndex);
    const selectEvent = this.activeSelectEventsKeys.get(selectIndex);
    if (selectEvent) {
      select.un("select", selectEvent);
    }
    this.activeSelectEventsKeys.delete(selectIndex);

    const mapClickEvent = this.activeMapClickEventsKeys.get(selectIndex);
    if (mapClickEvent) {
      map.un("singleclick", mapClickEvent);
    }
    this.activeMapClickEventsKeys.delete(selectIndex);
  }

  clearSelection(selectIndex: string): void {
    const select = this.getActiveSelectInteraction(selectIndex)?.select;
    if (select) {
      select.clearSelection();
    }

    this.emitEvent(
      selectIndex,
      new MapComponentEvent(
        MapComponentEventTypes.SELECTIONSERVICE_CLEARSELECTION,
        selectIndex,
        CoreSelectionService.messageClearSelection
      )
    );
  }

  setSelection(features: Feature<Geometry>[], selectIndex: string) {
    const select = this.getActiveSelectInteraction(selectIndex)?.select;
    if (select) {
      select.clearSelection();
      for (const feature of features) {
        select.selectFeature(feature);
      }
    }
  }

  getCurrentSelection(selectIndex: string): Feature[] {
    const select = this.getActiveSelectInteraction(selectIndex)?.select;
    if (select) {
      return select.getFeatures().getArray();
    }
    return [];
  }

  private getActiveSelectInteraction(
    selectIndex: string
  ): ActiveSelectInteraction | undefined {
    return this.activeSelectInteraction.get(selectIndex);
  }

  private createIfNotExistsSubjectAndObservableForMap(
    selectIndex: string
  ): void {
    if (!this.subjectMap.has(selectIndex)) {
      this.subjectMap.set(selectIndex, new Subject<MapComponentEvent>());
      this.observableMap.set(
        selectIndex,
        (
          this.subjectMap.get(selectIndex) as Subject<MapComponentEvent>
        ).asObservable()
      );
    }
  }

  private emitEvent(selectIndex: string, event: MapComponentEvent): void {
    this.createIfNotExistsSubjectAndObservableForMap(selectIndex);
    (this.subjectMap.get(selectIndex) as Subject<MapComponentEvent>).next(
      event
    );
  }

  handleFeatureInfoForLayer(
    mapIndex: string,
    coordinate: Coordinate,
    features: Feature<Geometry>[],
    layerName: string
  ): void {
    // Verplaats dit naar feature-info service
  }
}
