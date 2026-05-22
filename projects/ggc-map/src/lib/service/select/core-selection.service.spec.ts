import { TestBed } from "@angular/core/testing";
import { CoreSelectionService } from "./core-selection.service";
import { GgcMapService } from "../../map/service/ggc-map.service";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import { Select } from "ol/interaction";
import Collection from "ol/Collection";
import Map from "ol/Map";
import {
  MapComponentEvent,
  MapComponentEventTypes
} from "../../model/map-component-event.model";

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

  beforeEach(() => {
    map = new MockMap();

    const mapServiceSpy = jasmine.createSpyObj<GgcMapService>("GgcMapService", [
      "getMap",
      "getLayer"
    ]);

    mapServiceSpy.getMap.and.returnValue(map as unknown as Map);
    mapServiceSpy.getLayer.and.returnValue(undefined);

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

  it("should create an observable for a mapIndex", (done) => {
    service.getObservableForMap(MAP_INDEX).subscribe((event) => {
      expect(event.type).toBe(
        MapComponentEventTypes.SELECTIONSERVICE_CLEARSELECTION
      );
      done();
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

    expect(hasSelect).toBeTrue();
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

    const activeInteraction = (service as any)["activeSelectInteraction"].get(
      SELECT_INDEX
    );

    expect(activeInteraction).toBeTruthy();
    expect(activeInteraction.mapIndex).toBe(MAP_INDEX);
    expect(activeInteraction.select instanceof Select).toBeTrue();
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
    expect(hasSelect).toBeFalse();
    expect(service["activeMapClickEventsKeys"].size).toBe(0);
    expect(service["activeSelectEventsKeys"].size).toBe(0);
  });

  it("clearSelection should clear selection and emit event", (done) => {
    const mockSelect = new MockSelect();
    const feature = new Feature();
    mockSelect.selectFeature(feature);
    spyOn<any>(service, "getActiveSelectInteraction").and.returnValue(
      mockSelect as unknown as Select
    );

    service.getObservableForMap(MAP_INDEX).subscribe((event) => {
      if (
        event.type === MapComponentEventTypes.SELECTIONSERVICE_CLEARSELECTION
      ) {
        expect(service.getCurrentSelection(MAP_INDEX)).toEqual([]);
        done();
      }
    });

    service.clearSelection(MAP_INDEX);
  });

  it("setSelection should select provided features", () => {
    const mockSelect = new MockSelect();
    spyOn<any>(service, "getActiveSelectInteraction").and.returnValue({
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
    spyOn<any>(service, "getActiveSelectInteraction").and.returnValue({
      select: mockSelect as unknown as Select
    });

    expect(service.getCurrentSelection(MAP_INDEX)).toEqual([feature]);
  });

  it("should emit SELECTIONSERVICE_SELECTIONUPDATED when OpenLayers select event occurs", (done) => {
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
    expect(selectionUpdatedEvents[0].value).toEqual([]);
    done();
  });
});
