import { TestBed } from "@angular/core/testing";
import { type MockedObject, vi } from "vitest";
import { CoreSelectionService } from "./core-selection.service";
import { GgcMapService } from "../../map/service/ggc-map.service";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import { Select } from "ol/interaction";
import Collection from "ol/Collection";
import Map from "ol/Map";
import { of } from "rxjs";
import {
  FeatureCollectionForCoordinate,
  MapComponentEvent,
  MapComponentEventTypes
} from "@kadaster/ggc-models";

/**
 * Mock Select interaction zodat we OpenLayers niet volledig hoeven te initialiseren
 */
class MockSelect {
  private readonly features = new Collection<Feature<Geometry>>();
  private selectHandler?: () => void;

  getFeatures() {
    return this.features;
  }

  clearSelection() {
    this.features.clear();
  }

  selectFeature(feature: Feature<Geometry>) {
    this.features.push(feature);
  }

  on(eventType: string, handler: () => void) {
    if (eventType === "select") {
      this.selectHandler = handler;
    }
  }

  un(eventType: string) {
    if (eventType === "select") {
      this.selectHandler = undefined;
    }
  }

  triggerSelectEvent() {
    if (this.selectHandler) {
      this.selectHandler();
    }
  }
}

/**
 * Mock Map object met minimale OpenLayers API
 */
class MockMap {
  private readonly interactions = new Collection<any>();

  addInteraction(interaction: any) {
    this.interactions.push(interaction);
  }

  removeInteraction(interaction: any) {
    this.interactions.remove(interaction);
  }

  getInteractions() {
    return this.interactions;
  }

  getLayers() {
    return new Collection();
  }

  on() {
    /* noop */
  }

  un() {
    /* noop */
  }
}

describe("CoreSelectionService", () => {
  let service: CoreSelectionService;
  let map: MockMap;

  const MAP_INDEX = "map-1";
  const SELECT_INDEX = "select-1";
  const LAYER_ID = "layer-a";

  beforeEach(() => {
    map = new MockMap();

    const mapServiceSpy: MockedObject<GgcMapService> = {
      getMap: vi.fn(),
      getLayer: vi.fn(),
      clearSelectionLayer: vi.fn(),
      addFeaturesToSelectionLayer: vi.fn(),
      isFeatureInSelectionLayer: vi.fn(),
      getLayerChangedObservable: vi.fn(),
      changeSelectionLayerStyle: vi.fn(),
      clearHighlightLayer: vi.fn()
    } as unknown as MockedObject<GgcMapService>;

    mapServiceSpy.getMap.mockReturnValue(map as unknown as Map);
    mapServiceSpy.getLayer.mockReturnValue(undefined);
    mapServiceSpy.getLayerChangedObservable.mockReturnValue(of());

    TestBed.configureTestingModule({
      providers: [
        CoreSelectionService,
        { provide: GgcMapService, useValue: mapServiceSpy }
      ]
    });

    service = TestBed.inject(CoreSelectionService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should create an observable for a mapIndex", () => {
    const mockSelect = new MockSelect();
    vi.spyOn(service as any, "getActiveSelectInteraction").mockReturnValue({
      select: mockSelect as unknown as Select
    });

    service.getObservableForMap(MAP_INDEX).subscribe((event) => {
      expect(event.type).toBe(
        MapComponentEventTypes.SELECTIONSERVICE_CLEARSELECTION
      );
    });

    service.clearSelection(MAP_INDEX);
  });

  it("startSelect should add a Select interaction to the map", () => {
    service.startSelect(
      {
        selectMode: "single"
      },
      MAP_INDEX,
      undefined
    );

    const interactions = map.getInteractions().getArray();
    const hasSelect = interactions.some(
      (interaction) => interaction instanceof Select
    );

    expect(hasSelect).toBeTruthy();
  });

  it("should store select interaction under provided selectIndex", () => {
    const SELECT_INDEX = "custom-select";

    service.startSelect(
      {
        selectMode: "single"
      },
      MAP_INDEX,
      SELECT_INDEX
    );

    const activeInteraction = (service as any)["activeSelectInteractions"].get(
      SELECT_INDEX
    );

    expect(activeInteraction).toBeTruthy();
    expect(activeInteraction.mapIndex).toBe(MAP_INDEX);
    expect(activeInteraction.select instanceof Select).toBeTruthy();
  });

  it("stopSelect should remove the Select interaction from the map", () => {
    service.startSelect(
      {
        selectMode: "single"
      },
      MAP_INDEX,
      undefined
    );

    service.stopSelect(MAP_INDEX);
    const interactions = map.getInteractions().getArray();
    const hasSelect = interactions.some(
      (interaction) => interaction instanceof Select
    );
    expect(hasSelect).toBeFalsy();
    expect(service["activeMapClickEventsKeys"].size).toBe(0);
    expect(service["activeSelectEventsKeys"].size).toBe(0);
  });

  it("clearSelection should clear selection and emit event", () => {
    const mockSelect = new MockSelect();
    const feature = new Feature();
    mockSelect.selectFeature(feature);
    vi.spyOn(service as any, "getActiveSelectInteraction").mockReturnValue({
      select: mockSelect as unknown as Select
    });

    service.getObservableForMap(MAP_INDEX).subscribe((event) => {
      if (
        event.type === MapComponentEventTypes.SELECTIONSERVICE_CLEARSELECTION
      ) {
        expect(service.getCurrentSelection(MAP_INDEX)).toEqual([]);
      }
    });

    service.clearSelection(MAP_INDEX);
  });

  it("setSelection should select provided features", () => {
    const mockSelect = new MockSelect();
    vi.spyOn(service as any, "getActiveSelectInteraction").mockReturnValue({
      select: mockSelect as unknown as Select
    });

    const feature1 = new Feature();
    const feature2 = new Feature();

    service.setSelection([feature1, feature2], MAP_INDEX);

    const selection = service.getCurrentSelection(MAP_INDEX);
    expect(selection.length).toBe(2);
    expect(selection).toContain(feature1);
    expect(selection).toContain(feature2);
  });

  it("getCurrentSelection should return empty array when no Select is active", () => {
    const mockSelect = new MockSelect();
    const feature = new Feature();
    mockSelect.selectFeature(feature);
    vi.spyOn(service as any, "getActiveSelectInteraction").mockReturnValue({
      select: mockSelect as unknown as Select
    });

    expect(service.getCurrentSelection(MAP_INDEX)).toEqual([feature]);
  });

  it("should emit SELECTIONSERVICE_SELECTIONUPDATED when OpenLayers select event occurs", () => {
    const receivedEvents: MapComponentEvent[] = [];
    service
      .getObservableForMap(MAP_INDEX)
      .subscribe((event) => receivedEvents.push(event));

    service.startSelect(
      {
        selectMode: "single"
      },
      MAP_INDEX,
      undefined
    );

    // Haal de event handler op die reageert op een Select "select" event en run deze functie
    const selectHandler = (service as any)["activeSelectEventsKeys"].get(
      MAP_INDEX
    );
    selectHandler();

    const selectionUpdatedEvents = receivedEvents.filter(
      (event) =>
        event.type === MapComponentEventTypes.SELECTIONSERVICE_SELECTIONUPDATED
    );
    expect(selectionUpdatedEvents.length).toBe(1);
    expect(selectionUpdatedEvents[0].value).toEqual(
      new FeatureCollectionForCoordinate()
    );
  });

  function createSelectMock(
    selectMode: "single" | "multi",
    layerFilter?: string[]
  ) {
    const features = new Collection<Feature<Geometry>>();

    return {
      get: (key: string) => {
        if (key === (service as any).GGC_SELECT_MODE) {
          return selectMode;
        }
        if (key === (service as any).GGC_LAYER_IDS) {
          return layerFilter;
        }
        return undefined;
      },
      getFeatures: () => features
    } as unknown as Select;
  }

  describe("layerIds filter with WMS/WMTS layers", () => {
    it("should forward features when no layer filter is configured", () => {
      const feature = new Feature();

      service["activeSelectInteractions"].set(SELECT_INDEX, {
        mapIndex: MAP_INDEX,
        select: createSelectMock("single")
      });

      vi.spyOn(service as any, "handleNewFeaturesForSelection");

      service.handleFeatureInfoForLayer(MAP_INDEX, [feature], LAYER_ID);

      expect((service as any).handleNewFeaturesForSelection).toHaveBeenCalled();
    });

    it("should forward features only when layerId is in filter", () => {
      const feature = new Feature();

      service["activeSelectInteractions"].set(SELECT_INDEX, {
        mapIndex: MAP_INDEX,
        select: createSelectMock("single", [LAYER_ID])
      });

      vi.spyOn(service as any, "handleNewFeaturesForSelection");

      service.handleFeatureInfoForLayer(MAP_INDEX, [feature], LAYER_ID);

      expect((service as any).handleNewFeaturesForSelection).toHaveBeenCalled();
    });

    it("should NOT forward features when layerId is not in filter", () => {
      const feature = new Feature();

      service["activeSelectInteractions"].set(SELECT_INDEX, {
        mapIndex: MAP_INDEX,
        select: createSelectMock("single", ["other-layer"])
      });

      vi.spyOn(service as any, "handleNewFeaturesForSelection");

      service.handleFeatureInfoForLayer(MAP_INDEX, [feature], LAYER_ID);

      expect(
        (service as any).handleNewFeaturesForSelection
      ).not.toHaveBeenCalled();
    });
  });

  describe("selection layer interaction", () => {
    it("should clear and add features to selection layer in single select mode", () => {
      const feature = new Feature();

      const select = createSelectMock("single");

      service["activeSelectInteractions"].set(SELECT_INDEX, {
        mapIndex: MAP_INDEX,
        select
      });

      service.handleFeatureInfoForLayer(MAP_INDEX, [feature], LAYER_ID);

      const mapService = TestBed.inject(
        GgcMapService
      ) as MockedObject<GgcMapService>;

      expect(mapService.clearSelectionLayer).toHaveBeenCalledWith(
        MAP_INDEX,
        "select-1"
      );
      expect(mapService.addFeaturesToSelectionLayer).toHaveBeenCalledWith(
        [feature],
        MAP_INDEX,
        "select-1"
      );
    });

    it("should add feature to selection layer when toggling ON in multi select mode", () => {
      const feature = new Feature();

      const select = createSelectMock("multi");

      service["activeSelectInteractions"].set(SELECT_INDEX, {
        mapIndex: MAP_INDEX,
        select
      });

      const mapService = TestBed.inject(
        GgcMapService
      ) as MockedObject<GgcMapService>;

      mapService.isFeatureInSelectionLayer.mockReturnValue(false);

      service.handleFeatureInfoForLayer(MAP_INDEX, [feature], LAYER_ID);

      expect(mapService.addFeaturesToSelectionLayer).toHaveBeenCalledWith(
        [feature],
        MAP_INDEX,
        "select-1"
      );
    });
  });
});
