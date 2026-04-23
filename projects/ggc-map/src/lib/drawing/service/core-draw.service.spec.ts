import { TestBed } from "@angular/core/testing";
import { Feature } from "ol";
import { EventsKey } from "ol/events";
import { Geometry, LineString, Point, Polygon } from "ol/geom";
import { Draw, Modify, Snap, Translate } from "ol/interaction";
import { DrawEvent, GeometryFunction } from "ol/interaction/Draw";
import VectorLayer from "ol/layer/Vector";
import OlMap from "ol/Map";
import VectorSource from "ol/source/Vector";
import { CoreMapService } from "../../map/service/core-map.service";
import {
  DrawInteractionEventTypes,
  MapComponentDrawTypes,
  StyleLikeMap
} from "../../model/draw-interaction-event.model";
import { MapComponentEventTypes } from "../../model/map-component-event.model";
import { ModifyInteractionEventTypes } from "../../model/modify-interaction-event.model";

import { CoreDrawService } from "./core-draw.service";
import Style from "ol/style/Style";
import { CoreDrawLayerService } from "./core-draw-layer.service";
import { CoreSnapService } from "./core-snap.service";
import { CenterDraw } from "../center-interaction/center-draw";
import { Coordinate } from "ol/coordinate";
import createSpyObj = jasmine.createSpyObj;
import Spy = jasmine.Spy;
import View from "ol/View";
import { CenterModify } from "../center-interaction/center-modify";
import { customDrawStyle, customFinishDrawStyle } from "./draw-styles";

describe("CoreDrawService", () => {
  const mapIndex = "TEST_MAP";
  const layerName = "TestLayer";
  let service: CoreDrawService;
  let coreMapService: CoreMapService;
  let coreDrawLayerService: CoreDrawLayerService;
  let coreSnapService: CoreSnapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoreDrawService);
    coreMapService = TestBed.inject(CoreMapService);
    coreDrawLayerService = TestBed.inject(CoreDrawLayerService);
    coreSnapService = TestBed.inject(CoreSnapService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("addFeatureToLayer", () => {
    it("should add the feature and return successful if the mapIndex does exist", () => {
      const vectorLayer = createVectorLayer();
      const myFeature = new Feature<Geometry>();
      const addStylingSpy = spyOn<any>(service, "addStylingToFeature");
      spyOn(coreMapService, "checkMapIndex").and.returnValue(true);
      spyOn(coreDrawLayerService, "getDrawLayer").and.returnValue(vectorLayer);
      spyOn(vectorLayer.getSource(), "addFeature" as never).and.stub();
      const result = service.addFeatureToLayer(layerName, mapIndex, myFeature);
      expect(result.type).toEqual(MapComponentEventTypes.SUCCESSFUL);
      expect(vectorLayer.getSource()!.addFeature).toHaveBeenCalledWith(
        myFeature
      );
      expect(addStylingSpy).toHaveBeenCalledWith(
        layerName,
        mapIndex,
        myFeature
      );
    });

    it("should return unsuccessful if the mapIndex does not exist", () => {
      spyOn(coreMapService, "checkMapIndex").and.returnValue(false);
      const result = service.addFeatureToLayer(
        layerName,
        mapIndex,
        new Feature<Geometry>()
      );
      expect(result.type).toEqual(MapComponentEventTypes.UNSUCCESSFUL);
    });
    it("should NOT call 'addStylingToFeature' if the feature already contains styling", () => {
      const vectorLayer = createVectorLayer();
      const myFeature = new Feature<Geometry>();
      myFeature.setStyle(new Style());
      const addStylingSpy = spyOn<any>(service, "addStylingToFeature");
      spyOn(coreMapService, "checkMapIndex").and.returnValue(true);
      spyOn(coreDrawLayerService, "getDrawLayer").and.returnValue(vectorLayer);
      service.addFeatureToLayer(layerName, mapIndex, myFeature);
      expect(addStylingSpy).not.toHaveBeenCalled();
    });
  });

  describe("appendCoordinates", () => {
    const coordinates1 = [150000, 450000];
    const coordinates2 = [250000, 450000];
    it("should call appendcoordinates if the mapIndex and drawInteraction do exist", () => {
      const drawInteraction = createDrawInteraction();
      service["drawInteractions"].set(mapIndex, drawInteraction);
      spyOn(coreMapService, "checkMapIndex").and.returnValue(true);
      spyOn(drawInteraction, "appendCoordinates").and.stub();
      service.appendCoordinates(coordinates1, mapIndex);
      service.appendCoordinates(coordinates2, mapIndex);
      expect(drawInteraction.appendCoordinates).toHaveBeenCalledTimes(2);
    });
    it("should NOT call appendcoordinates if the mapIndex does not exist", () => {
      const drawInteraction = createDrawInteraction();
      service["drawInteractions"].set(mapIndex, drawInteraction);
      spyOn(drawInteraction, "appendCoordinates").and.stub();
      service.appendCoordinates(coordinates1, mapIndex);
      expect(drawInteraction.appendCoordinates).not.toHaveBeenCalled();
    });
  });

  describe("removeLastPoint", () => {
    it("should call removeLastPoint if the mapIndex and drawInteraction exist for centerDrawInteraction", () => {
      const centerDraw = new CenterDraw({
        type: "LineString"
      });
      service["drawInteractions"].set(mapIndex, centerDraw);
      spyOn(coreMapService, "checkMapIndex").and.returnValue(true);
      spyOn(centerDraw, "removeLastPoint").and.stub();
      service.removeLastPoint(mapIndex);

      expect(centerDraw.removeLastPoint).toHaveBeenCalledTimes(1);
    });
    it("should call removeLastPoint if the mapIndex and drawInteraction exist for drawInteraction", () => {
      const draw = new Draw({
        type: "Polygon"
      });
      service["drawInteractions"].set(mapIndex, draw);
      spyOn(coreMapService, "checkMapIndex").and.returnValue(true);
      spyOn(draw, "removeLastPoint").and.stub();
      service.removeLastPoint(mapIndex);

      expect(draw.removeLastPoint).toHaveBeenCalledTimes(1);
    });
    it("should NOT call removeLastPoint if the mapIndex does not exist", () => {
      const drawInteraction = new CenterDraw({
        type: "LineString"
      });
      service["drawInteractions"].set(mapIndex, drawInteraction);
      spyOn(coreMapService, "checkMapIndex").and.returnValue(false);
      spyOn(drawInteraction, "removeLastPoint").and.stub();
      service.removeLastPoint(mapIndex);

      expect(drawInteraction.removeLastPoint).not.toHaveBeenCalled();
    });
  });

  it("should call getSketchCoordinates if the mapIndex and drawInteraction exist and is of instance CenterDraw", () => {
    const centerDraw = new CenterDraw({
      type: "LineString"
    });
    service["drawInteractions"].set(mapIndex, centerDraw);
    spyOn(coreMapService, "checkMapIndex").and.returnValue(true);
    spyOn(centerDraw, "getSketchCoordinates").and.stub();
    service.getSketchCoordinates(mapIndex);

    expect(centerDraw.getSketchCoordinates).toHaveBeenCalledTimes(1);
  });

  describe("clearLayer", () => {
    it("should clear the layer and return successful if the mapIndex does exist", () => {
      const vectorLayer = createVectorLayer();
      spyOn(coreMapService, "checkMapIndex").and.returnValue(true);
      spyOn(coreDrawLayerService, "getDrawLayer").and.returnValue(vectorLayer);
      spyOn(vectorLayer.getSource(), "clear" as never).and.stub();
      const result = service.clearLayer(layerName, mapIndex);
      expect(result.type).toEqual(MapComponentEventTypes.SUCCESSFUL);
      expect(vectorLayer.getSource()!.clear).toHaveBeenCalled();
    });
  });

  describe("deleteDrawInteraction", () => {
    it("should delete the draw interaction", () => {
      const fakeMap = createSpyObj("olMap", ["removeInteraction"]);
      service["drawInteractions"].set(mapIndex, new Draw({ type: "Polygon" }));
      spyOn(coreMapService, "getMap").and.returnValue(fakeMap);
      spyOn(coreMapService, "checkMapIndex").and.returnValue(true);

      service.deleteDrawInteraction(mapIndex);
      expect(fakeMap.removeInteraction).toHaveBeenCalled();
      expect(service["drawInteractions"].size).toEqual(0);
    });
  });

  describe("deleteLayer", () => {
    it("should delete the layer from the map", () => {
      const vectorLayer = createVectorLayer();
      spyOn(coreMapService, "createLayerAndAddToMap").and.returnValue(
        vectorLayer
      );
      spyOn(vectorLayer, "setMap").and.stub();

      coreDrawLayerService.getDrawLayer(layerName, mapIndex);
      expect(coreDrawLayerService["drawLayers"].size)
        .withContext("DrawLayer should be added to map")
        .toEqual(1);

      service.deleteLayer(layerName, mapIndex);
      expect(coreDrawLayerService["drawLayers"].size)
        .withContext("DrawLayers map should be empty")
        .toEqual(0);
      expect(vectorLayer.setMap).toHaveBeenCalled();
    });
  });

  describe("finishCurrentDraw", () => {
    it("should mark the drawing as finished", () => {
      const draw = new Draw({ type: "Polygon" });
      service["drawInteractions"].set(mapIndex, draw);

      service["validLineStringOrPolygon"] = true;
      spyOn(draw, "finishDrawing").and.callThrough();

      service.finishCurrentDraw(mapIndex);
      expect(draw.finishDrawing).toHaveBeenCalled();
    });
  });

  describe("startDrawInteraction", () => {
    it("should create DRAW layer, interaction and subject and a number of methods to prepare for drawing is called", () => {
      const stopDrawSpy = spyOn<any>(service, "stopDraw").and.stub();
      const setLayerVisibilitySpy = spyOn<any>(
        service,
        "setLayerVisibility"
      ).and.stub();
      const decideAndGetStylesSpy = spyOn<any>(
        service,
        "decideAndGetStyles"
      ).and.returnValue(undefined);
      const startSnapAgainIfExistsSpy = spyOn(
        coreSnapService,
        // @ts-ignore
        "startSnapAgainIfExists"
      );
      spyOn(coreMapService, "createLayerAndAddToMap").and.callFake(
        createVectorLayer
      );

      service.startDraw(
        layerName,
        mapIndex,
        MapComponentDrawTypes.RECTANGLE,
        {}
      );
      expect(service["drawInteractions"].size)
        .withContext("drawInteractions size should be 1")
        .toBe(1);
      expect(coreDrawLayerService["drawLayers"].size)
        .withContext("drawLayers size should be 1")
        .toBe(1);

      expect(service["drawEndListenerMap"].has(mapIndex)).toBe(true);
      expect(stopDrawSpy).toHaveBeenCalled();
      expect(setLayerVisibilitySpy).toHaveBeenCalled();
      expect(decideAndGetStylesSpy).toHaveBeenCalled();
      expect(startSnapAgainIfExistsSpy).toHaveBeenCalled();
    });

    it("should pass maxPoints to the drawInteraction if set", (done) => {
      service["modifyEventsMap"].getOrCreateSubject(mapIndex);
      const map = coreMapService.getMap(mapIndex);
      const func = map.addInteraction;
      const addInteractionSpy = spyOn(map, "addInteraction").and.callFake(
        (draw) => {
          func.call(map, draw);
          // Draw interaction does not give access to the options
          expect((draw as any)["maxPoints_"]).toEqual(42);
          done();
        }
      );
      service.startDraw(layerName, mapIndex, MapComponentDrawTypes.POLYGON, {
        maxPoints: 42
      });
      expect(addInteractionSpy).toHaveBeenCalled();
    });

    it("should do tracing stuff if Trace object is passed as a parameter", (done) => {
      const vLayer = jasmine.createSpyObj("VectorLayer", ["getSource"]);
      vLayer.getSource.and.returnValue(new VectorSource());
      spyOn(coreMapService, "getLayer").and.returnValue(vLayer);

      const addTracingSpy = spyOn<any>(service, "addTracing");
      const addSnappingForTracingSpy = spyOn<any>(
        service,
        "addSnappingForTracing"
      );

      service.startDraw(layerName, mapIndex, MapComponentDrawTypes.POLYGON, {
        maxPoints: 42
      });

      expect(addTracingSpy).toHaveBeenCalledTimes(1);
      expect(addSnappingForTracingSpy).toHaveBeenCalledTimes(1);
      done();
    });

    it("should NOT do tracing stuff if Trace object is NOT passed as a parameter", (done) => {
      const vLayer = jasmine.createSpyObj("VectorLayer", ["getSource"]);
      vLayer.getSource.and.returnValue(new VectorSource());
      spyOn(coreMapService, "getLayer").and.returnValue(vLayer);

      const addTracingSpy = spyOn<any>(service, "addTracing");
      const addSnappingForTracingSpy = spyOn<any>(
        service,
        "addSnappingForTracing"
      );

      service.startDraw(layerName, mapIndex, MapComponentDrawTypes.POLYGON, {
        maxPoints: 42
      });

      expect(addTracingSpy).toHaveBeenCalledTimes(0);
      expect(addSnappingForTracingSpy).toHaveBeenCalledTimes(0);
      done();
    });

    it("should NOT do tracing stuff if Trace object is passed AND centreDraw is true", (done) => {
      const vLayer = jasmine.createSpyObj("VectorLayer", ["getSource"]);
      vLayer.getSource.and.returnValue(new VectorSource());
      spyOn(coreMapService, "getLayer").and.returnValue(vLayer);

      const addTracingSpy = spyOn<any>(service, "addTracing");
      const addSnappingForTracingSpy = spyOn<any>(
        service,
        "addSnappingForTracing"
      );

      service.startDraw(layerName, mapIndex, MapComponentDrawTypes.POLYGON, {
        centerDraw: true,
        maxPoints: 42
      });

      expect(addTracingSpy).toHaveBeenCalledTimes(0);
      expect(addSnappingForTracingSpy).toHaveBeenCalledTimes(0);
      done();
    });

    it("should NOT finish a drawInteraction if a LineString has less than 2 points on finish by double click", () => {
      const lineString = new Feature(new LineString([[1, 1]]));

      const isValid = (service as any).isValidOnFinishByDoubleClick(lineString);
      expect(isValid).toBe(false);
    });

    it("should finish a drawInteraction if a LineString has 2 or more points on finish by double click", () => {
      const lineString = new Feature(
        new LineString([
          [1, 1],
          [1, 2]
        ])
      );

      const isValid = (service as any).isValidOnFinishByDoubleClick(lineString);
      expect(isValid).toBe(true);
    });

    it("should NOT finish a drawInteraction if a LineString has less than 2 points on finish by method", () => {
      const lineString = new Feature(
        new LineString([
          [1, 1],
          [1, 2]
        ])
      );

      const isValid = (service as any).isValidOnFinishByMethod(lineString);
      expect(isValid).toBe(false);
    });

    it("should finish a drawInteraction if a LineString has 2 or more points on finish by method", () => {
      const lineString = new Feature(
        new LineString([
          [1, 1],
          [1, 2],
          [2, 2]
        ])
      );

      const isValid = (service as any).isValidOnFinishByMethod(lineString);
      expect(isValid).toBe(true);
    });

    it("should NOT finish a drawInteraction if a Polygon less than 3 points on finish by double click", () => {
      const polygon = new Feature(
        new Polygon([
          [
            [1, 1],
            [1, 2],
            [1, 1]
          ]
        ])
      );

      const isValid = (service as any).isValidOnFinishByDoubleClick(polygon);
      expect(isValid).toBe(false);
    });

    it("should finish a drawInteraction if a Polygon has 3 or more points on finish by double click", () => {
      const polygon = new Feature(
        new Polygon([
          [
            [1, 1],
            [1, 2],
            [2, 2],
            [1, 1]
          ]
        ])
      );

      const isValid = (service as any).isValidOnFinishByDoubleClick(polygon);
      expect(isValid).toBe(true);
    });

    it("should NOT finish a drawInteraction if a Polygon has less than 3 points on finish by method", () => {
      const polygon = new Feature(
        new Polygon([
          [
            [1, 1],
            [1, 2],
            [2, 2],
            [3, 1],
            [1, 1]
          ]
        ])
      );

      const isValid = (service as any).isValidOnFinishByMethod(polygon);
      expect(isValid).toBe(true);
    });

    it("should NOT finish a drawInteraction if a Polygon has less than 3 points on finish by method", () => {
      const polygon = new Feature(
        new Polygon([
          [
            [1, 1],
            [1, 2],
            [2, 2],
            [1, 1]
          ]
        ])
      );

      const isValid = (service as any).isValidOnFinishByMethod(polygon);
      expect(isValid).toBe(false);
    });
  });

  describe("startModify", () => {
    it("should activate modifyInteractions when there are features on the layer", (done) => {
      expect(service["modifyInteractions"].size).toBe(0);
      const stopModifySpy = spyOn(service, "stopModify");
      spyOn(coreDrawLayerService, "getDrawLayer").and.callFake(
        createVectorLayer
      );

      const getMapMock = {
        addInteraction: () => {}
      };

      service["modifyEventsMap"].getOrCreateSubject(mapIndex);

      const getMapSpy = spyOn(coreMapService, "getMap").and.returnValue(
        getMapMock as unknown as OlMap
      );
      const addInteractionSpy = spyOn(
        getMapMock,
        "addInteraction"
      ).and.callThrough();

      service.startModify(layerName, mapIndex, {}, undefined, undefined);

      expect(service["modifyInteractions"].size).toBe(1);
      expect(stopModifySpy).toHaveBeenCalled();
      expect(getMapSpy).toHaveBeenCalled();
      expect(addInteractionSpy).toHaveBeenCalled();

      service.getModifyEventsObservable(mapIndex).subscribe((evt) => {
        expect(evt.type).toBe(ModifyInteractionEventTypes.MODIFYEND);
        done();
      });
      (service["modifyInteractions"].get(mapIndex) as Modify).dispatchEvent(
        "modifyend"
      );
    });

    it("should create listener and interaction for DEFAULT mapIndex and call startSnapAgainIfExists", () => {
      const stopModifySpy = spyOn(service, "stopModify");
      expect(service["modifyInteractions"].size).toBe(0);
      const setLayerVisibilitySpy = spyOn<any>(service, "setLayerVisibility");
      const startSnapAgainIfExistsSpy = spyOn(
        coreSnapService,
        // @ts-ignore
        "startSnapAgainIfExists"
      );
      spyOn(coreMapService, "createLayerAndAddToMap").and.callFake(
        createVectorLayer
      );

      service.startModify(layerName, mapIndex, {}, undefined, undefined);

      expect(stopModifySpy).toHaveBeenCalled();
      expect(setLayerVisibilitySpy).toHaveBeenCalled();
      expect(service["modifyListenersMap"].has(mapIndex))
        .withContext(`modifyListenersMap should have key "${mapIndex}"`)
        .toBe(true);
      expect(service["modifyEventsMap"].has(mapIndex))
        .withContext(`modifyEventsMap should have key "${mapIndex}"`)
        .toBe(true);
      expect(coreDrawLayerService["drawLayers"].has(`${mapIndex}-${layerName}`))
        .withContext(`Drawlayers should have key "${mapIndex}-${layerName}"`)
        .toBe(true);
      expect(service["modifyInteractions"].size).toBe(1);
      expect(startSnapAgainIfExistsSpy).toHaveBeenCalled();
    });

    it("stopModifyInteraction, should remove listener and interaction for DEFAULT mapIndex", () => {
      service["modifyListenersMap"].set(mapIndex, [{} as EventsKey]);
      service["modifyInteractions"].set(mapIndex, {} as Modify);
      spyOn(coreDrawLayerService, "getDrawLayer").and.callFake(
        createVectorLayer
      );
      const modify = {} as Modify;
      const modifyInteractionsMap = spyOn(
        service["modifyInteractions"],
        "get"
      ).and.returnValue(modify);
      const map: OlMap = coreMapService.createAndGetMap();
      const getMapSpy = spyOn(coreMapService, "getMap").and.returnValue(map);
      const removeInteractionFromMapSpy = spyOn(map, "removeInteraction");

      expect(service["modifyListenersMap"].size).toBe(1);
      expect(service["modifyInteractions"].size).toBe(1);

      service.stopModify(mapIndex);

      expect(service["modifyListenersMap"].size).toBe(0);
      expect(service["modifyInteractions"].size).toBe(0);
      expect(modifyInteractionsMap).toHaveBeenCalled();
      expect(getMapSpy).toHaveBeenCalledWith(mapIndex);
      expect(removeInteractionFromMapSpy).toHaveBeenCalledWith(modify);
    });
  });

  describe("move features", () => {
    const events = new Map<string, () => object>();
    const div = document.createElement("div");
    let getMapMock: Record<string, any>;
    let getMapSpy: Spy;

    beforeEach(() => {
      events.clear();
      getMapMock = {
        addInteraction: () => null,
        removeInteraction: () => null,
        forEachFeatureAtPixel: () => null,
        on: (name: string, cb: () => object) => {
          events.set(name, cb);
        },
        getViewport() {
          return div;
        }
      };
      spyOn(coreDrawLayerService, "getDrawLayer").and.callFake(
        createVectorLayer
      );

      service["modifyEventsMap"].getOrCreateSubject(mapIndex);

      getMapSpy = spyOn(coreMapService, "getMap").and.returnValue(
        getMapMock as unknown as OlMap
      );
    });

    it("should activate move features", (done) => {
      expect(service["moveInteractions"].size).toBe(0);
      const stopMoveSpy = spyOn(service, "stopMove");
      const stopDrawSpy = spyOn(service, "stopDraw");
      const stopModifySpy = spyOn(service, "stopModify");
      const addInteractionSpy = spyOn(
        getMapMock,
        "addInteraction"
      ).and.callThrough();

      service.startMove(layerName, mapIndex, {});

      expect(service["moveInteractions"].size).toBe(1);
      expect(stopMoveSpy).toHaveBeenCalled();
      expect(stopDrawSpy).toHaveBeenCalled();
      expect(stopModifySpy).toHaveBeenCalled();
      expect(addInteractionSpy).toHaveBeenCalled();

      service.getModifyEventsObservable(mapIndex).subscribe((evt) => {
        expect(evt.type).toBe(ModifyInteractionEventTypes.MOVEEND);
        expect(div.style.cursor).toEqual("grab");
        done();
      });
      (service["moveInteractions"].get(mapIndex) as Translate).dispatchEvent(
        "translateend"
      );
    });

    it("should not check each pixel when translating", () => {
      service.startMove(layerName, mapIndex, {});
      (service["moveInteractions"].get(mapIndex) as Translate).dispatchEvent(
        "translatestart"
      );

      expect(div.style.cursor).toEqual("grabbing");
      const moveListener = events.get("pointermove");
      const forEachFeatureAtPixelSpy = spyOn(
        getMapMock,
        "forEachFeatureAtPixel"
      ).and.stub();
      expect(moveListener).not.toBeUndefined();
      if (moveListener) {
        moveListener();
        expect(forEachFeatureAtPixelSpy).not.toHaveBeenCalled();
      }
    });

    it("should stop the move features", () => {
      const move = new Translate();
      service["moveListenersMap"].set(mapIndex, [{} as EventsKey]);
      service["moveInteractions"].set(mapIndex, move);

      const removeInteractionFromMapSpy = spyOn(
        getMapMock,
        "removeInteraction"
      );

      expect(service["moveListenersMap"].size).toBe(1);
      expect(service["moveInteractions"].size).toBe(1);

      service.stopMove(mapIndex);

      expect(service["moveListenersMap"].size).toBe(0);
      expect(service["moveInteractions"].size).toBe(0);
      expect(getMapSpy).toHaveBeenCalledWith(mapIndex);
      expect(removeInteractionFromMapSpy).toHaveBeenCalledWith(move);
    });
  });

  it("stopModifyInteraction, should remove interaction for DEFAULT mapIndex", () => {
    const snap = {} as Snap;
    coreSnapService["snapInteractions"].set(`${mapIndex}-${layerName}`, snap);
    const map: OlMap = coreMapService.createAndGetMap();
    const getMapSpy = spyOn(coreMapService, "getMap").and.returnValue(map);
    const removeInteractionFromMapSpy = spyOn(map, "removeInteraction");

    expect(coreSnapService["snapInteractions"].size).toBe(1);

    coreSnapService.stopSnap(mapIndex);

    expect(coreSnapService["snapInteractions"].size).toBe(0);
    expect(getMapSpy).toHaveBeenCalledWith(mapIndex);
    expect(removeInteractionFromMapSpy).toHaveBeenCalledWith(snap);
  });

  describe("create, clear, toggle and delete layer", () => {
    it("deleteLayer should delete drawlayer and setMap to null", () => {
      const layer = createVectorLayer();
      coreDrawLayerService["drawLayers"].set(`${mapIndex}-${layerName}`, layer);

      const spyLayersMap = spyOn(
        coreDrawLayerService["drawLayers"],
        "get"
      ).and.callThrough();
      expect(coreDrawLayerService["drawLayers"].size).toBe(1);

      service.deleteLayer(layerName, mapIndex);

      expect(spyLayersMap).toHaveBeenCalled();
      expect(coreDrawLayerService["drawLayers"].size).toBe(0);
    });

    it("toggleLayer(), should hide en show interaction layer", () => {
      const layer = createVectorLayer();
      const getDrawOrLayerSpy = spyOn<any>(
        coreDrawLayerService,
        "getDrawLayer"
      ).and.returnValue(layer);
      const setVisibilitySpy = spyOn(layer, "setVisible").and.callThrough();
      const map = new OlMap({});
      spyOn(coreMapService, "getMap").and.returnValue(map);

      service.toggleLayer(layerName, mapIndex);

      expect(getDrawOrLayerSpy).toHaveBeenCalled();
      expect(setVisibilitySpy).toHaveBeenCalledWith(false);

      service.toggleLayer(layerName, mapIndex);

      expect(getDrawOrLayerSpy).toHaveBeenCalledTimes(2);
      expect(setVisibilitySpy).toHaveBeenCalledWith(true);
    });
  });

  describe("get, create and delete interaction", () => {
    it("createDrawInteraction should add an interaction to the map and add it to the collection of drawInteractions", () => {
      const map: OlMap = coreMapService.createAndGetMap();
      const getMapSpy = spyOn(coreMapService, "getMap").and.returnValue(map);
      const addInteractionToMapSpy = spyOn(map, "addInteraction");
      const getDrawOrMeasureLayerSpy = spyOn(
        coreMapService,
        "createLayerAndAddToMap"
      ).and.callFake(createVectorLayer);
      const setDrawInteractionSpy = spyOn<any>(
        service["drawInteractions"],
        "set"
      ).and.callThrough();

      service["getDrawInteraction"](
        layerName,
        mapIndex,
        MapComponentDrawTypes.POINT
      );

      // Er wordt niet getest op 'type' van de DrawInteraction (in dit geval 'Point'), omdat na nadat de DrawInteraction is aangemaakt deze
      // niet meer te achterhalen valt. De overige functionaliteit van de methode wordt wel getest.

      expect(getDrawOrMeasureLayerSpy).toHaveBeenCalled();
      expect(getMapSpy).toHaveBeenCalledWith(mapIndex);
      expect(addInteractionToMapSpy).toHaveBeenCalled();
      expect(setDrawInteractionSpy).toHaveBeenCalled();
    });

    it("stopDrawInteraction, should remove listener and interaction for DEFAULT mapIndex", () => {
      service["drawEndListenerMap"].set(mapIndex, {} as EventsKey);
      service["drawInteractions"].set(mapIndex, new Draw({ type: "Polygon" }));
      const deleteDrawInteractionSpy = spyOn(service, "deleteDrawInteraction");

      expect(service["drawEndListenerMap"].size).toBe(1);

      service.stopDraw(mapIndex);

      expect(service["drawEndListenerMap"].size).toBe(0);
      expect(deleteDrawInteractionSpy).toHaveBeenCalledWith(mapIndex);
    });

    it("deleteDrawInteraction should delete drawInteraction", () => {
      service["drawInteractions"].set(mapIndex, new Draw({ type: "Polygon" }));

      expect(service["drawInteractions"].size).toBe(1);

      const getMapMock = {
        removeInteraction: () => {}
      };
      const getMapSpy = spyOn(coreMapService, "getMap").and.returnValue(
        getMapMock as unknown as OlMap
      );

      service.deleteDrawInteraction(mapIndex);

      expect(getMapSpy).toHaveBeenCalled();
      expect(service["drawInteractions"].size).toBe(0);
    });
  });

  describe("setDrawStyle", () => {
    it("should set method of styleFunctions", () => {
      const localStyleLikeMap = createStyleLikeMap();

      service.setDrawStyle(layerName, mapIndex, localStyleLikeMap);

      expect(service["drawStyleMap"].get(`${mapIndex}-${layerName}`)).toBe(
        localStyleLikeMap
      );
    });
  });

  describe("getDrawType", () => {
    it("should return 'none' when mesureoptions is empty", () => {
      expect(service.getDrawType({})).toEqual("none");
    });
    it("should return 'area' when mesureoptions is showArea", () => {
      expect(service.getDrawType({ showArea: true })).toEqual("area");
    });
    it("should return 'area' when mesureoptions is showArea and ShowTotalLength", () => {
      expect(
        service.getDrawType({ showArea: true, showTotalLength: true })
      ).toEqual("area");
    });
    it("should return 'area' when mesureoptions is showArea and showSegmentLength", () => {
      expect(
        service.getDrawType({ showArea: true, showSegmentLength: true })
      ).toEqual("area");
    });
    it("should return 'area' when mesureoptions is showArea and ShowTotalLength and showSegmentLength", () => {
      expect(
        service.getDrawType({
          showArea: true,
          showTotalLength: true,
          showSegmentLength: true
        })
      ).toEqual("area");
    });
    it("should return 'length' when mesureoptions is ShowTotalLength", () => {
      expect(service.getDrawType({ showTotalLength: true })).toEqual("length");
    });
    it("should return 'length' when mesureoptions is ShowTotalLength and showSegmentLength", () => {
      expect(
        service.getDrawType({ showTotalLength: true, showSegmentLength: true })
      ).toEqual("length");
    });
    it("should return 'none' when mesureoptions is showSegmentLength", () => {
      expect(service.getDrawType({ showSegmentLength: true })).toEqual("none");
    });
  });

  describe("DrawEnd events", () => {
    it("should emit a measuring event if the draw is ended and a measure option was given", (done) => {
      const draw = new Draw({ type: "Polygon" });

      // @ts-ignore
      spyOn(service, "getDrawInteraction").and.returnValue(draw);

      service.getDrawObservable(mapIndex).subscribe((event) => {
        expect(event.type).toEqual(DrawInteractionEventTypes.DRAWEND);
        expect(event.message).toEqual(`DrawEnd on ${layerName}`);
        done();
      });

      service.startDraw(layerName, mapIndex, MapComponentDrawTypes.POLYGON, {
        showSegmentLength: true
      });

      draw.dispatchEvent(new DrawEvent("drawend", new Feature()));
    });
    it("should have a measuring event with measurement 'none' and empty areaOrLength when no measure option was given", (done) => {
      const draw = new Draw({ type: "LineString" });

      // @ts-ignore
      spyOn(service, "getDrawInteraction").and.returnValue(draw);

      service.getDrawObservable(mapIndex).subscribe((event) => {
        expect(event.event.feature.get("measurement")).toEqual("none");
        expect(event.event.feature.get("areaOrLength")).toEqual("");
        done();
      });

      service.startDraw(layerName, mapIndex, MapComponentDrawTypes.LINESTRING);

      draw.dispatchEvent(new DrawEvent("drawend", new Feature()));
    });
    it("should have a measuring event with measurement 'length' and a filled areaOrLength when a length measure option was given", (done) => {
      const draw = new Draw({ type: "LineString" });

      // @ts-ignore
      spyOn(service, "getDrawInteraction").and.returnValue(draw);

      service.getDrawObservable(mapIndex).subscribe((event) => {
        expect(event.event.feature.get("measurement")).toEqual("length");
        expect(event.event.feature.get("areaOrLength")).toEqual("2.83 m");
        done();
      });

      service.startDraw(layerName, mapIndex, MapComponentDrawTypes.LINESTRING, {
        showTotalLength: true
      });

      draw.dispatchEvent(
        new DrawEvent(
          "drawend",
          new Feature(
            new LineString([
              [1, 2],
              [3, 4]
            ])
          )
        )
      );
    });
    it("should have a measuring event with measurement 'area' and a filled areaOrLength when a polygon measure option was given", (done) => {
      const draw = new Draw({ type: "Polygon" });

      // @ts-ignore
      spyOn(service, "getDrawInteraction").and.returnValue(draw);

      service.getDrawObservable(mapIndex).subscribe((event) => {
        expect(event.event.feature.get("measurement")).toEqual("area");
        expect(event.event.feature.get("areaOrLength")).toEqual("4 m2");
        done();
      });

      service.startDraw(layerName, mapIndex, MapComponentDrawTypes.POLYGON, {
        showArea: true
      });

      draw.dispatchEvent(
        new DrawEvent(
          "drawend",
          new Feature(
            new Polygon([
              [
                [1, 2],
                [1, 4],
                [3, 4],
                [3, 2]
              ]
            ])
          )
        )
      );
    });
  });

  describe("addStylingToFeature", () => {
    it("should add the 'finishDrawStyle' to the feature if a StyleLikeMap is found for the layer", () => {
      const feature = new Feature();
      const styleLikeMap = createStyleLikeMap();
      spyOn(service["drawStyleMap"], "get").and.returnValue(styleLikeMap);

      service["addStylingToFeature"]("", "", feature);

      const style = feature.getStyle();
      expect(style).toEqual(styleLikeMap.finishDrawStyle);
    });

    it("should NOT add the 'finishDrawStyle' to the feature if a StyleLikeMap isn't found for the layer", () => {
      const feature = new Feature();
      spyOn(service["drawStyleMap"], "get").and.returnValue(undefined);

      service["addStylingToFeature"]("", "", feature);

      const style = feature.getStyle();
      expect(style).toBeNull();
    });
  });

  describe("createDrawObject", () => {
    it("should create a Draw-object if centerDraw is undefined or false", () => {
      const layerName = "testLayer";
      const mapIndex = "map1";
      const geometryType = "Polygon";
      const options = {
        showArea: true
      };
      const result = service["createDrawObject"](
        layerName,
        mapIndex,
        geometryType,
        undefined,
        options
      );
      expect(result).toBeInstanceOf(Draw);
    });
    it("should create a CenterDraw-object if centerDraw is true", () => {
      const layerName = "testLayer";
      const mapIndex = "map2";
      const geometryType = "Point";
      const options = {
        centerDraw: true
      };
      const mockStyleLikeMap: any = { drawDrawStyle: "style" };
      const result = service["createDrawObject"](
        layerName,
        mapIndex,
        geometryType,
        mockStyleLikeMap,
        options
      );
      expect(result).toBeInstanceOf(CenterDraw);
    });

    it("should add a geometryFunction correctly to a Draw Interaction", () => {
      const layerName = "testLayer";
      const mapIndex = "map3";
      const geometryType = "LineString";
      const geoFunction: GeometryFunction = (coordinates, geometry) => {
        if (!geometry) {
          geometry = new Point(coordinates as Coordinate);
        }
        geometry.setCoordinates(coordinates);
        return geometry;
      };
      const result = service["createDrawObject"](
        layerName,
        mapIndex,
        geometryType,
        undefined,
        {},
        geoFunction
      );
      expect(result).toBeInstanceOf(Draw);
      expect((result as Draw)["geometryFunction_"]).toBe(geoFunction);
    });
  });

  describe("center modify", () => {
    it("should remove active interaction and add CenterModify", () => {
      const mapIndex = "map-1";
      const layerName = "layer-1";
      const map = new OlMap({
        view: new View({
          center: [100, 100],
          zoom: 10
        })
      });

      spyOn(service, "removeActiveCenterInteraction");
      spyOn(coreMapService, "getMap").and.returnValue(map);

      const result = service.startCenterModify(layerName, mapIndex);

      expect((service as any).activeCenterInteraction).toBe(result);
      expect((service as any).modifyInteractions.get(mapIndex)).toBe(result);
    });

    it("should start modify current point", () => {
      const map = new OlMap({
        view: new View({ center: [100, 100] })
      });
      spyOn(coreMapService, "getMap").and.returnValue(map);

      const centerModify: CenterModify = service.startCenterModify(
        "Kees",
        "index200"
      );

      const startModspy = spyOn(centerModify as any, "startModifyCurrentPoint");
      service.startCenterModifyCurrentPoint();
      expect(startModspy).toHaveBeenCalled();
    });

    it("should cleanup and remove active center interaction", () => {
      const interaction = jasmine.createSpyObj("CenterBase", ["cleanup"]);
      service["activeCenterInteraction"] = interaction;

      service.removeActiveCenterInteraction("map-1");

      expect(interaction.cleanup).toHaveBeenCalled();
    });
  });
});

function createVectorLayer(): VectorLayer<VectorSource<Feature<Geometry>>> {
  return new VectorLayer({
    source: new VectorSource()
  });
}

function createStyleLikeMap(): StyleLikeMap {
  return {
    finishDrawStyle: customFinishDrawStyle,
    drawingDrawStyle: customDrawStyle
  };
}

function createDrawInteraction(): Draw {
  return new Draw({
    type: "LineString"
  });
}
