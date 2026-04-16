import { TestBed } from "@angular/core/testing";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import {
  MapComponentEvent,
  MapComponentEventTypes
} from "../../model/map-component-event.model";

import { CoreSelectionService } from "./core-selection.service";
import {
  CurrentAndPreviousSelection,
  FeatureCollectionForCoordinate
} from "./selection-state.model";
import { SelectionModeTypes } from "./selection-type.enum";

describe("CoreSelectionService", () => {
  let coreSelectionService: CoreSelectionService;
  const multimap = "multimap";
  const layer1 = "layer1";
  const layer2 = "layer2";
  const coordinatePrevious = [12, 34];
  const coordinateCurrent = [56, 78];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoreSelectionService]
    });
    coreSelectionService = TestBed.inject(CoreSelectionService);
  });

  it("should be created", () => {
    expect(coreSelectionService).toBeTruthy();
  });

  it("getSelectionMode should return default value false when selectionMode is not set for mapIndex", () => {
    expect(
      coreSelectionService.isMultiSelectMode("Deze mapindex bestaat niet")
    ).toBe(false);
  });

  it("getSelectionMode should return false when multiselect is set for mapIndex", () => {
    coreSelectionService.setSelectionModeFormapIndex(
      SelectionModeTypes.MULTI_SELECT,
      multimap
    );

    expect(coreSelectionService.isMultiSelectMode("multimap")).toBe(true);
  });

  it("getSelectionMode should return true when singleselect is set for mapIndex", () => {
    coreSelectionService.setSelectionModeFormapIndex(
      SelectionModeTypes.MULTI_SELECT,
      multimap
    );

    expect(coreSelectionService.isMultiSelectMode(multimap)).toBe(true);
  });

  it("getObservableForMap should return an observable", () => {
    expect(coreSelectionService.getObservableForMap(multimap)).toBeDefined();
  });

  it("clearSelectionForMap should clear selection and emit an avent", (done) => {
    coreSelectionService
      .getObservableForMap(multimap)
      .subscribe((eventReceived) => {
        expect(eventReceived.type).toBe(
          MapComponentEventTypes.SELECTIONSERVICE_CLEARSELECTION
        );
        expect(eventReceived.mapIndex).toBe(multimap);
        expect(eventReceived.message).toBe("Selectie is gewist");
        done();
      });

    coreSelectionService.clearSelectionForMap(multimap);
  });

  it("singleclickEventForMap in singleselect mode should create a new current selection with coordinate and emit an event", (done) => {
    const coordinate = [123, 456];
    coreSelectionService
      .getObservableForMap(multimap)
      .subscribe((eventReceived) => {
        const currentAndPreviousSelection = coreSelectionService[
          "allSelections"
        ].get(multimap) as CurrentAndPreviousSelection;
        expect(currentAndPreviousSelection.current).toBeDefined();
        expect(
          (
            currentAndPreviousSelection.current as FeatureCollectionForCoordinate
          ).coordinate
        ).toBe(coordinate);
        expect(
          (
            currentAndPreviousSelection.current as FeatureCollectionForCoordinate
          ).featureCollectionForLayers.length
        ).toBe(0);
        expect(currentAndPreviousSelection.previous).toBeUndefined();
        expect(eventReceived.type).toBe(
          MapComponentEventTypes.SELECTIONSERVICE_MAPCLICKED
        );
        expect(eventReceived.mapIndex).toBe(multimap);
        expect(eventReceived.message).toBe(
          "Er is geklikt in de kaart en de feature info wordt opgehaald."
        );
        done();
      });

    coreSelectionService.handleSingleclickEventForMap(coordinate, multimap);
  });

  it(
    "singleclickEventForMap in multiselect mode should create a new current selection with coordinate and previous selection is set" +
      " and emit an event",
    (done) => {
      coreSelectionService
        .getObservableForMap(multimap)
        .subscribe((eventReceived) => {
          expect(eventReceived.type).toBe(
            MapComponentEventTypes.SELECTIONSERVICE_MAPCLICKED
          );
          expect(eventReceived.mapIndex).toBe(multimap);
          expect(eventReceived.message).toBe(
            "Er is geklikt in de kaart en de feature info wordt opgehaald."
          );
          done();
        });
      coreSelectionService.setSelectionModeFormapIndex(
        SelectionModeTypes.MULTI_SELECT,
        multimap
      );
      const currentAndPreviousSelection = createCurrentAndPreviousSelection();
      coreSelectionService["allSelections"].set(
        multimap,
        currentAndPreviousSelection
      );

      coreSelectionService.handleSingleclickEventForMap(
        coordinateCurrent,
        multimap
      );

      expect(currentAndPreviousSelection.current).toBeDefined();
      expect(
        (currentAndPreviousSelection.current as FeatureCollectionForCoordinate)
          .coordinate
      ).toBe(coordinateCurrent);
      expect(
        (currentAndPreviousSelection.current as FeatureCollectionForCoordinate)
          .featureCollectionForLayers.length
      ).toBe(0);
      expect(currentAndPreviousSelection.previous).toBeDefined();
    }
  );

  it("handleFeatureInfoForLayer, if coordinate is not equal an event should be emitted", (done) => {
    // prepare by calling handleSingleclickEventForMap
    coreSelectionService.handleSingleclickEventForMap(
      coordinateCurrent,
      multimap
    );
    coreSelectionService
      .getObservableForMap(multimap)
      .subscribe((eventReceived) => {
        const currentAndPreviousSelection = coreSelectionService[
          "allSelections"
        ].get(multimap) as CurrentAndPreviousSelection;
        expect(
          (
            currentAndPreviousSelection.current as FeatureCollectionForCoordinate
          ).featureCollectionForLayers.length
        ).toBe(0);
        expect(eventReceived.type).toBe(MapComponentEventTypes.UNSUCCESSFUL);
        expect(eventReceived.mapIndex).toBe(multimap);
        expect(eventReceived.message).toBe(
          "Er is iets mis gegaan in de CoreSelectionService: het coordinaat van de kaartlaag komt niet" +
            " overeen met het verwachte coordinaat van het klik-event in de kaart."
        );
        expect(eventReceived.value).toBeUndefined();
        done();
      });
    coreSelectionService.handleFeatureInfoForLayer(
      multimap,
      [111, 222],
      [],
      layer1
    );
  });

  it(
    "handleFeatureInfoForLayer in singleselect mode should add new features" +
      " and emit an event",
    (done) => {
      // prepare by calling handleSingleclickEventForMap
      coreSelectionService.handleSingleclickEventForMap(
        coordinateCurrent,
        multimap
      );
      coreSelectionService
        .getObservableForMap(multimap)
        .subscribe((eventReceived) => {
          const currentAndPreviousSelection = coreSelectionService[
            "allSelections"
          ].get(multimap) as CurrentAndPreviousSelection;
          expect(
            (
              currentAndPreviousSelection.current as FeatureCollectionForCoordinate
            ).featureCollectionForLayers.length
          ).toBe(1);
          expect(
            (
              currentAndPreviousSelection.current as FeatureCollectionForCoordinate
            ).featureCollectionForLayers[0].layerName
          ).toBe(layer2);
          expect(
            (
              currentAndPreviousSelection.current as FeatureCollectionForCoordinate
            ).featureCollectionForLayers[0].features.length
          ).toBe(1);
          expect(currentAndPreviousSelection.previous).toBeUndefined();
          expect(eventReceived.value).toEqual(
            currentAndPreviousSelection.current
          );
          verifyEventFeatureInfo(eventReceived);
          done();
        });

      coreSelectionService.handleFeatureInfoForLayer(
        multimap,
        coordinateCurrent,
        createFeatureArray(),
        layer2
      );
    }
  );

  it(
    "handleFeatureInfoForLayer in multiselect mode, when layer is not present in previous selection should add all features to selection" +
      " and emit an event",
    (done) => {
      coreSelectionService.setSelectionModeFormapIndex(
        SelectionModeTypes.MULTI_SELECT,
        multimap
      );

      const previousSelection =
        createCurrentAndPreviousSelectionWithOneLayer(layer1);
      coreSelectionService["allSelections"].set(multimap, previousSelection);
      // prepare by calling handleSingleclickEventForMap
      coreSelectionService.handleSingleclickEventForMap(
        coordinateCurrent,
        multimap
      );
      coreSelectionService
        .getObservableForMap(multimap)
        .subscribe((eventReceived) => {
          const currentAndPreviousSelection = coreSelectionService[
            "allSelections"
          ].get(multimap) as CurrentAndPreviousSelection;
          expect(
            (
              currentAndPreviousSelection.current as FeatureCollectionForCoordinate
            ).featureCollectionForLayers.length
          ).toBe(1);
          expect(
            (
              currentAndPreviousSelection.current as FeatureCollectionForCoordinate
            ).featureCollectionForLayers[0].layerName
          ).toBe(layer2);
          expect(
            (
              currentAndPreviousSelection.current as FeatureCollectionForCoordinate
            ).featureCollectionForLayers[0].features.length
          ).toBe(1);
          expect(eventReceived.value).toEqual(
            currentAndPreviousSelection.current
          );
          verifyEventFeatureInfo(eventReceived);
          done();
        });

      coreSelectionService.handleFeatureInfoForLayer(
        multimap,
        coordinateCurrent,
        createFeatureArray(),
        layer2
      );
    }
  );

  it(
    "handleFeatureInfoForLayer in multiselect mode, when layer is present in previous selection and the same feature is clicked," +
      " new selection should have 0 features and emit an event",
    (done) => {
      coreSelectionService.setSelectionModeFormapIndex(
        SelectionModeTypes.MULTI_SELECT,
        multimap
      );

      const previousSelection =
        createCurrentAndPreviousSelectionWithOneLayer(layer2);
      coreSelectionService["allSelections"].set(multimap, previousSelection);
      // prepare by calling handleSingleclickEventForMap
      coreSelectionService.handleSingleclickEventForMap(
        coordinateCurrent,
        multimap
      );
      coreSelectionService
        .getObservableForMap(multimap)
        .subscribe((eventReceived) => {
          const currentAndPreviousSelection = coreSelectionService[
            "allSelections"
          ].get(multimap) as CurrentAndPreviousSelection;
          expect(
            (
              currentAndPreviousSelection.current as FeatureCollectionForCoordinate
            ).featureCollectionForLayers.length
          ).toBe(1);
          expect(
            (
              currentAndPreviousSelection.current as FeatureCollectionForCoordinate
            ).featureCollectionForLayers[0].layerName
          ).toBe(layer2);
          expect(
            (
              currentAndPreviousSelection.current as FeatureCollectionForCoordinate
            ).featureCollectionForLayers[0].features.length
          ).toBe(0);
          expect(eventReceived.value).toEqual(
            currentAndPreviousSelection.current
          );
          verifyEventFeatureInfo(eventReceived);
          done();
        });

      coreSelectionService.handleFeatureInfoForLayer(
        multimap,
        coordinateCurrent,
        createFeatureArray(),
        layer2
      );
    }
  );

  it(
    "handleFeatureInfoForLayer in multiselect mode, when layer is present in previous selection and a different feature is clicked," +
      " new selection should have 2 features and emit an event",
    (done) => {
      coreSelectionService.setSelectionModeFormapIndex(
        SelectionModeTypes.MULTI_SELECT,
        multimap
      );

      const previousSelection =
        createCurrentAndPreviousSelectionWithOneLayer(layer2);
      coreSelectionService["allSelections"].set(multimap, previousSelection);
      // prepare by calling handleSingleclickEventForMap
      coreSelectionService.handleSingleclickEventForMap(
        coordinateCurrent,
        multimap
      );
      coreSelectionService
        .getObservableForMap(multimap)
        .subscribe((eventReceived) => {
          const currentAndPreviousSelection = coreSelectionService[
            "allSelections"
          ].get(multimap) as CurrentAndPreviousSelection;

          expect(
            (
              currentAndPreviousSelection.current as FeatureCollectionForCoordinate
            ).featureCollectionForLayers.length
          ).toBe(1);
          expect(
            (
              currentAndPreviousSelection.current as FeatureCollectionForCoordinate
            ).featureCollectionForLayers[0].layerName
          ).toBe(layer2);
          expect(
            (
              currentAndPreviousSelection.current as FeatureCollectionForCoordinate
            ).featureCollectionForLayers[0].features.length
          ).toBe(2);
          expect(eventReceived.value).toEqual(
            currentAndPreviousSelection.current
          );
          verifyEventFeatureInfo(eventReceived);
          done();
        });
      coreSelectionService.handleFeatureInfoForLayer(
        multimap,
        coordinateCurrent,
        createFeatureArray("b"),
        layer2
      );
    }
  );

  it(
    "clearFeatureInfoForLayer in should remove layer from featureCollectionForLayers" +
      " and emit an event",
    (done) => {
      // prepare by calling handleSingleclickEventForMap
      coreSelectionService.handleSingleclickEventForMap(
        coordinateCurrent,
        multimap
      );
      coreSelectionService
        .getObservableForMap(multimap)
        .subscribe((eventReceived) => {
          const currentAndPreviousSelection = coreSelectionService[
            "allSelections"
          ].get(multimap) as CurrentAndPreviousSelection;
          expect(
            (
              currentAndPreviousSelection.current as FeatureCollectionForCoordinate
            ).featureCollectionForLayers.length
          ).toBe(0);
          expect(eventReceived.value).toEqual(
            currentAndPreviousSelection.current
          );
          verifyEventFeatureInfo(eventReceived);
          done();
        });
      coreSelectionService.clearFeatureInfoForLayer(multimap, layer2);
    }
  );

  it("should set the selection to the specified features and layer and emit an event", (done) => {
    const features = createFeatureArray("selectedFeature");
    coreSelectionService.getObservableForMap(multimap).subscribe((e) => {
      expect(e.type).toEqual(
        MapComponentEventTypes.SELECTIONSERVICE_SELECTIONUPDATED
      );
      expect(e.value.featureCollectionForLayers[0].layerName).toEqual(layer1);
      expect(e.value.featureCollectionForLayers[0].features).toEqual(features);
      done();
    });
    coreSelectionService.setSelectionForLayer(features, layer1, multimap);
  });

  it("should override the selection to the specified features and emit an event", (done) => {
    const features = createFeatureArray("selectedFeature");
    const features2 = createFeatureArray("newFeature");
    coreSelectionService.setSelectionForLayer(features, layer1, multimap);
    coreSelectionService.getObservableForMap(multimap).subscribe((e) => {
      expect(e.type).toEqual(
        MapComponentEventTypes.SELECTIONSERVICE_SELECTIONUPDATED
      );
      expect(e.value.featureCollectionForLayers[0].layerName).toEqual(layer1);
      expect(e.value.featureCollectionForLayers[0].features).toEqual(features2);
      done();
    });
    coreSelectionService.setSelectionForLayer(features2, layer1, multimap);
  });

  it("should not modify selected features in another layer", (done) => {
    const features1 = createFeatureArray("selectedFeatureLayer1");
    const features2 = createFeatureArray("selectedFeatureLayer2");
    coreSelectionService.setSelectionForLayer(features1, layer1, multimap);
    coreSelectionService.getObservableForMap(multimap).subscribe((e) => {
      expect(e.type).toEqual(
        MapComponentEventTypes.SELECTIONSERVICE_SELECTIONUPDATED
      );
      expect(e.value.featureCollectionForLayers[0].layerName).toEqual(layer1);
      expect(e.value.featureCollectionForLayers[1].layerName).toEqual(layer2);
      expect(e.value.featureCollectionForLayers[0].features).toEqual(features1);
      expect(e.value.featureCollectionForLayers[1].features).toEqual(features2);
      done();
    });
    coreSelectionService.setSelectionForLayer(features2, layer2, multimap);
  });

  function verifyEventFeatureInfo(eventReceived: MapComponentEvent) {
    expect(eventReceived.type).toBe(
      MapComponentEventTypes.SELECTIONSERVICE_SELECTIONUPDATED
    );
    expect(eventReceived.mapIndex).toBe(multimap);
    expect(eventReceived.layerName).toBe(layer2);
    expect(eventReceived.message).toBe(
      "Nieuwe feature info van een kaartlaag toegevoegd aan de selectie."
    );
  }

  function createCurrentAndPreviousSelection(): CurrentAndPreviousSelection {
    const currentAndPreviousSelection = new CurrentAndPreviousSelection();
    currentAndPreviousSelection.current = new FeatureCollectionForCoordinate(
      coordinatePrevious
    );
    return currentAndPreviousSelection;
  }

  function createCurrentAndPreviousSelectionWithOneLayer(
    layerName: string
  ): CurrentAndPreviousSelection {
    const currentAndPreviousSelection = createCurrentAndPreviousSelection();
    currentAndPreviousSelection.current = new FeatureCollectionForCoordinate(
      coordinatePrevious
    );
    (
      currentAndPreviousSelection.current as FeatureCollectionForCoordinate
    ).featureCollectionForLayers.push({
      layerName,
      features: createFeatureArray()
    });
    return currentAndPreviousSelection;
  }

  function createFeatureArray(id = "a"): Feature<Geometry>[] {
    const feature = { getId: () => id } as Feature<Geometry>;
    return [feature];
  }
});
