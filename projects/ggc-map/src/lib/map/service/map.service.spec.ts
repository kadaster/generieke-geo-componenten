import { TestBed } from "@angular/core/testing";
import { Extent } from "ol/extent";
import Polygon from "ol/geom/Polygon";
import OlMap from "ol/Map";
import { Style } from "ol/style";
import { FitOptions } from "ol/View";
import { GgcCrsConfigService } from "../../core/service/ggc-crs-config.service";
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

  it("should return the map", () => {
    spyOn(coreMapService, "getMap");
    mapService.getMap("my-map");
    expect(coreMapService.getMap).toHaveBeenCalledWith("my-map");
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

  describe("zoomToGeometryWithZoomOptions", () => {
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
          mapService.zoomToGeometryWithZoomOptions(geometry, {
            mapIndex,
            fitOptions: { maxZoom }
          });
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
