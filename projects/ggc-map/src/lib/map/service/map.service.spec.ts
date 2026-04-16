import { TestBed } from "@angular/core/testing";
import { Coordinate } from "ol/coordinate";
import { Extent } from "ol/extent";
import { Geometry } from "ol/geom";
import Polygon from "ol/geom/Polygon";
import OlMap from "ol/Map";
import MapBrowserEvent from "ol/MapBrowserEvent";
import { Style } from "ol/style";
import { FitOptions } from "ol/View";
import { GgcCrsConfigService } from "../../core/service/ggc-crs-config.service";
import { MapComponentEventTypes } from "../../model/map-component-event.model";
import { CoreMapService } from "./core-map.service";
import { GgcMapService } from "./ggc-map.service";
import { provideZoneChangeDetection } from "@angular/core";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";

describe("MapService", () => {
  let mapService: GgcMapService;
  let coreMapService: CoreMapService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GgcMapService,
        CoreMapService,
        GgcCrsConfigService,
        provideZoneChangeDetection()
      ]
    });

    mapService = TestBed.inject(GgcMapService);
    coreMapService = TestBed.inject(CoreMapService);
  });

  it("should be created", () => {
    expect(mapService).toBeTruthy();
    expect(coreMapService["extraLayers"]).toEqual(["selection", "highlight"]);
  });

  it("should return the layer", () => {
    spyOn(coreMapService, "getLayer");
    mapService.getLayer("my-layer");
    expect(coreMapService.getLayer).toHaveBeenCalledWith(
      "my-layer",
      DEFAULT_MAPINDEX
    );
  });

  it("should return the extra layer", () => {
    spyOn(coreMapService, "getExtraLayer");
    mapService.getExtraLayer("selection");
    expect(coreMapService.getExtraLayer).toHaveBeenCalledWith(
      "selection",
      DEFAULT_MAPINDEX
    );
  });

  describe("zoomToCoordinate", () => {
    it("should zoom to the coordinate", () => {
      let coords: Extent | undefined;
      const getViewMock = {
        isRendered(): boolean {
          return true;
        },
        getView() {
          return {
            fit(crds: Extent) {
              coords = crds;
            }
          };
        }
      } as OlMap;

      spyOn(coreMapService, "checkMapIndex").and.returnValue(true);
      spyOn(coreMapService, "getMap").and.returnValue(getViewMock);

      mapService.zoomToCoordinate([12, 34]);

      expect(coords).toEqual([12, 34, 12, 34]);
    });

    it("should not zoom if the map does not exist", () => {
      const getViewMock = {
        getView(_crds: Extent) {}
      };
      const checkMapIndexSpy = spyOn(
        coreMapService,
        "checkMapIndex"
      ).and.returnValue(false);
      const getMapSpy = spyOn(coreMapService, "getMap").and.returnValue(
        getViewMock as OlMap
      );
      mapService.zoomToCoordinate([12, 34], "bestaat_niet", 14);

      expect(getMapSpy).not.toHaveBeenCalled();
      expect(checkMapIndexSpy).toHaveBeenCalled();
    });
  });

  describe("zoomToPdok", () => {
    it("zoomToPdokResult, when called with not existing map, it should not zoom.", () => {
      const getViewMock = {
        getView(_crds: Extent) {}
      };
      const checkMapIndexSpy = spyOn(
        coreMapService,
        "checkMapIndex"
      ).and.returnValue(false);
      const getMapSpy = spyOn(coreMapService, "getMap").and.returnValue(
        getViewMock as OlMap
      );
      mapService.zoomToPdokResult({}, "bestaat_niet", 14);

      expect(getMapSpy).not.toHaveBeenCalled();
      expect(checkMapIndexSpy).toHaveBeenCalled();
    });

    it("zoomToPdokResult with type woonplaats, it should fit() with coords", () => {
      let coords: Extent | undefined;
      const getViewMock = {
        getView() {
          return {
            fit(crds: Extent) {
              coords = crds;
            }
          };
        }
      } as OlMap;
      const pdokResult = {
        value: {
          numFound: 1,
          start: 0,
          maxScore: 15.697881,
          docs: [
            {
              geometrie_rd: "POLYGON ((3 1, 2 3, 1 2, 3 1))",
              type: "woonplaats"
            }
          ]
        }
      };
      const checkMapIndexSpy = spyOn(
        coreMapService,
        "checkMapIndex"
      ).and.returnValue(true);
      const getMapSpy = spyOn(coreMapService, "getMap").and.returnValue(
        getViewMock
      );

      mapService.zoomToPdokResult(pdokResult);

      expect(checkMapIndexSpy).toHaveBeenCalled();
      expect(getMapSpy).toHaveBeenCalled();
      expect(coords?.length).toBe(4);
    });

    it("zoomToPdokResult with type perceel and only a geometry centroide, it should zoom to the centroide", () => {
      let coords: Extent | undefined;
      const getViewMock = {
        getView() {
          return {
            fit(crds: Extent) {
              coords = crds;
            }
          };
        }
      } as OlMap;
      const pdokResult = {
        value: {
          numFound: 1,
          start: 0,
          maxScore: 15.697881,
          docs: [
            {
              type: "perceel",
              centroide_rd: "POINT(232010.153 480022.401)"
            }
          ]
        }
      };
      const checkMapIndexSpy = spyOn(
        coreMapService,
        "checkMapIndex"
      ).and.returnValue(true);
      const getMapSpy = spyOn(coreMapService, "getMap").and.returnValue(
        getViewMock
      );

      mapService.zoomToPdokResult(pdokResult);

      expect(checkMapIndexSpy).toHaveBeenCalled();
      expect(getMapSpy).toHaveBeenCalled();
      expect(coords?.length).toBe(4);
    });

    it("zoomToPdokResult with a pdokResult without Geometrie or Centroide, it should dispatch an event with type unsuccessful", () => {
      const pdokResult = {
        value: {
          numFound: 1,
          start: 0,
          maxScore: 15.697881,
          docs: [
            {
              type: "perceel"
            }
          ]
        }
      };
      const checkMapIndexSpy = spyOn(
        coreMapService,
        "checkMapIndex"
      ).and.returnValue(true);

      const ggcMapEvent = mapService.zoomToPdokResult(pdokResult);

      expect(checkMapIndexSpy).toHaveBeenCalled();
      expect(ggcMapEvent.type).toBe(MapComponentEventTypes.UNSUCCESSFUL);
      expect(ggcMapEvent.message).toBe(
        "Coordinaat voor zoomToPdokResult op de kaart kon niet worden bepaald"
      );
    });

    it("zoomToPdokResultAndSimulateClick, it should zoom en dispatch an event", () => {
      const checkMapIndexSpy = spyOn(
        coreMapService,
        "checkMapIndex"
      ).and.returnValue(true);

      let browserEvent: MapBrowserEvent | undefined;
      const dispatchEventFunction = {
        dispatchEvent(evt: MapBrowserEvent) {
          browserEvent = evt;
        },
        getPixelFromCoordinate: () => {
          // return dummy pixel
          return [123, 456];
        }
      };

      const zoomToPdokResultWithZoomOptionsSpy = spyOn(
        mapService,
        "zoomToPdokResultWithZoomOptions"
      ).and.stub();
      const getCentroidRdSpy = spyOn(
        mapService,
        "getCentroidRdFromPdokResult"
      ).and.returnValue([126, 1812]);
      const getMapSpy = spyOn(coreMapService, "getMap").and.returnValue(
        dispatchEventFunction as unknown as OlMap
      );

      mapService.zoomToPdokResultAndSimulateClick({});

      expect(checkMapIndexSpy).toHaveBeenCalled();
      expect(zoomToPdokResultWithZoomOptionsSpy).toHaveBeenCalled();
      expect(getCentroidRdSpy).toHaveBeenCalled();
      expect(getMapSpy).toHaveBeenCalled();
      expect(browserEvent?.coordinate[0]).toBe(126);
      expect(browserEvent?.coordinate[1]).toBe(1812);
      expect(browserEvent?.pixel[0]).toBe(123);
      expect(browserEvent?.pixel[1]).toBe(456);
      // we are testing with a Spy, so the map wil be the return value of getMap();
      expect(browserEvent?.map).toBe(coreMapService.getMap());
      expect(browserEvent?.type).toBe("singleclick");
    });

    it("zoomToPdokResultAndSimulateClick, when centroide_rd is not fout, it should dispatch an event with type unsuccessful", () => {
      const checkMapIndexSpy = spyOn(
        coreMapService,
        "checkMapIndex"
      ).and.returnValue(true);

      const zoomToPdokResultWithZoomOptionsSpy = spyOn(
        mapService,
        "zoomToPdokResultWithZoomOptions"
      ).and.stub();
      const getCentroidRdSpy = spyOn(
        mapService,
        "getCentroidRdFromPdokResult"
      ).and.returnValue(undefined);

      const ggcMapEvent = mapService.zoomToPdokResultAndSimulateClick({});

      expect(checkMapIndexSpy).toHaveBeenCalled();
      expect(zoomToPdokResultWithZoomOptionsSpy).toHaveBeenCalled();
      expect(getCentroidRdSpy).toHaveBeenCalled();
      expect(ggcMapEvent.type).toBe(MapComponentEventTypes.UNSUCCESSFUL);
      expect(ggcMapEvent.message).toBe(
        "Coordinaat voor simuleren klik op de kaart kon niet worden bepaald"
      );
    });

    it(
      "zoomToPdokResultAndMark, when called it should zoom, clear highlightlayer," +
        " add feature to highlightlayer and mark the feature given from the search event",
      () => {
        const pdokResult = {
          value: {
            numFound: 1,
            start: 0,
            maxScore: 15.697881,
            docs: [
              {
                geometrie_rd: "POLYGON ((3 1, 2 3, 1 2, 3 1))",
                type: "woonplaats"
              }
            ]
          }
        };

        const zoomToPdokResultWithZoomOptionsSpy = spyOn(
          mapService,
          "zoomToPdokResultWithZoomOptions"
        ).and.stub();
        const checkMapIndexSpy = spyOn(
          coreMapService,
          "checkMapIndex"
        ).and.returnValue(true);
        const decideMapComponentEventTypeSpy = spyOn(
          coreMapService,
          "decideMapComponentEventType"
        );
        const clearHighlightlayerSpy = spyOn(
          mapService,
          "clearHighlightLayer"
        ).and.stub();
        const addFeaturesToHighlightLayerSpy = spyOn(
          mapService,
          "addFeaturesToHighlightLayer"
        ).and.stub();

        mapService.zoomToPdokResultAndMark(pdokResult);

        expect(checkMapIndexSpy).toHaveBeenCalled();
        expect(decideMapComponentEventTypeSpy).toHaveBeenCalledWith(
          true,
          undefined
        );
        expect(zoomToPdokResultWithZoomOptionsSpy).toHaveBeenCalledWith(
          pdokResult,
          { mapIndex: undefined, fitOptions: { maxZoom: undefined } }
        );
        expect(clearHighlightlayerSpy).toHaveBeenCalled();
        expect(addFeaturesToHighlightLayerSpy).toHaveBeenCalled();
      }
    );

    it("zoomToPdokResultAndMark with type perceel and only a geometry centroide , it should zoom to the centroide", () => {
      const pdokResult = {
        value: {
          numFound: 1,
          start: 0,
          maxScore: 15.646068,
          docs: [
            {
              type: "perceel",
              centroide_rd: "POINT(232010.153 480022.401)"
            }
          ]
        }
      };

      const zoomToPdokResultWithZoomOptionsSpy = spyOn(
        mapService,
        "zoomToPdokResultWithZoomOptions"
      ).and.stub();
      const checkMapIndexSpy = spyOn(
        coreMapService,
        "checkMapIndex"
      ).and.returnValue(true);
      const decideMapComponentEventTypeSpy = spyOn(
        coreMapService,
        "decideMapComponentEventType"
      );
      const clearHighlightlayerSpy = spyOn(
        coreMapService,
        "clearHighlightLayer"
      ).and.stub();
      const addFeaturesToHighlightLayerSpy = spyOn(
        coreMapService,
        "addFeaturesToHighlightLayer"
      ).and.stub();

      mapService.zoomToPdokResultAndMark(pdokResult);

      expect(checkMapIndexSpy).toHaveBeenCalled();
      expect(decideMapComponentEventTypeSpy).toHaveBeenCalledWith(
        true,
        undefined
      );
      expect(zoomToPdokResultWithZoomOptionsSpy).toHaveBeenCalledWith(
        pdokResult,
        { mapIndex: undefined, fitOptions: { maxZoom: undefined } }
      );
      expect(clearHighlightlayerSpy).toHaveBeenCalled();
      expect(addFeaturesToHighlightLayerSpy).toHaveBeenCalled();
    });

    it("zoomToPdokResultAndMark, when called with non-existing mapindex the method should not execute other methods.", () => {
      const pdokResult = {};

      const zoomToPdokResultSpy = spyOn(
        mapService,
        "zoomToPdokResult"
      ).and.stub();
      const checkMapIndexSpy = spyOn(
        coreMapService,
        "checkMapIndex"
      ).and.returnValue(false);
      const clearHighlightlayerSpy = spyOn(
        mapService,
        "clearHighlightLayer"
      ).and.stub();
      const addFeaturesToHighlightLayerSpy = spyOn(
        mapService,
        "addFeaturesToHighlightLayer"
      ).and.callThrough();
      const decideMapComponentEventTypeSpy = spyOn(
        coreMapService,
        "decideMapComponentEventType"
      );

      mapService.zoomToPdokResultAndMark(pdokResult, "a", 14);

      expect(checkMapIndexSpy).toHaveBeenCalled();
      expect(zoomToPdokResultSpy).not.toHaveBeenCalled();
      expect(clearHighlightlayerSpy).not.toHaveBeenCalled();
      expect(addFeaturesToHighlightLayerSpy).not.toHaveBeenCalled();
      expect(decideMapComponentEventTypeSpy).toHaveBeenCalledWith(false, "a");
    });

    it(
      "zoomToPdokResultAndMark with a pdokResult without Geometrie or Centroide, " +
        "it should dispatch an event with type unsuccessful ",
      () => {
        const pdokResult = {
          value: {
            numFound: 1,
            start: 0,
            maxScore: 15.697881,
            docs: [
              {
                type: "perceel"
              }
            ]
          }
        };
        const checkMapIndexSpy = spyOn(
          coreMapService,
          "checkMapIndex"
        ).and.returnValue(true);

        const ggcMapEvent = mapService.zoomToPdokResultAndMark(pdokResult);

        expect(checkMapIndexSpy).toHaveBeenCalled();
        expect(ggcMapEvent.type).toBe(MapComponentEventTypes.UNSUCCESSFUL);
        expect(ggcMapEvent.message).toBe(
          "Coordinaat voor zoomToPdokResultAndMark op de kaart kon niet worden bepaald"
        );
      }
    );
  });

  describe("getCentroidRdFromPdokResult", () => {
    it("when pdok result contains centroide_rd, it should return a Coordinate", () => {
      const pdokResult = {
        value: {
          numFound: 1,
          start: 0,
          maxScore: 15.697881,
          docs: [
            {
              centroide_rd: "POINT(123 456)"
            }
          ]
        }
      };

      const coord = mapService.getCentroidRdFromPdokResult(
        pdokResult
      ) as Coordinate;

      expect(coord[0]).toBe(123);
      expect(coord[1]).toBe(456);
    });

    it("when pdok result does not contain centroide_rd, it should return undefinded", () => {
      const pdokResult = {
        value: {
          numFound: 1,
          start: 0,
          maxScore: 15.697881,
          docs: [
            {
              test: "geen centroide"
            }
          ]
        }
      };

      const coord = mapService.getCentroidRdFromPdokResult(pdokResult);

      expect(coord).toBeUndefined();
    });
  });

  describe("getGeometryRdFromPdokResult", () => {
    it("getGeometryFromPdokResult should return a Geometry when pdok result contains geometrie_rd", () => {
      const pdokResult = {
        value: {
          numFound: 1,
          start: 0,
          maxScore: 15.697881,
          docs: [
            {
              geometrie_rd: "POLYGON ((3 1, 2 3, 1 2, 3 1))"
            }
          ]
        }
      };

      const geometryFromPdokResult: Geometry =
        mapService.getGeometryFromPdokResult(pdokResult) as Geometry;

      expect(geometryFromPdokResult).toEqual(jasmine.any(Polygon));
      const polygon = geometryFromPdokResult as Polygon;
      expect(polygon.getFlatCoordinates()).toEqual([3, 1, 2, 3, 1, 2, 3, 1]);
    });

    it("getGeometryFromPdokResult should return undefinded when pdok result does not contain geometrie_rd", () => {
      const pdokResult = {
        value: {
          numFound: 1,
          start: 0,
          maxScore: 15.697881,
          docs: [
            {
              test: "geen geometry"
            }
          ]
        }
      };

      const geometryFromPdokResult =
        mapService.getGeometryFromPdokResult(pdokResult);

      expect(geometryFromPdokResult).toBeUndefined();
    });
  });

  describe("zoomToGeometry", () => {
    let extent: Extent | undefined;
    let options: FitOptions | undefined;
    const getViewMock = {
      getView() {
        return {
          fit(crds: Extent, opt?: FitOptions) {
            extent = crds;
            options = opt;
          }
        };
      }
    } as OlMap;

    const setupSpies = (mapIndexValue: boolean) => {
      spyOn(coreMapService, "checkMapIndex").and.returnValue(mapIndexValue);
      spyOn(coreMapService, "decideMapComponentEventType");
      spyOn(coreMapService, "getMap").and.returnValue(getViewMock);
    };

    const runCommonAssertions = (
      callWithMapIndex: boolean,
      mapIndex: string,
      maxZoom: number | undefined
    ) => {
      expect(coreMapService.checkMapIndex).toHaveBeenCalled();
      expect(coreMapService.decideMapComponentEventType).toHaveBeenCalledWith(
        callWithMapIndex,
        mapIndex
      );
      if (callWithMapIndex) {
        expect(coreMapService.getMap).toHaveBeenCalledWith(mapIndex);
        expect(extent?.length).toBe(4);
      } else {
        expect(coreMapService.getMap).not.toHaveBeenCalled();
      }
      if (maxZoom === undefined) {
        expect(options?.maxZoom).toBeUndefined();
      } else {
        expect(options?.maxZoom).toBe(maxZoom);
      }
    };

    afterEach(() => {
      // reset extent en options
      extent = undefined;
      options = undefined;
    });

    const testCases = [
      {
        description:
          "zoomToGeometry called with geometry (string), should fit to geometry",
        geometry: "POLYGON ((3 1, 2 3, 1 2, 3 1))",
        mapIndex: DEFAULT_MAPINDEX,
        maxZoom: undefined,
        callWithMapIndex: true
      },
      {
        description: "called with geometry (Geometry), should fit to geometry",
        geometry: new Polygon([
          [
            [3, 1],
            [2, 3],
            [1, 2],
            [3, 1]
          ]
        ]),
        mapIndex: DEFAULT_MAPINDEX,
        maxZoom: undefined,
        callWithMapIndex: true
      },
      {
        description:
          "called with geometry and zoom, should fit to geometry with maxZoom",
        geometry: "POINT (3 1)",
        mapIndex: DEFAULT_MAPINDEX,
        maxZoom: 12,
        callWithMapIndex: true
      },
      {
        description:
          "called with geometry and mapIndex, should fit to geometry on mapIndex",
        geometry: "POLYGON ((3 1, 2 3, 1 2, 3 1))",
        mapIndex: "testMap",
        maxZoom: undefined,
        callWithMapIndex: true
      },
      {
        description: "called not existing mapIndex, should not zoom",
        geometry: "POLYGON ((3 1, 2 3, 1 2, 3 1))",
        mapIndex: "testMap",
        maxZoom: undefined,
        callWithMapIndex: false
      }
    ];

    testCases.forEach(
      ({ description, callWithMapIndex, geometry, mapIndex, maxZoom }) => {
        it(`zoomToGeometry ${description}`, () => {
          setupSpies(callWithMapIndex);
          mapService.zoomToGeometry(geometry, mapIndex, maxZoom);
          runCommonAssertions(callWithMapIndex, mapIndex, maxZoom);
        });
      }
    );
  });

  describe("highlightLayer interaction", () => {
    it("clearHighlightLayer, should call coreMapService.", () => {
      const clearHighlightLayerSpy = spyOn(
        coreMapService,
        "clearHighlightLayer"
      );

      mapService.clearHighlightLayer();

      expect(clearHighlightLayerSpy).toHaveBeenCalled();
      expect(clearHighlightLayerSpy).toHaveBeenCalledWith(DEFAULT_MAPINDEX);
    });

    it("clearHighlightLayer, should call coreMapService with mapIndex.", () => {
      const mapIndex = "onbekend";
      const clearHighlightLayerSpy = spyOn(
        coreMapService,
        "clearHighlightLayer"
      );

      mapService.clearHighlightLayer(mapIndex);

      expect(clearHighlightLayerSpy).toHaveBeenCalled();
      expect(clearHighlightLayerSpy).toHaveBeenCalledWith(mapIndex);
    });

    it("addFeaturesToHighlightLayer, should call coreMapService.", () => {
      const addFeaturesToHighlightLayerSpy = spyOn(
        coreMapService,
        "addFeaturesToHighlightLayer"
      );

      mapService.addFeaturesToHighlightLayer([]);

      expect(addFeaturesToHighlightLayerSpy).toHaveBeenCalled();
      expect(addFeaturesToHighlightLayerSpy).toHaveBeenCalledWith(
        [],
        DEFAULT_MAPINDEX
      );
    });

    it("addFeaturesToHighlightLayer, should call coreMapService with mapIndex.", () => {
      const mapIndex = "onbekend";
      const addFeaturesToHighlightLayerSpy = spyOn(
        coreMapService,
        "addFeaturesToHighlightLayer"
      );

      mapService.addFeaturesToHighlightLayer([], mapIndex);

      expect(addFeaturesToHighlightLayerSpy).toHaveBeenCalled();
      expect(addFeaturesToHighlightLayerSpy).toHaveBeenCalledWith([], mapIndex);
    });

    it("when changeHighlightLayerStyle() is called it should call the coreMapService with the mapIndex and the given style", () => {
      const changeHighlightStyleLayerSpy = spyOn<any>(
        coreMapService,
        "changeHighlightLayerStyle"
      );
      const mapIndex = DEFAULT_MAPINDEX;
      const style = {} as Style;

      mapService.changeHighlightLayerStyle(style, mapIndex);

      expect(changeHighlightStyleLayerSpy).toHaveBeenCalledWith(
        style,
        mapIndex
      );
    });
  });

  describe("selectionLayer interaction", () => {
    it("clearSelectionLayer, should call coreMapService.", () => {
      const clearSelectionLayerSpy = spyOn(
        coreMapService,
        "clearSelectionLayer"
      );

      mapService.clearSelectionLayer();

      expect(clearSelectionLayerSpy).toHaveBeenCalledWith(DEFAULT_MAPINDEX);
    });

    it("clearSelectionLayer, should call coreMapService with mapIndex.", () => {
      const mapIndex = "onbekend";
      const clearSelectionLayerSpy = spyOn(
        coreMapService,
        "clearHighlightLayer"
      );

      mapService.clearHighlightLayer(mapIndex);

      expect(clearSelectionLayerSpy).toHaveBeenCalledWith(mapIndex);
    });

    it("addFeaturesToSelectionLayer called without mapIndex, should call coreMapService without mapIndex.", () => {
      const addFeaturesToSelectionLayerSpy = spyOn(
        coreMapService,
        "addFeaturesToSelectionLayer"
      );

      mapService.addFeaturesToSelectionLayer([]);

      expect(addFeaturesToSelectionLayerSpy).toHaveBeenCalledWith(
        [],
        DEFAULT_MAPINDEX
      );
    });

    it("addFeaturesToSelectionLayer called with mapIndex, should call coreMapService with mapIndex.", () => {
      const mapIndex = "onbekend";
      const addFeaturesToSelectionLayerSpy = spyOn(
        coreMapService,
        "addFeaturesToSelectionLayer"
      );

      mapService.addFeaturesToSelectionLayer([], mapIndex);

      expect(addFeaturesToSelectionLayerSpy).toHaveBeenCalledWith([], mapIndex);
    });

    it("when changeSelectionLayerStyle() is called it should call the coreMapService with the mapIndex and the given style", () => {
      const changeSelectionStyleLayerSpy = spyOn<any>(
        coreMapService,
        "changeSelectionLayerStyle"
      );
      const mapIndex = DEFAULT_MAPINDEX;
      const style = {} as Style;

      mapService.changeSelectionLayerStyle(style, mapIndex);

      expect(changeSelectionStyleLayerSpy).toHaveBeenCalledWith(
        style,
        mapIndex
      );
    });
  });

  describe("isMaxZoomlevel", () => {
    let zoom: number | undefined;

    beforeEach(() => {
      const getViewMock = {
        getView() {
          return {
            getZoom() {
              return zoom;
            },
            getMaxZoom() {
              return 16;
            }
          };
        }
      } as OlMap;
      spyOn(coreMapService, "getMap").and.returnValue(getViewMock);
    });

    it("when zoomlevel is not maxZoomlevel, it should return false", () => {
      zoom = 10;

      const isNotMaxZoom = mapService.isMaxZoomlevel();

      expect(isNotMaxZoom).toBeFalse();
    });

    it("when zoomlevel is undefined, it should return false", () => {
      zoom = undefined;

      const isNotMaxZoom = mapService.isMaxZoomlevel();

      expect(isNotMaxZoom).toBeFalse();
    });

    it("when zoomlevel equals maxZoom, it should return true", () => {
      zoom = 16;

      const isNotMaxZoom = mapService.isMaxZoomlevel();

      expect(isNotMaxZoom).toBeTrue();
    });
  });
});
