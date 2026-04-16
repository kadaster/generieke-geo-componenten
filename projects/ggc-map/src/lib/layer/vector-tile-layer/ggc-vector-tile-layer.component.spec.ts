import { DebugElement } from "@angular/core";
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync
} from "@angular/core/testing";
import { FeatureLike } from "ol/Feature";
import VectorTileLayer from "ol/layer/VectorTile";
import OlMap from "ol/Map";
import MapBrowserEvent from "ol/MapBrowserEvent";
import { Pixel } from "ol/pixel";
import VectorTileSource from "ol/source/VectorTile";
import Stroke from "ol/style/Stroke";
import Style, { StyleFunction } from "ol/style/Style";
import { GgcCrsConfigService } from "../../core/service/ggc-crs-config.service";
import { CoreMapEventsService } from "../../map/service/core-map-events.service";
import { CoreMapService } from "../../map/service/core-map.service";
import {
  MapComponentEvent,
  MapComponentEventTypes
} from "../../model/map-component-event.model";
import { CoreSelectionService } from "../../service/select/core-selection.service";
import { GgcVectorTileLayerComponent } from "./ggc-vector-tile-layer.component";
import { ViewStateLayerStateExtent } from "ol/View";
import { featureData, getFoundFeatures } from "../mock/feature.mock";
import { resolutions } from "../../utils/epsg28992";
import {
  provideHttpClient,
  withInterceptorsFromDi
} from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting
} from "@angular/common/http/testing";

describe("VectorTileLayerComponent", () => {
  let component: GgcVectorTileLayerComponent;
  let fixture: ComponentFixture<GgcVectorTileLayerComponent>;
  let debugElement: DebugElement;
  let resultLayer: VectorTileLayer;
  let coreSelectionServiceSpy: jasmine.SpyObj<CoreSelectionService>;
  let httpTestingController: HttpTestingController;

  beforeEach(waitForAsync(() => {
    coreSelectionServiceSpy = jasmine.createSpyObj("CoreSelectionServiceSpy", [
      "handleFeatureInfoForLayer",
      "clearFeatureInfoForLayer"
    ]);
    TestBed.configureTestingModule({
      imports: [GgcVectorTileLayerComponent],
      providers: [
        CoreMapService,
        GgcCrsConfigService,
        CoreMapEventsService,
        { provide: CoreSelectionService, useValue: coreSelectionServiceSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(GgcVectorTileLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    debugElement = fixture.debugElement;
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  const olMapMock = {
    addLayer(layer) {
      resultLayer = layer as VectorTileLayer;
    },
    removeLayer(_layer) {
      void _layer;
      return;
    }
  } as OlMap;

  const createMapSpy = () => {
    // create ol.Map mock
    const mapSpy: jasmine.SpyObj<OlMap> = jasmine.createSpyObj("ol.Map", [
      "forEachFeatureAtPixel",
      "removeLayer"
    ]);
    mapSpy.forEachFeatureAtPixel.and.callThrough();
    mapSpy.removeLayer.and.stub();
    return mapSpy;
  };

  it("when attributions is provided for a layer, it should be contained in the source", fakeAsync(() => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);

    const getMapSpy = spyOn<CoreMapService, any>(
      coreMapService,
      "getMap"
    ).and.returnValue(olMapMock);

    component.options = {
      sourceOptions: {
        attributions: "Een attributie voor de VectorTile kaartlaag"
      }
    };
    component.ngOnInit();
    tick();

    expect(getMapSpy).toHaveBeenCalled();
    const source: VectorTileSource = resultLayer.getSource()!;
    // get and call attribution function to check if attribution has the expected value
    const attributionFunction = source.getAttributions();
    expect(attributionFunction).not.toBeNull();
    if (attributionFunction) {
      expect(attributionFunction({} as ViewStateLayerStateExtent)).toEqual([
        "Een attributie voor de VectorTile kaartlaag"
      ]);
    }
  }));

  it("when an url is provided, it should be applied to the source", fakeAsync(() => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);
    const getMapSpy = spyOn<CoreMapService, any>(
      coreMapService,
      "getMap"
    ).and.returnValue(olMapMock);

    component.options = {
      sourceOptions: {
        url: "test-url"
      }
    };
    component.ngOnInit();
    tick();

    expect(getMapSpy).toHaveBeenCalled();
    const source: VectorTileSource = resultLayer.getSource()!;
    expect(source.getUrls()).toEqual(["test-url"]);
  }));

  it("when min- an maxResolution is provided, it should be applied to the layer", fakeAsync(() => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);
    const getMapSpy = spyOn<CoreMapService, any>(
      coreMapService,
      "getMap"
    ).and.returnValue(olMapMock);

    component.options = { minResolution: 10, maxResolution: 20 };

    component.ngOnInit();
    tick();

    expect(getMapSpy).toHaveBeenCalled();
    expect(resultLayer.getMinResolution()).toBe(10);
    expect(resultLayer.getMaxResolution()).toBe(20);
  }));

  it("when an Openlayers style object is provided, it should be applied to the layer", fakeAsync(() => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);
    const getMapSpy = spyOn<CoreMapService, any>(
      coreMapService,
      "getMap"
    ).and.returnValue(olMapMock);

    component.options = {
      layerOptions: {
        style: new Style({
          stroke: new Stroke({
            color: [63, 195, 128, 1],
            width: 3
          })
        })
      }
    };

    component.ngOnInit();
    tick();

    expect(getMapSpy).toHaveBeenCalled();
    const styleObject: Style = resultLayer.getStyle() as Style;
    const strokeObject: Stroke | null = styleObject.getStroke();
    expect(strokeObject?.getColor()).toEqual([63, 195, 128, 1]);
    expect(strokeObject?.getWidth()).toBe(3);
  }));

  it("when an Openlayers StyleFunction is provided and called, it should be applied to the layer", fakeAsync(() => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);
    const getMapSpy = spyOn<CoreMapService, any>(
      coreMapService,
      "getMap"
    ).and.returnValue(olMapMock);

    component.options = {
      layerOptions: {
        style: () => {
          return new Style({
            stroke: new Stroke({
              color: [63, 195, 128, 1],
              width: 3
            })
          });
        }
      }
    };

    component.ngOnInit();
    tick();

    expect(getMapSpy).toHaveBeenCalled();
    const styleFunction: StyleFunction =
      resultLayer.getStyle() as StyleFunction;
    const styleObject: Style = styleFunction({} as FeatureLike, 0) as Style;
    const strokeObject: Stroke | null = styleObject.getStroke();
    expect(strokeObject?.getColor()).toEqual([63, 195, 128, 1]);
    expect(strokeObject?.getWidth()).toBe(3);
  }));

  it("when getFeatureInfoOnSingleclick is true, add singleclick listener to map", fakeAsync(() => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);
    const mapEventsService: CoreMapEventsService =
      debugElement.injector.get(CoreMapEventsService);
    const mapEventsServicespy = spyOn<CoreMapEventsService, any>(
      mapEventsService,
      "getSingleclickObservableForMap"
    ).and.callThrough();
    component.options = { getFeatureInfoOnSingleclick: true };

    const getMapSpy = spyOn<CoreMapService, any>(
      coreMapService,
      "getMap"
    ).and.returnValue(olMapMock);
    component.ngOnInit();
    tick();
    expect(getMapSpy).toHaveBeenCalled();
    expect(mapEventsServicespy).toHaveBeenCalled();
  }));

  it(
    "should return a feature to the foundFeatures-array if the maxFeaturesonSingleclick is not yet reached " +
      "when limitFeatures() is called",
    () => {
      component.options = { maxFeaturesOnSingleclick: 5 };
      // Preparing the foundFeatures-array with already 4 features in it.
      component["foundFeatures"] = getFoundFeatures(4);
      component["limitFeatures"](featureData);

      expect(component["foundFeatures"].length).toBe(5);
    }
  );

  it(
    "should NOT return a feature to the foundFeatures-array if maxFeaturesonSingleclick is not changed and" +
      "the array size is already 8 (default limit) when is limitFeatures() is called",
    () => {
      // Preparing the foundFeatures-array with already 8 features in it.
      component["foundFeatures"] = getFoundFeatures(8);

      component["limitFeatures"](featureData);
      expect(component["foundFeatures"].length).toBe(8);
    }
  );

  it("should NOT return a feature to the foundFeatures-array if maxFeaturesonSingleclick is already reached when limitFeatures() is called", () => {
    component.options = { maxFeaturesOnSingleclick: 14 };
    // Preparing the foundFeatures-array with already 14 features in it.
    component["foundFeatures"] = getFoundFeatures(14);
    component["limitFeatures"](featureData);
    expect(component["foundFeatures"].length).toBe(14);
  });

  it("should emit an event if getFeatureInfoOnSingleclick is true and the forEachFeaturePixelAt function returns features", (done) => {
    component.options = {
      mapIndex: "test-map",
      layerName: "test-layer",
      getFeatureInfoOnSingleclick: true
    };
    component.ngOnInit();
    const mapSpy = createMapSpy();
    component["map"] = mapSpy;

    const eventSpy = spyOn(component.events, "emit").and.callThrough();
    const pixel: Pixel = [123, 456];
    const evt = { pixel } as MapBrowserEvent;

    component.events.subscribe((emittedEvent: MapComponentEvent) => {
      expect(emittedEvent.type).toBe(MapComponentEventTypes.VECTORFEATUREINFO);
      expect(emittedEvent.mapIndex).toBe("test-map");
      expect(emittedEvent.layerName).toBe("test-layer");
      expect(emittedEvent.message).toBe(
        "VectorTileLayer getFeatureInfo resultaten: "
      );
      expect(emittedEvent.value).toEqual([]);

      expect(component["map"].forEachFeatureAtPixel).toHaveBeenCalled();
      expect(eventSpy).toHaveBeenCalled();
      expect(
        coreSelectionServiceSpy.handleFeatureInfoForLayer
      ).toHaveBeenCalled();
      done();
    });

    mapSpy.forEachFeatureAtPixel.and.callThrough();
    component.getFeatureInfo(evt);
  });

  it("should pass pixel and hit tolerance to function forEachFeaturePixelAt", () => {
    component.options = {
      mapIndex: "test-map",
      getFeatureInfoOnSingleclick: false,
      hitTolerance: 5
    };
    const mapSpy = createMapSpy();
    component["map"] = mapSpy;

    const pixel: Pixel = [123, 456];
    const evt = { pixel } as MapBrowserEvent;

    mapSpy.forEachFeatureAtPixel.and.callThrough();
    component.getFeatureInfo(evt);

    expect(component["map"].forEachFeatureAtPixel).toHaveBeenCalled();
    expect(component["map"].forEachFeatureAtPixel).toHaveBeenCalledWith(
      pixel,
      jasmine.any(Function),
      { layerFilter: jasmine.any(Function), hitTolerance: 5 }
    );
  });

  describe("should set the overzoom resolutions with createOverzoomResolutions", () => {
    it("should correctly set overzoom resolutions if overzoom active", fakeAsync(() => {
      component.options = {
        mapIndex: "test-map",
        enableOverzoom: true
      };
      spyOn<any>(component, "getMaxZoom").and.returnValue(Promise.resolve(12));

      component.ngOnInit();
      tick();
      expect(component["vectorTileSource"].getResolutions()).toEqual(
        resolutions.slice(0, 13)
      );
    }));

    it("should correctly set overzoom resolutions if overzoom is not active", fakeAsync(() => {
      component.options = {
        mapIndex: "test-map",
        enableOverzoom: false
      };
      component.ngOnInit();
      tick();
      expect(component["vectorTileSource"].getResolutions()).toEqual(
        resolutions
      );
    }));
  });

  describe("get maxZoom from sources", () => {
    beforeEach(() => {
      // To prevent that the getJsonFromUrl is called from the setStyle, which leads to complications in the httpTestcontroller
      spyOn<any>(component, "setStyle").and.returnValue(
        Promise.resolve(undefined)
      );
    });

    it("pick the maxZoom if provided in the direct source", async () => {
      component.options = {
        mapIndex: "test-map",
        sourceOptions: {
          maxZoom: 10,
          url: "url/{z}/{y}/{x}"
        },
        enableOverzoom: true
      };

      const result = await (component as any).getMaxZoom();
      expect(result).toEqual(10);
    });

    it("pick the maxZoom in the url if not provided in the source", async () => {
      component.options = {
        mapIndex: "test-map",
        enableOverzoom: true,
        url: "url/{z}/{y}/{x}"
      };

      const resultPromise = (component as any).getMaxZoom();

      const req = httpTestingController.expectOne(
        (request) => request.url === "url?f=tilejson"
      );
      req.flush({ maxzoom: 10 });
      httpTestingController.verify();

      const result = await resultPromise;
      expect(result).toEqual(10);
    });

    it("pick the maxZoom in the styleurl if not provided in the source or url if missing", async () => {
      component.options = {
        mapIndex: "test-map",
        enableOverzoom: true,
        style: "styleUrl"
      };

      const resultPromise = (component as any).getMaxZoom();

      const req = httpTestingController.expectOne(
        (request) => request.url === "styleUrl"
      );
      req.flush({ sources: { source1: { maxzoom: 10 } } });
      httpTestingController.verify();

      const result = await resultPromise;
      expect(result).toEqual(10);
    });

    it("calculate the maxZoom fro the styleurls if not provided in the source or url if missing", async () => {
      // The different asynchronous calls made it diffult to use the httpTestController, so a spy is used
      spyOn<any>(component, "getJsonFromUrl").and.callFake((url: string) => {
        if (url === "styleUrl") {
          return {
            sources: {
              source1: {
                tiles: ["urlMaxzoom8/{z}/{y}/{x}"]
              },
              source2: {
                tiles: ["urlMaxzoom9/{z}/{y}/{x}"]
              }
            }
          };
        } else if (url === "urlMaxzoom8?f=tilejson") {
          return { maxzoom: 8 };
        } else if (url === "urlMaxzoom9?f=tilejson") {
          return { maxzoom: 9 };
        }
      });
      component.options = {
        mapIndex: "test-map",
        enableOverzoom: true,
        style: "styleUrl"
      };

      const result = await (component as any).getMaxZoom();
      expect(result).toEqual(8);
    });
  });

  describe("Error handling if the urls do not return values", () => {
    it("should return undefined if the url isn't valid", async () => {
      const resultPromise = (component as any).getMaxZoomFromUrl(
        "wrongUrl/{z}/{y}/{x}"
      );

      const req = httpTestingController.expectOne(
        (request) => request.url === "wrongUrl?f=tilejson"
      );
      req.flush("error message", {
        status: 500,
        statusText: "Internal Server Error"
      });
      httpTestingController.verify();

      const result = await resultPromise;
      expect(result).toEqual(undefined);
    });

    it("should return undefined if the styleurl isn't valid", async () => {
      const resultPromise = (component as any).getMaxZoomFromStyleUrl(
        "wrongStyleUrl"
      );

      const req = httpTestingController.expectOne(
        (request) => request.url === "wrongStyleUrl"
      );
      req.flush("error message", {
        status: 500,
        statusText: "Internal Server Error"
      });
      httpTestingController.verify();

      const result = await resultPromise;
      expect(result).toEqual(undefined);
    });
  });
});
