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
import Layer from "ol/layer/Layer";
import { Collection } from "ol";
import { filter } from "rxjs/operators";
import { GgcLayerService } from "./ggc-layer.service";
import {
  FeatureCollectionForCoordinate,
  FeatureCollectionForLayer
} from "./selection-state.model";
import { LayerChangedEventTrigger } from "@kadaster/ggc-models";

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

  private readonly subjectSelectEvents: Subject<MapComponentEvent> =
    new Subject();

  private readonly activeSelectInteractions: Map<
    string,
    ActiveSelectInteraction
  > = new Map();
  private readonly activeMapClickEventsKeys: Map<string, any> = new Map();
  private readonly activeSelectEventsKeys: Map<string, any> = new Map();

  private readonly GGC_FEATURE_LAYERID = "ggc-feature-layerId";
  private readonly GGC_LAYER_IDS = "ggc-layerIds";
  private readonly GGC_SELECT_MODE = "ggc-select-mode";

  private readonly ggcMapService = inject(GgcMapService);
  private readonly ggcLayerService = inject(GgcLayerService);

  constructor() {
    this.ggcLayerService.getLayerChangedObservable().subscribe((event) => {
      if (event.eventTrigger === LayerChangedEventTrigger.LAYER_REMOVED) {
        this.clearAllSelectionsForMapIndex(event.mapIndex);
      }
    });
  }

  getObservableForMap(mapIndex: string): Observable<MapComponentEvent> {
    return this.subjectSelectEvents
      .asObservable()
      .pipe(filter((event) => event.mapIndex === mapIndex));
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

    const filterFunction = this.createSelectionFilterFunction(options.layerIds);

    const select = new Select({
      condition,
      toggleCondition,
      filter: filterFunction,
      style: options.style,
      hitTolerance: options.hitTolerance,
      multi: true
    });
    select.set(this.GGC_LAYER_IDS, options.layerIds);
    select.set(this.GGC_SELECT_MODE, options.selectMode ?? "single");

    map.addInteraction(select);
    this.activeSelectInteractions.set(selectIndex, { mapIndex, select });

    this.connectSelectEvents(select, selectIndex, mapIndex);
    // Make style of the selection layer invisible
    this.ggcMapService.changeSelectionLayerStyle(null, mapIndex);
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
    this.activeSelectInteractions.delete(selectIndex);
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
    this.ggcMapService.clearSelectionLayer(activeSelectInteraction.mapIndex);
  }

  clearSelection(selectIndex: string): void {
    const activeSelectInteraction =
      this.getActiveSelectInteraction(selectIndex);

    if (!activeSelectInteraction) {
      return;
    }

    activeSelectInteraction.select.clearSelection();
    this.ggcMapService.clearSelectionLayer(activeSelectInteraction.mapIndex);

    this.emitEvent(
      new MapComponentEvent(
        MapComponentEventTypes.SELECTIONSERVICE_CLEARSELECTION,
        selectIndex,
        CoreSelectionService.messageClearSelection
      )
    );
  }

  /**
   * Verwijdert alle selecties voor alle actieve select interactions
   * die gekoppeld zijn aan de opgegeven mapIndex.
   *
   * @param mapIndex De kaartindex waarvoor alle selecties worden gewist.
   */
  clearAllSelectionsForMapIndex(mapIndex: string): void {
    const selectIndices = this.getAllActiveSelectIndicesOnMapIndex(mapIndex);

    for (const selectIndex of selectIndices) {
      this.clearSelection(selectIndex);
    }
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
    return this.activeSelectInteractions.get(selectIndex);
  }

  /**
   * Maakt een filterfunctie voor de OpenLayers Select‑interaction.
   *
   * De filter:
   * - controleert of de feature afkomstig is van een geldige layer
   * - accepteert alle layers indien `layerIds` undefined is
   * - voegt altijd de property `layer_id` toe aan de feature
   *
   * De `layer_id` wordt gelezen uit de layer property `ggc-layer-id`.
   *
   * @param layerIds Optionele lijst met toegestane layer‑IDs
   * @returns Filterfunctie voor Select‑interaction
   */
  private createSelectionFilterFunction(
    layerIds: string[] | undefined
  ): (feature: Feature<Geometry>, layer?: Layer) => boolean {
    return (feature: Feature<Geometry>, layer?: Layer): boolean => {
      console.log("filter", feature, layer);

      if (!layer) {
        // When an active WMS/WMTS feature is clicked, layer is undefined
        // To trigger this feature, true should be returned
        return true;
      }

      const layerId = layer.get("ggc-layer-id");

      if (layerId !== undefined) {
        feature.set(this.GGC_FEATURE_LAYERID, layerId);
      }

      if (!layerIds || layerIds.length === 0) {
        return true;
      }

      return layerIds.includes(layerId);
    };
  }

  private connectSelectEvents(
    select: Select,
    selectIndex: string,
    mapIndex: string
  ) {
    const map = this.ggcMapService.getMap(mapIndex);

    if (!map) {
      return;
    }

    const clickEvent = () => {
      this.emitEvent(
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
      const features =
        this.getActiveSelectInteraction(selectIndex)?.select.getFeatures();

      if (!features) {
        return;
      }

      const map = this.ggcMapService.getMap(mapIndex);
      const layers = map.getLayers();
      for (const layer of layers.getArray()) {
        layer.changed();
      }

      this.emitSelectionUpdatedEvent(selectIndex, features);
    };

    select.on("select", selectionUpdatedEvent);
    this.activeSelectEventsKeys.set(selectIndex, selectionUpdatedEvent);
  }

  private emitEvent(event: MapComponentEvent): void {
    this.subjectSelectEvents.next(event);
  }

  private emitSelectionUpdatedEvent(
    selectIndex: string,
    features: Collection<Feature>
  ) {
    const mapIndex = this.getMapIndexFromSelectIndex(selectIndex);

    if (!mapIndex) {
      return;
    }

    this.emitEvent(
      new MapComponentEvent(
        MapComponentEventTypes.SELECTIONSERVICE_SELECTIONUPDATED,
        selectIndex,
        CoreSelectionService.messageSelectionUpdated,
        undefined,
        this.buildFeatureCollectionForCoordinateFromFeatures(features, mapIndex)
      )
    );
  }

  handleFeatureInfoForLayer(
    mapIndex: string,
    features: Feature<Geometry>[],
    layerId: string
  ): void {
    const relevantSelectIndices =
      this.getAllActiveSelectIndicesOnMapIndex(mapIndex);
    for (const selectIndex of relevantSelectIndices) {
      const select = this.getActiveSelectInteraction(selectIndex)?.select;
      if (select) {
        const filterLayerIds = select.get(this.GGC_LAYER_IDS) as
          | string[]
          | undefined;
        // Only add features that are within the filtered layerIds of the select interaction
        if (!filterLayerIds || filterLayerIds.includes(layerId)) {
          this.handleNewFeaturesForSelection(features, selectIndex, layerId);
        }
      }
    }
  }

  private handleNewFeaturesForSelection(
    features: Feature<Geometry>[],
    selectIndex: string,
    layerId: string
  ) {
    const activeSelectInteraction =
      this.getActiveSelectInteraction(selectIndex);
    if (!activeSelectInteraction) {
      return;
    }

    const select = activeSelectInteraction.select;
    const mapIndex = activeSelectInteraction.mapIndex;
    const featureCollection = select.getFeatures();
    let isManualActionPerformed = false;

    console.log("intern", featureCollection);

    switch (select.get(this.GGC_SELECT_MODE)) {
      case "multi": {
        isManualActionPerformed =
          isManualActionPerformed ||
          this.toggleFeatures(features, featureCollection, mapIndex, layerId);
        break;
      }
      case "single": {
        isManualActionPerformed =
          isManualActionPerformed ||
          this.replaceFeatures(features, featureCollection, layerId);
        break;
      }
      default:
        return;
    }
    this.ggcMapService.clearSelectionLayer(mapIndex);
    this.ggcMapService.addFeaturesToSelectionLayer(
      featureCollection.getArray(),
      mapIndex
    );
    if (isManualActionPerformed) {
      // Emit event manually, because manual action do not trigger select events automatically
      this.emitSelectionUpdatedEvent(selectIndex, featureCollection);
    }
  }

  private toggleFeatures(
    featuresToToggle: Feature<Geometry>[],
    featureCollection: Collection<Feature<Geometry>>,
    mapIndex: string,
    layerId: string
  ) {
    let isManualActionPerformed = false;
    for (const featureToggle of featuresToToggle) {
      if (
        !this.ggcMapService.isFeatureInSelectionLayer(featureToggle, mapIndex)
      ) {
        /**
         * If a feature is inside the selection layer, it means that it is already selected.
         * The select interaction toggles the feature in this case automatically.
         * If a feature is not inside the selection layer, it should be manually added to the feature collection first.
         */
        featureToggle.set(this.GGC_FEATURE_LAYERID, layerId);
        featureCollection.push(featureToggle);
        isManualActionPerformed = true;
      }
    }
    return isManualActionPerformed;
  }

  private buildFeatureCollectionForCoordinateFromFeatures(
    features: Collection<Feature>,
    mapIndex: string
  ) {
    const layerFeatureMap = this.buildLayerFeatureMap(features);
    const result = new FeatureCollectionForCoordinate();

    layerFeatureMap.forEach((features, layerId) => {
      const layerCollection: FeatureCollectionForLayer = {
        layerId,
        layerName: "",
        layerTitle: this.ggcLayerService.getTitle(layerId, mapIndex),
        features
      };

      result.featureCollectionForLayers.push(layerCollection);
    });

    return result;
  }

  /**
   * Build a layerId to features mapping
   * @param features
   * @private
   */
  private buildLayerFeatureMap(
    features: Collection<Feature>
  ): Map<string, Feature<Geometry>[]> {
    const layerFeatureMap = new Map<string, Feature<Geometry>[]>();
    for (const feature of features.getArray()) {
      const layerId = feature.get(this.GGC_FEATURE_LAYERID);

      if (!layerId) {
        continue;
      }

      let layerFeatures = layerFeatureMap.get(layerId);
      if (!layerFeatures) {
        layerFeatures = [];
        layerFeatureMap.set(layerId, layerFeatures);
      }
      layerFeatures.push(feature);
    }
    return layerFeatureMap;
  }

  private replaceFeatures(
    newFeatures: Feature<Geometry>[],
    featureCollection: Collection<Feature<Geometry>>,
    layerId: string
  ) {
    let manualActionPerformed = false;
    for (const feature of newFeatures) {
      feature.set(this.GGC_FEATURE_LAYERID, layerId);
      featureCollection.push(feature);
      manualActionPerformed = true;
    }
    return manualActionPerformed;
  }

  private getMapIndexFromSelectIndex(selectindex: string): string | undefined {
    return this.activeSelectInteractions.get(selectindex)?.mapIndex;
  }

  private getAllActiveSelectIndicesOnMapIndex(mapIndex: string): string[] {
    const result: string[] = [];
    this.activeSelectInteractions.forEach((selectInteraction, selectIndex) => {
      if (selectInteraction.mapIndex === mapIndex) {
        result.push(selectIndex);
      }
    });
    return result;
  }
}
