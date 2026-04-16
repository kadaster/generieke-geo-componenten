import { inject, TestBed } from "@angular/core/testing";
import Feature from "ol/Feature";
import VectorLayer from "ol/layer/Vector";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import { GgcCrsConfigService } from "../../core/service/ggc-crs-config.service";
import { MapComponentEventTypes } from "../../model/map-component-event.model";
import { CoreMapService } from "./core-map.service";
import { provideZoneChangeDetection } from "@angular/core";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";

describe("CoreMapService", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        CoreMapService,
        GgcCrsConfigService,
        provideZoneChangeDetection()
      ]
    })
  );

  it("should be created", () => {
    const service: CoreMapService = TestBed.inject(CoreMapService);
    expect(service).toBeTruthy();
  });

  describe("create, get and destroyMap", () => {
    it("createAndGetMap, when called without parameters, should create a map with default values", inject(
      [CoreMapService],
      (coreMapService: CoreMapService) => {
        const createLayersSpy = spyOn<any>(
          coreMapService,
          "createExtraLayers"
        ).and.callThrough();
        coreMapService.createAndGetMap();

        expect(coreMapService["olMaps"].get(DEFAULT_MAPINDEX)).toBeDefined();
        const defaultMap = coreMapService.getMap();
        expect(defaultMap.getView().getResolutions()!.length).toBe(15);
        expect(defaultMap.getView().getMinZoom()).toBe(0);
        expect(createLayersSpy).toHaveBeenCalled();
        expect(
          coreMapService["extraLayersMap"].get("_DEFAULT_-highlight")
        ).toBeDefined();
        expect(
          coreMapService["extraLayersMap"].get("_DEFAULT_-selection")
        ).toBeDefined();
      }
    ));

    it(
      "createAndGetMap, when called with minZoom 3 and maxZoom 19, should create a map with resolution length = 20 and" +
        "minZoom = 3",
      inject([CoreMapService], (coreMapService: CoreMapService) => {
        const myMap = "myMap";

        coreMapService.createAndGetMap(myMap, 3, 19);

        expect(coreMapService["olMaps"].get(myMap)).toBeDefined();
        const defaultMap = coreMapService.getMap(myMap);
        expect(defaultMap.getView().getResolutions()!.length).toBe(20);
        expect(defaultMap.getView().getMinZoom()).toBe(3);
      })
    );

    it(
      "createAndGetMap, when called with minZoom 4 and maxZoom 4, should create a map with resolution length = 5 and" +
        "minZoom = 4",
      inject([CoreMapService], (coreMapService: CoreMapService) => {
        const mapIndexOneZoomlevel = "mapOneZoomlevel";

        coreMapService.createAndGetMap(mapIndexOneZoomlevel, 4, 4);

        expect(
          coreMapService["olMaps"].get(mapIndexOneZoomlevel)
        ).toBeDefined();
        const mapOneZoomlevel = coreMapService.getMap(mapIndexOneZoomlevel);
        expect(mapOneZoomlevel.getView().getResolutions()!.length).toBe(5);
        expect(mapOneZoomlevel.getView().getMinZoom()).toBe(4);
      })
    );

    it(
      "createAndGetMap, when called with minZoom 4.13 and maxZoom 7.87 as decimal numbers, should create a map with " +
        "minZoom = 4 and maxZoom = 7",
      inject([CoreMapService], (coreMapService: CoreMapService) => {
        const mapIndexOneZoomlevel = "mapOneZoomlevel";

        coreMapService.createAndGetMap(mapIndexOneZoomlevel, 4.13, 7.87);

        expect(
          coreMapService["olMaps"].get(mapIndexOneZoomlevel)
        ).toBeDefined();
        const mapOneZoomlevel = coreMapService.getMap(mapIndexOneZoomlevel);
        expect(mapOneZoomlevel.getView().getMinZoom()).toBe(4);
        expect(mapOneZoomlevel.getView().getMaxZoom()).toBe(7);
      })
    );

    it("getMap, when called with not existing mapIndex, should return a map", inject(
      [CoreMapService],
      (coreMapService: CoreMapService) => {
        const myMap = "testMap";
        expect(coreMapService["olMaps"].size).toBe(0);

        const map = coreMapService.getMap(myMap);

        expect(map).toBeDefined();
        expect(coreMapService["olMaps"].size).toBe(1);
        expect(coreMapService["olMaps"].get(myMap)).toBeDefined();
        expect(coreMapService["olMaps"].get(myMap)).toEqual(map);
      }
    ));

    it("checkMapIndex, when called with existing mapIndex, should true", inject(
      [CoreMapService],
      (coreMapService: CoreMapService) => {
        expect(coreMapService["olMaps"].size).toBe(0);
        // first, call getMap to create a map with default mapIndex
        coreMapService.getMap();

        const isExistingMap = coreMapService.checkMapIndex();

        expect(isExistingMap).toBe(true);
      }
    ));

    it("checkMapIndex, when called with not existing mapIndex, should false", inject(
      [CoreMapService],
      (coreMapService: CoreMapService) => {
        expect(coreMapService["olMaps"].size).toBe(0);

        const isExistingMap = coreMapService.checkMapIndex();

        expect(isExistingMap).toBe(false);
      }
    ));

    it(
      "destroyMap, when called with existing mapIndex, it should destroy the " +
        "openlayers-map and highlight- and selectionSource",
      inject([CoreMapService], (coreMapService: CoreMapService) => {
        // before spyOn mapService, call createAndGetMap() to make sure a map (with default mapIndex) created
        coreMapService.createAndGetMap();
        expect(coreMapService["olMaps"].size).toBe(1);
        expect(coreMapService["extraLayersMap"].size).toBe(2);

        coreMapService.destroyMap(DEFAULT_MAPINDEX);
        expect(coreMapService["olMaps"].size).toBe(0);
        expect(coreMapService["extraLayersMap"].size).toBe(0);
      })
    );

    it(
      "destroyMap, when called with a not existing mapIndex, it should not " +
        "destroy an openlayers-map",
      inject([CoreMapService], (coreMapService: CoreMapService) => {
        // before spyOn mapService, call createAndGetMap() to make sure a map (with default mapIndex) created
        coreMapService.createAndGetMap("my-map");
        expect(coreMapService["olMaps"].size).toBe(1);
        expect(coreMapService["extraLayersMap"].size).toBe(2);

        coreMapService.destroyMap(DEFAULT_MAPINDEX);
        expect(coreMapService["olMaps"].size).toBe(1);
        expect(coreMapService["extraLayersMap"].size).toBe(2);
      })
    );

    it("should return the layer with the specified layerId", inject(
      [CoreMapService],
      (coreMapService: CoreMapService) => {
        const map = coreMapService.createAndGetMap("my-map");

        const layer = new VectorLayer({});
        layer.set("ggc-layer-id", "my-id");
        map.addLayer(layer);

        const result = coreMapService.getLayer("my-id", "my-map");
        expect(result).toEqual(layer);
      }
    ));
  });

  describe("highlightLayer", () => {
    it("addFeaturesToHighlightLayer, when called with 1 feature, features should be 1.", inject(
      [CoreMapService],
      (coreMapService: CoreMapService) => {
        // before spyOn mapService, call createAndGetMap() to make sure a map (with default mapIndex) created
        coreMapService.createAndGetMap();
        expect(coreMapService["extraLayersMap"].size).toBe(2);

        // add feature to highlight layer
        coreMapService.addFeaturesToHighlightLayer(
          [new Feature()],
          DEFAULT_MAPINDEX
        );

        const highlightLayer =
          coreMapService["getHighlightLayerSource"](DEFAULT_MAPINDEX);
        expect(highlightLayer?.getFeatures().length).toBe(1);
      }
    ));

    it("clearHighlightLayer, when map does not exist, a new MapComponentEvent of type UNSUCCESSFUL shoud be returned.", inject(
      [CoreMapService],
      (coreMapService: CoreMapService) => {
        const checkMapIndexSpy = spyOn(coreMapService, "checkMapIndex");

        const mapComponentEvent =
          coreMapService.clearHighlightLayer("onbekend");

        expect(checkMapIndexSpy).toHaveBeenCalled();
        expect(checkMapIndexSpy).toHaveBeenCalledWith("onbekend");
        expect(mapComponentEvent.type).toEqual(
          MapComponentEventTypes.UNSUCCESSFUL
        );
        expect(mapComponentEvent.message).toEqual(
          "Mapindex bestaat niet voor index: onbekend"
        );
        expect(mapComponentEvent.value).toEqual(undefined);
      }
    ));

    it(
      "clearHighlightLayer called without mapIndex, when map does not exist, a new MapComponentEvent of " +
        "type UNSUCCESSFUL shoud be returned.",
      inject([CoreMapService], (coreMapService: CoreMapService) => {
        const checkMapIndexSpy = spyOn(coreMapService, "checkMapIndex");

        const mapComponentEvent =
          coreMapService.clearHighlightLayer(DEFAULT_MAPINDEX);

        expect(checkMapIndexSpy).toHaveBeenCalled();
        expect(mapComponentEvent.type).toEqual(
          MapComponentEventTypes.UNSUCCESSFUL
        );
        expect(mapComponentEvent.message).toEqual(
          "Mapindex bestaat niet voor index: _DEFAULT_"
        );
        expect(mapComponentEvent.value).toEqual(undefined);
      })
    );

    it("clearHighlightLayer, when clear() is called number of features should be zero.", inject(
      [CoreMapService],
      (coreMapService: CoreMapService) => {
        // first, call createAndGetMap() to make sure a map (with default mapIndex) created
        coreMapService.createAndGetMap();

        expect(coreMapService["extraLayersMap"].size).toBe(2);
        // add feature to highlight layer
        coreMapService.addFeaturesToHighlightLayer(
          [new Feature()],
          DEFAULT_MAPINDEX
        );

        // dit werkt niet :-(
        // hightlightSource = mapService['hightlightSource']
        // const highlightSourcespy = spyOn(hightlightSource, 'clear');
        coreMapService.clearHighlightLayer(DEFAULT_MAPINDEX);

        expect(coreMapService["extraLayersMap"].size).toBe(2);
        // dit kan dus niet :-(
        // expect(drawSourceSpy).toHaveBeenCalled();
        const vectorSource =
          coreMapService["getHighlightLayerSource"](DEFAULT_MAPINDEX);
        expect(vectorSource?.getFeatures().length).toBe(0);
      }
    ));

    it("when changeHighlightLayerStyle() is called it should change the default to the style given as parameter", inject(
      [CoreMapService],
      (coreMapService: CoreMapService) => {
        coreMapService.createAndGetMap();

        expect(coreMapService["extraLayersMap"].size).toBe(2);
        const hightlightLayer = coreMapService["extraLayersMap"].get(
          "_DEFAULT_-highlight"
        );
        const defaultStyle = hightlightLayer?.getStyle() as Style;

        expect(defaultStyle.getFill()?.getColor()).toBe(
          "rgba(0, 115, 149, 0.5)"
        );
        expect(defaultStyle.getStroke()?.getColor()).toBe("#007395");
        expect(defaultStyle.getStroke()?.getWidth()).toBe(5);

        const customStyle = createCustomStyle();

        coreMapService.changeHighlightLayerStyle(customStyle, "_DEFAULT_");

        const highlightLayerWithNewStyle = coreMapService["extraLayersMap"].get(
          "_DEFAULT_-highlight"
        );
        const actualStyle = highlightLayerWithNewStyle?.getStyle() as Style;

        expect(actualStyle).toBe(customStyle);
      }
    ));
  });

  describe("selectionLayer", () => {
    it(
      "addFeaturesToSelectionLayer, when called with 2 features, features should be 2 and a MapComponentEvent of type " +
        "SUCCESSFUL should be returned.",
      inject([CoreMapService], (coreMapService: CoreMapService) => {
        // before spyOn mapService, call createAndGetMap() to make sure a map (with default mapIndex) created
        coreMapService.createAndGetMap();

        expect(coreMapService["extraLayersMap"].size).toBe(2);

        // add feature to highlight layer
        const mapComponentEvent = coreMapService.addFeaturesToSelectionLayer(
          [new Feature(), new Feature()],
          DEFAULT_MAPINDEX
        );

        const vectorSource =
          coreMapService["getSelectionLayerSource"](DEFAULT_MAPINDEX);
        expect(vectorSource?.getFeatures().length).toBe(2);
        expect(mapComponentEvent.type).toEqual(
          MapComponentEventTypes.SUCCESSFUL
        );
        expect(mapComponentEvent.message).toEqual(
          "Methode succesvol uitgevoerd"
        );
        expect(mapComponentEvent.value).toEqual(undefined);
      })
    );

    it("addFeaturesToSelectionLayer, when map does not exist, a new MapComponentEvent of type UNSUCCESSFUL shoud be returned.", inject(
      [CoreMapService],
      (coreMapService: CoreMapService) => {
        const checkMapIndexSpy = spyOn(coreMapService, "checkMapIndex");

        const mapComponentEvent = coreMapService.addFeaturesToSelectionLayer(
          [],
          "onbekend"
        );

        expect(checkMapIndexSpy).toHaveBeenCalledWith("onbekend");
        expect(mapComponentEvent.type).toEqual(
          MapComponentEventTypes.UNSUCCESSFUL
        );
        expect(mapComponentEvent.message).toEqual(
          "Mapindex bestaat niet voor index: onbekend"
        );
        expect(mapComponentEvent.value).toEqual(undefined);
      }
    ));

    it("clearSelectionLayer, when clear() is called number of features should be zero.", inject(
      [CoreMapService],
      (coreMapService: CoreMapService) => {
        // first, call createAndGetMap() to make sure a map (with default mapIndex) created
        coreMapService.createAndGetMap();
        const vectorSource =
          coreMapService["getSelectionLayerSource"](DEFAULT_MAPINDEX);

        // add feature to highlight layer
        coreMapService.addFeaturesToSelectionLayer(
          [new Feature(), new Feature()],
          DEFAULT_MAPINDEX
        );
        expect(vectorSource?.getFeatures().length).toBe(2);

        coreMapService.clearSelectionLayer(DEFAULT_MAPINDEX);

        expect(coreMapService["extraLayersMap"].size).toBe(2);
        expect(vectorSource?.getFeatures().length).toBe(0);
      }
    ));

    it("clearSelectionLayer, when map does not exist, a new MapComponentEvent of type UNSUCCESSFUL shoud be returned.", inject(
      [CoreMapService],
      (coreMapService: CoreMapService) => {
        const checkMapIndexSpy = spyOn(coreMapService, "checkMapIndex");

        const mapComponentEvent =
          coreMapService.clearSelectionLayer("onbekend");

        expect(checkMapIndexSpy).toHaveBeenCalledWith("onbekend");
        expect(mapComponentEvent.type).toEqual(
          MapComponentEventTypes.UNSUCCESSFUL
        );
        expect(mapComponentEvent.message).toEqual(
          "Mapindex bestaat niet voor index: onbekend"
        );
        expect(mapComponentEvent.value).toEqual(undefined);
      }
    ));

    it("when changeSelectionLayerStyle() is called it should change the default to the style given as parameter", inject(
      [CoreMapService],
      (coreMapService: CoreMapService) => {
        coreMapService.createAndGetMap();

        expect(coreMapService["extraLayersMap"].size).toBe(2);
        const selectionLayer = coreMapService["extraLayersMap"].get(
          "_DEFAULT_-selection"
        );
        const defaultStyle = selectionLayer?.getStyle() as Style;

        expect(defaultStyle.getFill()?.getColor()).toBe(
          "rgba(255,255,255,0.5)"
        );
        expect(defaultStyle.getStroke()?.getColor()).toBe("#0093be");
        expect(defaultStyle.getStroke()?.getWidth()).toBe(4);

        const customStyle = createCustomStyle();

        coreMapService.changeSelectionLayerStyle(customStyle, "_DEFAULT_");

        const selectionLayerWithNewStyle = coreMapService["extraLayersMap"].get(
          "_DEFAULT_-selection"
        );
        const actualStyle = selectionLayerWithNewStyle?.getStyle() as Style;

        expect(actualStyle).toBe(customStyle);
      }
    ));

    it("should only create geolocation layer once and return the same layer when called again", inject(
      [CoreMapService],
      (coreMapService: CoreMapService) => {
        const createLayerAndAddToMapSpy = spyOn(
          coreMapService,
          "createLayerAndAddToMap"
        ).and.callThrough();

        const layer = coreMapService.getExtraLayer("geolocation", "testMap");
        coreMapService.getExtraLayer("geolocation", "testMap");
        const sameLayer = coreMapService.getExtraLayer(
          "geolocation",
          "testMap"
        );

        expect(createLayerAndAddToMapSpy).toHaveBeenCalledTimes(1);
        expect(layer).toBe(sameLayer);
      }
    ));
  });
});

function createCustomStyle() {
  return new Style({
    fill: new Fill({
      color: "rgba(41,209,37,0.5)"
    }),
    stroke: new Stroke({
      color: "#669573",
      width: 5
    }),
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({
        color: "rgba(210,82,0,0.5)"
      }),
      stroke: new Stroke({
        color: "#95236f",
        width: 5
      })
    })
  });
}
