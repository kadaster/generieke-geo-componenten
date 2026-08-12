import { inject, Injectable } from "@angular/core";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import { Observable, ReplaySubject } from "rxjs";
import { SelectOptions } from "../../model/select-options";
import { GgcMapService } from "../../map/service/ggc-map.service";
import { Select } from "ol/interaction";
import { never, singleClick } from "ol/events/condition";
import Layer from "ol/layer/Layer";
import { Collection } from "ol";
import { filter } from "rxjs/operators";
import {
  FeatureCollectionForCoordinate,
  FeatureCollectionForLayer,
  GGC_FEATURE_LAYERID,
  LayerChangedEventTrigger,
  MapComponentEvent,
  MapComponentEventTypes
} from "@kadaster/ggc-models";
import { CoreMapService } from "../../map/service/core-map.service";
import { SelectEvent } from "ol/interaction/Select";
import MapBrowserEvent from "ol/MapBrowserEvent";

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

  private readonly subjectSelectEvents: ReplaySubject<MapComponentEvent> =
    new ReplaySubject<MapComponentEvent>(1);

  private readonly activeSelectInteractions: Map<
    string,
    ActiveSelectInteraction
  > = new Map();
  private readonly activeMapClickEventsKeys: Map<string, any> = new Map();
  private readonly activeSelectEventsKeys: Map<string, any> = new Map();

  private readonly GGC_LAYER_IDS = "ggc-layerIds";
  private readonly GGC_SELECT_MODE = "ggc-select-mode";

  private readonly ggcMapService = inject(GgcMapService);
  private readonly coreMapService = inject(CoreMapService);

  constructor() {
    this.coreMapService.getLayerChangedObservable().subscribe((event) => {
      if (event.eventTrigger === LayerChangedEventTrigger.LAYER_REMOVED) {
        this.clearAllSelectionsForMapIndex(event.mapIndex);
      }
    });
  }

  getObservableForMap(
    mapIndex: string,
    selectIndex?: string
  ): Observable<MapComponentEvent> {
    return this.subjectSelectEvents
      .asObservable()
      .pipe(
        filter(
          (event) =>
            event.mapIndex === mapIndex &&
            (!selectIndex || event.selectIndex === selectIndex)
        )
      );
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
      // Visibility is handled in the selection layer, not the select interaction
      style: null,
      hitTolerance: options.hitTolerance,
      multi: true
    });
    select.set(this.GGC_LAYER_IDS, options.layerIds);
    select.set(this.GGC_SELECT_MODE, options.selectMode ?? "single");

    map.addInteraction(select);
    this.activeSelectInteractions.set(selectIndex, { mapIndex, select });

    this.coreMapService.addSelectLayer(mapIndex, selectIndex);
    this.connectSelectEvents(select, selectIndex, mapIndex);

    if (options.style !== undefined) {
      this.ggcMapService.changeSelectionLayerStyle(
        options.style,
        mapIndex,
        selectIndex
      );
    }
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
    this.ggcMapService.clearSelectionLayer(
      activeSelectInteraction.mapIndex,
      selectIndex
    );
    if (selectIndex) {
      this.coreMapService.removeSelectLayer(
        activeSelectInteraction.mapIndex,
        selectIndex
      );
    }
  }

  clearSelection(mapIndex: string, selectIndex?: string): void {
    const activeSelectInteraction = this.getActiveSelectInteraction(
      selectIndex ?? mapIndex
    );

    if (!activeSelectInteraction) {
      return;
    }

    activeSelectInteraction.select.clearSelection();
    this.ggcMapService.clearSelectionLayer(mapIndex, selectIndex);
    this.ggcMapService.clearHighlightLayer(activeSelectInteraction.mapIndex);

    this.emitEvent(
      new MapComponentEvent(
        MapComponentEventTypes.SELECTIONSERVICE_CLEARSELECTION,
        mapIndex,
        CoreSelectionService.messageClearSelection,
        undefined,
        undefined,
        selectIndex
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

  setSelection(
    features: Feature<Geometry>[],
    selectIndex: string,
    layerId: string
  ) {
    const select = this.getActiveSelectInteraction(selectIndex)?.select;
    if (select) {
      select.clearSelection();
      for (const feature of features) {
        feature.set(GGC_FEATURE_LAYERID, layerId);
        select.getFeatures().push(feature);
      }
      this.emitSelectionUpdatedEvent(selectIndex, select.getFeatures());
    }
  }

  getCurrentSelection(selectIndex: string): Feature[] {
    const select = this.getActiveSelectInteraction(selectIndex)?.select;
    if (select) {
      return select.getFeatures().getArray();
    }
    return [];
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
          string[] | undefined;
        // Only add features that are within the filtered layerIds of the select interaction
        if (!filterLayerIds || filterLayerIds.includes(layerId)) {
          this.handleNewFeaturesForSelection(features, selectIndex, layerId);
        }
      }
    }
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
      if (!layer) {
        // !layer means that either
        // a feature of a WMS or WMTS layer is clicked, which we are handling manually
        // or a feature from the selection layer is clicked, which we can also ignore, as this layer is only for visualization
        return false;
      }

      const layerId = layer.get("ggc-layer-id");
      const getFeatureInfoOnSingleClick = layer.get(
        "ggc-get-feature-info-on-singleclick"
      );

      if (!getFeatureInfoOnSingleClick) {
        return false;
      }

      if (layerId !== undefined) {
        feature.set(GGC_FEATURE_LAYERID, layerId);
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

    const clickEvent = (event: MapBrowserEvent) => {
      this.emitEvent(
        new MapComponentEvent(
          MapComponentEventTypes.SELECTIONSERVICE_MAPCLICKED,
          mapIndex,
          CoreSelectionService.messageMapClicked,
          undefined,
          event.coordinate,
          selectIndex
        )
      );
    };
    map.on("singleclick", clickEvent);
    this.activeMapClickEventsKeys.set(selectIndex, clickEvent);

    const selectionUpdatedEvent = (selectEvent: SelectEvent) => {
      const features =
        this.getActiveSelectInteraction(selectIndex)?.select.getFeatures();

      if (!features) {
        return;
      }

      const clickedCoordinate = selectEvent?.mapBrowserEvent?.coordinate;

      const map = this.ggcMapService.getMap(mapIndex);
      const layers = map.getLayers();
      for (const layer of layers.getArray()) {
        // update the selection visualization on the vector layers
        layer.changed();
      }

      this.updateSelectionLayer(features, mapIndex, selectIndex);
      this.emitSelectionUpdatedEvent(selectIndex, features, clickedCoordinate);
    };

    select.on("select", selectionUpdatedEvent);
    this.activeSelectEventsKeys.set(selectIndex, selectionUpdatedEvent);
  }

  private emitEvent(event: MapComponentEvent): void {
    this.subjectSelectEvents.next(event);
  }

  private emitSelectionUpdatedEvent(
    selectIndex: string,
    features: Collection<Feature>,
    coordinate?: number[]
  ) {
    const mapIndex = this.getMapIndexFromSelectIndex(selectIndex);

    if (!mapIndex) {
      return;
    }

    this.emitEvent(
      new MapComponentEvent(
        MapComponentEventTypes.SELECTIONSERVICE_SELECTIONUPDATED,
        mapIndex,
        CoreSelectionService.messageSelectionUpdated,
        undefined,
        this.buildFeatureCollectionForCoordinateFromFeatures(
          features,
          mapIndex,
          coordinate
        ),
        selectIndex
      )
    );
  }

  private updateSelectionLayer(
    featureCollection: Collection<Feature>,
    mapIndex: string,
    selectIndex: string
  ) {
    this.ggcMapService.clearSelectionLayer(mapIndex, selectIndex);
    this.ggcMapService.addFeaturesToSelectionLayer(
      featureCollection.getArray(),
      mapIndex,
      selectIndex
    );
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

    switch (select.get(this.GGC_SELECT_MODE)) {
      case "multi": {
        this.toggleFeatures(
          features,
          featureCollection,
          mapIndex,
          layerId,
          selectIndex
        );
        break;
      }
      case "single": {
        // Previous features are automatically deselected/removed in the selection interaction, so pushing new features is enough
        this.addFeaturesToCollection(features, featureCollection, layerId);
        break;
      }
      default:
        return;
    }
    this.updateSelectionLayer(featureCollection, mapIndex, selectIndex);
    // Emit event manually, because manual action do not trigger select events automatically
    this.emitSelectionUpdatedEvent(selectIndex, featureCollection);
  }

  private toggleFeatures(
    featuresToToggle: Feature<Geometry>[],
    featureCollection: Collection<Feature<Geometry>>,
    mapIndex: string,
    layerId: string,
    selectIndex?: string
  ) {
    for (const featureToggle of featuresToToggle) {
      if (
        this.ggcMapService.isFeatureInSelectionLayer(
          featureToggle,
          mapIndex,
          selectIndex
        )
      ) {
        /**
         * Manually remove the feature from the collection as it is already in the selection layer yet
         */
        const featureToBeRemoved = this.getEqualFeatureFromCollection(
          featureCollection,
          featureToggle
        );
        if (featureToBeRemoved) {
          featureCollection.remove(featureToBeRemoved);
        }
      } else {
        /**
         * Manually add the feature to the collection as it is not in the selection layer yet
         */
        featureToggle.set(GGC_FEATURE_LAYERID, layerId);
        featureCollection.push(featureToggle);
      }
    }
  }

  private buildFeatureCollectionForCoordinateFromFeatures(
    features: Collection<Feature>,
    mapIndex: string,
    coordinate: number[] | undefined
  ) {
    const layerFeatureMap = this.buildLayerFeatureMap(features);
    const result = new FeatureCollectionForCoordinate(coordinate);

    layerFeatureMap.forEach((features, layerId) => {
      const layerCollection: FeatureCollectionForLayer = {
        layerId,
        layerName: "",
        layerTitle: this.ggcMapService
          .getLayer(layerId, mapIndex)
          ?.get("ggc-title"),
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
      const layerId = feature.get(GGC_FEATURE_LAYERID) ?? "";

      let layerFeatures = layerFeatureMap.get(layerId);
      if (!layerFeatures) {
        layerFeatures = [];
        layerFeatureMap.set(layerId, layerFeatures);
      }
      layerFeatures.push(feature);
    }
    return layerFeatureMap;
  }

  private addFeaturesToCollection(
    newFeatures: Feature<Geometry>[],
    featureCollection: Collection<Feature<Geometry>>,
    layerId: string
  ) {
    for (const feature of newFeatures) {
      feature.set(GGC_FEATURE_LAYERID, layerId);
      featureCollection.push(feature);
    }
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

  private getEqualFeatureFromCollection(
    featureCollection: Collection<Feature>,
    feature: Feature
  ) {
    if (!featureCollection || !feature) {
      return false;
    }

    return featureCollection
      .getArray()
      .find((collectionFeature: Feature) =>
        this.areFeaturesEqual(collectionFeature, feature)
      );
  }

  private areFeaturesEqual(feature1: Feature, feature2: Feature) {
    if (feature1 == feature2) {
      return true;
    }

    if (feature1.getId()) {
      return feature1.getId() === feature2.getId();
    }

    if ((feature1 as any).values_.id) {
      return (feature1 as any).values_.id === (feature2 as any).values_.id;
    }

    if ((feature1 as any).values_.external_fid) {
      return (
        (feature1 as any).values_.external_fid ===
        (feature2 as any).values_.external_fid
      );
    }

    return false;
  }
}
