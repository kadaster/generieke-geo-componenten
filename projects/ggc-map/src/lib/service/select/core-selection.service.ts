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

  private readonly activeMapClickEventsKeys: Map<string, any> = new Map();
  private readonly activeSelectEventsKeys: Map<string, any> = new Map();

  private readonly ggcMapService = inject(GgcMapService);

  getObservableForMap(mapIndex: string): Observable<MapComponentEvent> {
    this.createIfNotExistsSubjectAndObservableForMap(mapIndex);
    return this.observableMap.get(mapIndex) as Observable<MapComponentEvent>;
  }

  startSelect(options: SelectOptions, mapIndex: string) {
    this.stopSelect(mapIndex);

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
      multi: options.selectMode != "single"
    });

    map.addInteraction(select);

    const clickEvent = () => {
      this.emitEvent(
        mapIndex,
        new MapComponentEvent(
          MapComponentEventTypes.SELECTIONSERVICE_MAPCLICKED,
          mapIndex,
          CoreSelectionService.messageMapClicked
        )
      );
    };
    map.on("singleclick", clickEvent);
    this.activeMapClickEventsKeys.set(mapIndex, clickEvent);

    const selectionUpdatedEvent = () => {
      let selectedFeatures: Feature[] = [];
      const select = this.getActiveSelectInteraction(mapIndex);
      if (select) {
        selectedFeatures = select.getFeatures().getArray();
      }
      this.emitEvent(
        mapIndex,
        new MapComponentEvent(
          MapComponentEventTypes.SELECTIONSERVICE_SELECTIONUPDATED,
          mapIndex,
          CoreSelectionService.messageSelectionUpdated,
          undefined,
          selectedFeatures
        )
      );
    };
    select.on("select", selectionUpdatedEvent);
    this.activeSelectEventsKeys.set(mapIndex, selectionUpdatedEvent);
  }

  stopSelect(mapIndex: string) {
    const map = this.ggcMapService.getMap(mapIndex);
    const selectEvent = this.activeSelectEventsKeys.get(mapIndex);
    if (!map) {
      return;
    }
    const select = this.getActiveSelectInteraction(mapIndex);
    if (select) {
      // trigger selection updated
      select.clearSelection();
      map.removeInteraction(select);
      if (selectEvent) {
        select.un("select", selectEvent);
      }
    }

    const mapClickEvent = this.activeMapClickEventsKeys.get(mapIndex);
    if (mapClickEvent) {
      map.un("singleclick", mapClickEvent);
    }
  }

  clearSelection(mapIndex: string): void {
    const select = this.getActiveSelectInteraction(mapIndex);
    if (select) {
      select.clearSelection();
    }

    this.emitEvent(
      mapIndex,
      new MapComponentEvent(
        MapComponentEventTypes.SELECTIONSERVICE_CLEARSELECTION,
        mapIndex,
        CoreSelectionService.messageClearSelection
      )
    );
  }

  setSelection(features: Feature<Geometry>[], mapIndex: string) {
    const select = this.getActiveSelectInteraction(mapIndex);
    if (select) {
      select.clearSelection();
      for (const feature of features) {
        select.selectFeature(feature);
      }
    }
  }

  getCurrentSelection(mapIndex: string): Feature[] {
    const select = this.getActiveSelectInteraction(mapIndex);
    if (select) {
      return select.getFeatures().getArray();
    }
    return [];
  }

  private getActiveSelectInteraction(mapIndex: string): Select | undefined {
    const map = this.ggcMapService.getMap(mapIndex);
    if (!map) {
      return undefined;
    }

    return map
      .getInteractions()
      .getArray()
      .find((interaction) => {
        return interaction instanceof Select;
      });
  }

  private createIfNotExistsSubjectAndObservableForMap(mapIndex: string): void {
    if (!this.subjectMap.has(mapIndex)) {
      this.subjectMap.set(mapIndex, new Subject<MapComponentEvent>());
      this.observableMap.set(
        mapIndex,
        (
          this.subjectMap.get(mapIndex) as Subject<MapComponentEvent>
        ).asObservable()
      );
    }
  }

  private emitEvent(mapIndex: string, event: MapComponentEvent): void {
    this.createIfNotExistsSubjectAndObservableForMap(mapIndex);
    (this.subjectMap.get(mapIndex) as Subject<MapComponentEvent>).next(event);
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
