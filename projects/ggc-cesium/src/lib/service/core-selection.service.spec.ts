import { inject, TestBed } from "@angular/core/testing";
import {
  Cartesian2,
  Cesium3DTileFeature,
  Color,
  Entity,
  PostProcessStage,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType
} from "@cesium/engine";
import { Viewer } from "@cesium/widgets";
import {
  CoreSelectionService,
  ScreenSpaceEvent
} from "./core-selection.service";
import { createCesiumMock } from "../viewer/viewer-mock.spec";
import { CoreViewerService } from "./core-viewer.service";
import { Subject } from "rxjs";
import { SelectionEvent, SelectionEventType } from "../model/interfaces";
import { Tiles3dLayerService } from "../layers/tiles3d-layer.service";
import { GeoJsonLayerService } from "../layers/geojson-layer.service";
import Spy = jasmine.Spy;

describe("CoreSelectionService", () => {
  let service: CoreSelectionService;
  let coreViewerServiceSpy: jasmine.SpyObj<CoreViewerService>;
  let tiles3dLayerServiceSpy: jasmine.SpyObj<Tiles3dLayerService>;
  let geoJsonLayerServiceSpy: jasmine.SpyObj<GeoJsonLayerService>;
  let subject: Subject<Viewer | undefined>;

  beforeEach(async () => {
    coreViewerServiceSpy = jasmine.createSpyObj("CoreViewerService", [
      "setViewer",
      "getViewerObservable"
    ]);

    tiles3dLayerServiceSpy = jasmine.createSpyObj("Tiles3dLayerService", [
      "getLayerName"
    ]);

    geoJsonLayerServiceSpy = jasmine.createSpyObj("GeoJsonLayerService", [
      "getLayerName",
      "getEntitiesFunction",
      "getEntitiesHighlightFunction"
    ]);
    TestBed.configureTestingModule({
      providers: [
        CoreSelectionService,
        { provide: CoreViewerService, useValue: coreViewerServiceSpy },
        { provide: Tiles3dLayerService, useValue: tiles3dLayerServiceSpy },
        { provide: GeoJsonLayerService, useValue: geoJsonLayerServiceSpy }
      ]
    });
    subject = new Subject<Viewer | undefined>();
    coreViewerServiceSpy.getViewerObservable.and.returnValue(
      subject.asObservable()
    );

    service = TestBed.inject(CoreSelectionService);
    service["mouseHandler"] = new ScreenSpaceEventHandler();

    subject.next(undefined);
    expect(coreViewerServiceSpy.getViewerObservable).toHaveBeenCalled();
  });

  it("should be created", inject(
    [CoreSelectionService],
    (service: CoreSelectionService) => {
      expect(service).toBeTruthy();
    }
  ));

  it("should call initializeCoreSelectionService() when a new Viewer is received", () => {
    const initializeCoreSelectionServiceSpy = spyOn<any>(
      service,
      "initializeCoreSelectionService"
    ).and.callThrough();

    subject.next(createCesiumMock() as Viewer);
    expect(initializeCoreSelectionServiceSpy).toHaveBeenCalled();
    expect(service["currentSupportedEvents"]).toHaveSize(12);
    expect(service["highlightMap"]).toHaveSize(0);
  });

  it("should call clearCoreSelectionService() when undefined is received", () => {
    const clearCoreSelectionServiceSpy = spyOn<any>(
      service,
      "clearCoreSelectionService"
    ).and.callThrough();
    const mousehandlerSpy = spyOn(service["mouseHandler"], "destroy");

    subject.next(undefined);
    expect(mousehandlerSpy).toHaveBeenCalled();
    expect(clearCoreSelectionServiceSpy).toHaveBeenCalled();
    expect(service["lastHoveredFeature"]).toBeUndefined();
    expect(service["highlightMap"]).toHaveSize(0);
  });

  describe("initializeSelections", () => {
    it("should replace the current selection array and call reAddSelections()", () => {
      const selections = createSelections(3);
      //@ts-ignore
      const reAddSelectionsSpy = spyOn(service, "reAddSelections");
      expect(service["selections"]).toEqual([]);

      service.initializeSelections(selections);

      expect(service["selections"]).toEqual(selections);
      expect(reAddSelectionsSpy).toHaveBeenCalled();
    });
  });

  describe("addSelection", () => {
    it("should replace a selection in the selection array if the type already exists and call reAddSelections()", () => {
      const newSelection = createSelection(
        ScreenSpaceEventType.LEFT_CLICK,
        Color.TURQUOISE
      );
      const selections = createSelections(1);
      service["selections"] = selections;
      //@ts-ignore
      const reAddSelectionsSpy = spyOn(service, "reAddSelections");

      service.addSelection(newSelection);

      expect(service["selections"].length).toBe(1);
      expect(service["selections"][0]).toEqual(newSelection);
      expect(reAddSelectionsSpy).toHaveBeenCalled();
    });
  });

  describe("reAddSelections", () => {
    it("should call addToHighlightmap", () => {
      subject.next(createCesiumMock() as Viewer);
      service["selections"] = createSelections(2);
      spyOn(service["mouseHandler"], "setInputAction");

      const addToHighlightMapSpy = spyOn<any>(service, "addToHighlightMap");
      service["reAddSelections"]();
      expect(addToHighlightMapSpy).toHaveBeenCalledTimes(2);
    });
    it("should call mouseHandler.inputActions", () => {
      subject.next(createCesiumMock() as Viewer);
      service["selections"] = createSelections(2);
      const mousehandlerSpy = spyOn(service["mouseHandler"], "setInputAction");
      service["reAddSelections"]();
      expect(mousehandlerSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("handleInputEvent", () => {
    const cesiumMock = createCesiumMock() as Viewer;

    it("should call setHighlightOnFeature() and emit event when the type of feature is Cesium3DTileFeature", (done) => {
      const pickedFeature = new Cesium3DTileFeature();
      service["viewer"] = cesiumMock;
      (cesiumMock.scene.pick as Spy).and.returnValue(pickedFeature);
      const selection = createSelection(
        ScreenSpaceEventType.RIGHT_CLICK,
        Color.BLACK
      );
      const movement = {
        position: { x: 955, y: 238 } as Cartesian2
      };
      //@ts-ignore
      const getFeatureSpy = spyOn(service, "getFeature").and.callThrough();
      //@ts-ignore
      const setHighlightOnFeatureSpy = spyOn(service, "setHighlightOnFeature");
      tiles3dLayerServiceSpy.getLayerName.and.returnValue("layer1");

      service.getClickEventsObservable().subscribe((evt: SelectionEvent) => {
        expect(evt.layerName).toBe("layer1");
        expect(evt.selectionEventType).toBe(
          SelectionEventType.SELECTIONSERVICE_SELECTIONUPDATED
        );
        expect(evt.type).toBe(ScreenSpaceEventType.RIGHT_CLICK);
        expect(evt.feature).toBe(pickedFeature);
        done();
      });

      service["handleInputEvent"](movement, selection);

      expect(getFeatureSpy).toHaveBeenCalled();
      expect(setHighlightOnFeatureSpy).toHaveBeenCalled();
    });

    it("should call updateLastClickedEntity() and emit event when the type of feature is Entity", (done) => {
      service["viewer"] = cesiumMock;
      const feature = { id: new Entity() };
      (cesiumMock.scene.pick as Spy).and.returnValue(feature);
      const selection = createSelection(
        ScreenSpaceEventType.RIGHT_CLICK,
        Color.BLACK
      );
      const movement = {
        position: { x: 955, y: 238 } as Cartesian2
      };
      //@ts-ignore
      const getFeatureSpy = spyOn(service, "getFeature").and.callThrough();
      const updateLastClickedEntitySpy = spyOn(
        service,
        //@ts-ignore
        "updateLastClickedEntity"
      );
      geoJsonLayerServiceSpy.getLayerName.and.returnValue("layer1");

      service.getClickEventsObservable().subscribe((evt: SelectionEvent) => {
        expect(evt.layerName).toBe("layer1");
        expect(evt.selectionEventType).toBe(
          SelectionEventType.SELECTIONSERVICE_SELECTIONUPDATED
        );
        expect(evt.type).toBe(ScreenSpaceEventType.RIGHT_CLICK);
        expect(evt.feature).toBe(feature.id);
        done();
      });

      service["handleInputEvent"](movement, selection);

      expect(getFeatureSpy).toHaveBeenCalled();
      expect(updateLastClickedEntitySpy).toHaveBeenCalled();
    });
  });

  describe("getSelection", () => {
    it("should return the right selection if the selection is present in the array", () => {
      service["selections"] = createSelections(3);
      const foundSelection = service.getSelection(
        ScreenSpaceEventType.RIGHT_CLICK
      );
      expect(foundSelection).toEqual({
        eventType: ScreenSpaceEventType.RIGHT_CLICK,
        highlightColor: Color.WHITE
      });
    });
    it("should return the undefined if the selection isn't present in the array", () => {
      service["selections"] = createSelections(1);
      const foundSelection = service.getSelection(
        ScreenSpaceEventType.RIGHT_CLICK
      );
      expect(foundSelection).toBeUndefined();
    });
  });

  describe("destroySelection", () => {
    it("should update the Highlightmap", () => {
      spyOn(service["mouseHandler"], "removeInputAction");
      service["highlightMap"].set(
        ScreenSpaceEventType.LEFT_CLICK,
        {} as PostProcessStage
      );
      service.destroySelection(ScreenSpaceEventType.LEFT_CLICK);
      expect(service["highlightMap"].has(ScreenSpaceEventType.LEFT_CLICK)).toBe(
        true
      );
      expect(service["highlightMap"].get(ScreenSpaceEventType.LEFT_CLICK)).toBe(
        undefined
      );
    });
    it("should call mouseHandler.removeActions", () => {
      const mousehandlerSpy = spyOn(
        service["mouseHandler"],
        "removeInputAction"
      );
      service.destroySelection(ScreenSpaceEventType.LEFT_CLICK);
      expect(mousehandlerSpy).toHaveBeenCalled();
    });
    it("should call clearSelection() and remove selection from selection array", () => {
      spyOn(service["mouseHandler"], "removeInputAction");
      const clearSelectionSpy = spyOn(service, "clearSelection");
      service["selections"] = createSelections(2);

      service.destroySelection(ScreenSpaceEventType.LEFT_CLICK);

      expect(service["selections"].length).toBe(1);
      expect(service["selections"][0].eventType).not.toBe(
        ScreenSpaceEventType.LEFT_CLICK
      );
      expect(clearSelectionSpy).toHaveBeenCalledWith(
        ScreenSpaceEventType.LEFT_CLICK
      );
    });
    it("should call destroySelection() for each SelectionConfig when destroyAllSelections() is called", () => {
      service["selections"] = createSelections(3);
      const destroySelectionSpy = spyOn(
        service,
        "destroySelection"
      ).and.callThrough();
      const mouseHandlerSpy = spyOn(
        service["mouseHandler"],
        "removeInputAction"
      );
      service.destroyAllSelections();
      expect(destroySelectionSpy).toHaveBeenCalledTimes(3);
      expect(mouseHandlerSpy).toHaveBeenCalledTimes(3);
      expect(service["selections"]).toHaveSize(0);
    });
  });

  describe("clearSelection", () => {
    it("should call clearHighlight() and throw a new SelectionEvent with the type SELECTIONSERVICE_SELECTIONCLEARED", (done) => {
      service["selections"] = createSelections(2);
      const clearHighlightSpy = spyOn(
        service,
        //@ts-ignore
        "clearHighlight"
      ).and.callThrough();
      service.getClickEventsObservable().subscribe((event: SelectionEvent) => {
        expect(event.selectionEventType).toBe(
          SelectionEventType.SELECTIONSERVICE_SELECTIONCLEARED
        );
        expect(event.type).toBe(ScreenSpaceEventType.RIGHT_CLICK);
        done();
      });
      service.clearSelection(ScreenSpaceEventType.RIGHT_CLICK);
      expect(clearHighlightSpy).toHaveBeenCalled();
    });
    it("should call clearAllSelections() for each SelectionConfig when clearSelections() is called", () => {
      service["selections"] = createSelections(3);
      const clearSelectionSpy = spyOn(service, "clearSelection");
      service.clearAllSelections();
      expect(clearSelectionSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe("addToHighlightMap", () => {
    const selection = {
      eventType: ScreenSpaceEventType.LEFT_CLICK,
      highlightColor: Color.YELLOW
    };
    it("should update the Highlightmap when isSilhouetteActivated", () => {
      service["isSilhouetteActivated"] = true;
      service["addToHighlightMap"](
        selection.eventType,
        selection.highlightColor
      );
      expect(service["highlightMap"].has(ScreenSpaceEventType.LEFT_CLICK)).toBe(
        true
      );
    });

    it("should not update the Highlightmap when not isSilhouetteActivated", () => {
      service["isSilhouetteActivated"] = false;
      service.addSelection(selection);
      expect(service["highlightMap"].has(ScreenSpaceEventType.LEFT_CLICK)).toBe(
        false
      );
    });
    it("should keep the selected features when a highlight gets readded for the same event and color", () => {
      const features = [{ show: true }] as Cesium3DTileFeature[];
      service["highlightMap"].set(ScreenSpaceEventType.LEFT_CLICK, {
        uniforms: {
          color: Color.YELLOW
        },
        selected: features
      } as PostProcessStage);

      service["addToHighlightMap"](
        selection.eventType,
        selection.highlightColor
      );
      const postProcessStage = service["highlightMap"].get(
        ScreenSpaceEventType.LEFT_CLICK
      );
      expect(postProcessStage?.selected.length).toBe(1);
      expect(postProcessStage?.selected).toEqual(features);
    });

    describe("setHighlightOnFeature", () => {
      it("should add feature to selected when isSilhouetteActivated", () => {
        service["isSilhouetteActivated"] = true;
        const eventType = ScreenSpaceEventType.LEFT_CLICK;
        const feature = new Cesium3DTileFeature();
        service["addToHighlightMap"](eventType);
        const silhouette = service["highlightMap"].get(eventType);
        service["setHighlightOnFeature"](feature, eventType);
        expect((silhouette as PostProcessStage).selected.length).toBe(1);
      });
    });

    it("should set lastHoveredFeature and change featurecolor when not isSilhouetteActivated", () => {
      service["isSilhouetteActivated"] = false;
      const eventType = ScreenSpaceEventType.LEFT_CLICK;
      const feature = { color: undefined } as unknown as Cesium3DTileFeature;

      service["addToHighlightMap"](eventType);
      service["setHighlightOnFeature"](feature, eventType);

      expect(service["highlightMap"].has(eventType)).toBeFalse();
      expect(service["lastHoveredFeature"]).toEqual(feature);
      expect(
        (service["lastHoveredFeature"] as Cesium3DTileFeature).color
      ).toEqual(Color.GREEN);
    });
  });

  describe("clearHighlight", () => {
    it("should remove feature from selected when isSilhouetteActivated", () => {
      service["isSilhouetteActivated"] = true;
      const eventType = ScreenSpaceEventType.LEFT_CLICK;
      const feature = new Cesium3DTileFeature();
      service["addToHighlightMap"](eventType);
      const silhouette = service["highlightMap"].get(eventType);
      (silhouette as PostProcessStage).selected = [feature];
      service["clearHighlight"](eventType);
      expect((silhouette as PostProcessStage).selected.length).toBe(0);
    });
    it("should clear lastHoveredFeature when not isSilhouetteActivated", () => {
      service["isSilhouetteActivated"] = false;
      const eventType = ScreenSpaceEventType.LEFT_CLICK;
      service["addToHighlightMap"](eventType);
      service["clearHighlight"](eventType);
      expect(service["lastHoveredFeature"]).toBe(undefined);
    });
  });

  describe("lastClickedEntity", () => {
    it("should update and remove clicked features within the lastClickedEntity", () => {
      const featureClicked = { id: "clicked" } as Entity;
      const featureHovered = { id: "hovered" } as Entity;

      service["updateLastClickedEntity"](
        featureClicked,
        ScreenSpaceEventType.LEFT_CLICK
      );
      expect(service["lastClickedEntity"]).toBe(featureClicked);

      service["updateLastClickedEntity"](
        featureHovered,
        ScreenSpaceEventType.MOUSE_MOVE
      );
      expect(service["lastClickedEntity"]).toBe(featureClicked);

      service["clearHighlight"](ScreenSpaceEventType.MOUSE_MOVE);
      expect(service["lastClickedEntity"]).toBe(featureClicked);

      service["clearHighlight"](ScreenSpaceEventType.LEFT_CLICK);
      expect(service["lastClickedEntity"]).toBe(undefined);
    });
  });

  describe("getFeature", () => {
    it("should return undefined if ScreenSpaceEventType is WHEEL", () => {
      const undefinedFeature = service["getFeature"](
        ScreenSpaceEventType.WHEEL,
        {} as ScreenSpaceEvent
      );

      expect(undefinedFeature).toBeUndefined();
    });

    it("should return a feature if ScreenSpaceEventType is MOUSE_MOVE", () => {
      const cesiumMock = createCesiumMock() as Viewer;
      service["viewer"] = cesiumMock;
      const pickedFeature = new Cesium3DTileFeature();
      (cesiumMock.scene.pick as Spy).and.returnValue(pickedFeature);
      const endPosition = new Cartesian2();

      const undefinedFeature = service["getFeature"](
        ScreenSpaceEventType.MOUSE_MOVE,
        { endPosition: endPosition } as ScreenSpaceEvent
      );

      expect(cesiumMock.scene.pick).toHaveBeenCalledWith(endPosition);
      expect(undefinedFeature).toBe(pickedFeature);
    });

    it("should return a feature if ScreenSpaceEventType is LEFT_CLICK", () => {
      const cesiumMock = createCesiumMock() as Viewer;
      service["viewer"] = cesiumMock;
      const pickedFeature = new Cesium3DTileFeature();
      (cesiumMock.scene.pick as Spy).and.returnValue(pickedFeature);
      const position = new Cartesian2();

      const feature = service["getFeature"](ScreenSpaceEventType.LEFT_CLICK, {
        position: position
      } as ScreenSpaceEvent);

      expect(cesiumMock.scene.pick).toHaveBeenCalledWith(position);
      expect(feature).toBe(pickedFeature);
      expect(feature).toBeInstanceOf(Cesium3DTileFeature);
    });

    it("should return a entity if ScreenSpaceEventType is LEFT_CLICK", () => {
      const cesiumMock = createCesiumMock() as Viewer;
      service["viewer"] = cesiumMock;
      const pickedEntity = new Entity();
      (cesiumMock.scene.pick as Spy).and.returnValue({
        id: pickedEntity
      });
      const position = new Cartesian2();

      const feature = service["getFeature"](ScreenSpaceEventType.LEFT_CLICK, {
        position: position
      } as ScreenSpaceEvent);

      expect(cesiumMock.scene.pick).toHaveBeenCalledWith(position);
      expect(feature).toBe(pickedEntity);
      expect(feature).toBeInstanceOf(Entity);
    });

    it("should return undefined if ScreenSpaceEventType is LEFT_CLICK and no Entity found", () => {
      const cesiumMock = createCesiumMock() as Viewer;
      service["viewer"] = cesiumMock;
      (cesiumMock.scene.pick as Spy).and.returnValue({
        id: undefined
      });
      const position = new Cartesian2();

      const feature = service["getFeature"](ScreenSpaceEventType.LEFT_CLICK, {
        position: position
      } as ScreenSpaceEvent);

      expect(cesiumMock.scene.pick).toHaveBeenCalledWith(position);
      expect(feature).toBe(undefined);
      expect(feature).toBeUndefined();
    });
  });

  describe("getPositionString", () => {
    let getCoordsSpy: Spy;
    beforeEach(() => {
      // spyOn type any to be able to spy on a private method.
      getCoordsSpy = spyOn<any>(service, "getCoords");
    });

    it("should return empty array if ScreenSpaceEventType is WHEEL", () => {
      const emptyArray = service["getPositionString"](
        ScreenSpaceEventType.WHEEL,
        {} as ScreenSpaceEvent
      );

      expect(emptyArray.length).toEqual(0);
    });

    it("should return a double array if ScreenSpaceEventType is MOUSE_MOVE", () => {
      getCoordsSpy.and.returnValues([1, 2], [3, 4]);
      const startPosition = new Cartesian2(1, 2);
      const endPosition = new Cartesian2(3, 4);

      const doubleArray = service["getPositionString"](
        ScreenSpaceEventType.MOUSE_MOVE,
        {
          startPosition,
          endPosition
        } as ScreenSpaceEvent
      );

      expect(getCoordsSpy).toHaveBeenCalledTimes(2);
      expect(getCoordsSpy.calls.argsFor(0)[0]).toEqual(startPosition);
      expect(getCoordsSpy.calls.argsFor(1)[0]).toEqual(endPosition);

      expect(doubleArray.length).toEqual(2);
      expect(doubleArray).toEqual([
        [1, 2],
        [3, 4]
      ]);
    });

    it("should return a single array if ScreenSpaceEventType is LEFT_CLICK", () => {
      getCoordsSpy.and.returnValue([5, 6]);
      const position = new Cartesian2(5, 6);

      const singleArray = service["getPositionString"](
        ScreenSpaceEventType.LEFT_CLICK,
        {
          position
        } as ScreenSpaceEvent
      );

      expect(getCoordsSpy).toHaveBeenCalledOnceWith(position);

      expect(singleArray.length).toEqual(2);
      expect(singleArray).toEqual([5, 6]);
    });
  });
});

function createSelections(amount: number) {
  const selections = [
    createSelection(ScreenSpaceEventType.LEFT_CLICK, Color.BLACK),
    createSelection(ScreenSpaceEventType.RIGHT_CLICK, Color.WHITE),
    createSelection(ScreenSpaceEventType.MIDDLE_CLICK, Color.BLUE)
  ];
  return selections.slice(0, amount);
}

function createSelection(
  eventType: ScreenSpaceEventType,
  highlightColor: Color
) {
  return { eventType, highlightColor };
}
