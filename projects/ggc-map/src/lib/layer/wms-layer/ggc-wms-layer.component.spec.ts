import {
  provideHttpClient,
  withInterceptorsFromDi
} from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting
} from "@angular/common/http/testing";
import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { MapBrowserEvent } from "ol";
import { Coordinate } from "ol/coordinate";
import ImageLayer from "ol/layer/Image";
import TileLayer from "ol/layer/Tile";
import OlMap from "ol/Map";
import ImageSource from "ol/source/Image";
import ImageWMS from "ol/source/ImageWMS";
import TileSource from "ol/source/Tile";
import { of } from "rxjs";
import { GgcCrsConfigService } from "../../core/service/ggc-crs-config.service";
import { CoreMapEventsService } from "../../map/service/core-map-events.service";
import { CoreMapService } from "../../map/service/core-map.service";
import {
  MapComponentEvent,
  MapComponentEventTypes
} from "../../model/map-component-event.model";
import { CoreSelectionService } from "../../service/select/core-selection.service";
import { CoreWmsWmtsCapabilitiesService } from "../service/core-wms-wmts-capabilities.service";

import { GgcWmsLayerComponent } from "./ggc-wms-layer.component";
import Spy = jasmine.Spy;
import SpyObj = jasmine.SpyObj;
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";

describe("WmsLayerComponent", () => {
  let component: GgcWmsLayerComponent;
  let fixture: ComponentFixture<GgcWmsLayerComponent>;
  let debugElement: DebugElement;
  let resultLayer: ImageLayer<ImageSource>;
  let coreMapService: CoreMapService;
  let coreSelectionService: CoreSelectionService;
  let capabilitiesService: SpyObj<CoreWmsWmtsCapabilitiesService>;

  let httpTestingController: HttpTestingController;

  const coordinate: Coordinate = [45000, 55000];

  beforeEach(waitForAsync(() => {
    const capSpy = jasmine.createSpyObj("CapabilitiesService", [
      "getCapabilitiesForUrl",
      "hasFeatureInfoUrl",
      "optionsFromCapabilities",
      "createGetFeatureInfoUrlObservable"
    ]);
    capSpy.getCapabilitiesForUrl.and.returnValue(of({}));
    TestBed.configureTestingModule({
      imports: [GgcWmsLayerComponent],
      providers: [
        CoreMapService,
        GgcCrsConfigService,
        CoreMapEventsService,
        CoreSelectionService,
        { provide: CoreWmsWmtsCapabilitiesService, useValue: capSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GgcWmsLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    debugElement = fixture.debugElement;
    coreMapService = TestBed.inject(CoreMapService);
    coreSelectionService = TestBed.inject(CoreSelectionService);
    httpTestingController = TestBed.inject(HttpTestingController);
    capabilitiesService = TestBed.inject(
      CoreWmsWmtsCapabilitiesService
    ) as jasmine.SpyObj<CoreWmsWmtsCapabilitiesService>;
    resolution = 1.54;
  });

  let resolution: number | undefined;
  const addLayerMock = {
    addLayer(layer) {
      resultLayer = layer as ImageLayer<ImageSource>;
    },
    removeLayer(_) {
      return;
    },
    getView() {
      return {
        getResolution() {
          return resolution;
        },
        setResolution(res: number | undefined) {
          resolution = res;
        }
      };
    }
  } as OlMap;

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("when a layer is supplied, it should be used as a parameter", () => {
    const getMapSpy = spyOn(coreMapService, "getMap").and.returnValue(
      addLayerMock
    );

    component.options = {
      sourceOptions: {
        params: {
          layers: ["layer-een", "layer-twee"]
        }
      }
    };

    component.ngOnInit();
    expect(getMapSpy).toHaveBeenCalled();
    const source = resultLayer.getSource() as ImageWMS;
    expect(source.getParams().LAYERS[0]).toBe("layer-een");
    expect(source.getParams().LAYERS[1]).toBe("layer-twee");
  });

  it("should call capabilitiesService if getCapabilities is true", () => {
    component.options = {
      url: "a.b/c",
      getCapabilities: true
    };

    component.ngOnInit();

    expect(capabilitiesService.getCapabilitiesForUrl).toHaveBeenCalledWith(
      "a.b/c",
      "WMS",
      false
    );
  });

  it("should call capabilitiesService with withCredentials if set in sourceOptions", () => {
    const url = "a.b/c";
    component.options = {
      url,
      getCapabilities: true,
      sourceOptions: {
        crossOrigin: "withCredentials"
      }
    };

    component.ngOnInit();

    expect(capabilitiesService.getCapabilitiesForUrl).toHaveBeenCalledWith(
      url,
      "WMS",
      true
    );
  });

  it("should not call capabilitiesService if getCapabilities is false", () => {
    component.options = {
      url: "a.b/c",
      getCapabilities: false
    };

    component.ngOnInit();

    expect(capabilitiesService.getCapabilitiesForUrl).not.toHaveBeenCalled();
  });

  it("when tiled is set to true, it should create a tileLayer", (done) => {
    spyOn(component["map"], "addLayer").and.callFake(
      (layer: ImageLayer<ImageSource> | TileLayer<TileSource>) => {
        expect(layer instanceof TileLayer).toEqual(true);
        done();
      }
    );
    component.options = {
      tiled: true
    };
    component.ngOnInit();
  });

  it("when tiled is set to true, and gutter is supplied, it should be set as parameter", (done) => {
    spyOn(component["map"], "addLayer").and.callFake(
      (layer: ImageLayer<ImageSource> | TileLayer<TileSource>) => {
        expect(layer instanceof TileLayer).toEqual(true);
        expect((layer.getSource() as Record<string, any>).gutter_).toEqual(42);
        done();
      }
    );
    component.options = {
      tiled: true,
      sourceOptions: {
        gutter: 42
      }
    };
    component.ngOnInit();
  });

  it("should return a feature, when getFeatureInfo is called and the URL is produced", (done) => {
    const event = { coordinate } as MapBrowserEvent;
    spyOn(coreMapService, "getMap").and.returnValue(addLayerMock);
    spyOn(coreSelectionService, "handleFeatureInfoForLayer");
    setWMSKaartlaagVariables("wmsLayerName");

    component.options!.maxFeaturesOnSingleclick = 17;
    component.ngOnInit();
    const wmsSpy: Spy = spyOn(
      component["wmsSource"],
      "getFeatureInfoUrl"
    ).and.callThrough();

    component.events.subscribe((result: MapComponentEvent) => {
      expect(result.type).toEqual(MapComponentEventTypes.WMSFEATUREINFO);
      expect(result.mapIndex).toBe(DEFAULT_MAPINDEX);
      expect(result.layerName).toBe("wmsLayerName");
      expect(result.value[0].getId()).toBe("annotatie.1815051");
      expect(result.value[0].getGeometry().getCoordinates()).toEqual([
        197782.397, 470543.292
      ]);
      expect(result.value[0].getProperties().tekst).toBe("2");
      expect(coreSelectionService.handleFeatureInfoForLayer).toHaveBeenCalled();
      done();
    });

    component.getFeatureInfo(event);

    const req = httpTestingController.expectOne((request) =>
      request.url.startsWith("test.url")
    );
    req.flush({
      type: "Feature",
      id: "annotatie.1815051",
      geometry: { type: "Point", coordinates: [197782.397, 470543.292] },
      geometry_name: "geom",
      properties: {
        classificatiecode: "X02",
        rotatiehoek: "21.807",
        tekst: "2"
      }
    });
    httpTestingController.verify();
    expect(wmsSpy.calls.count())
      .withContext("getFeatureInforUrl not called")
      .toBe(1);
    expect(wmsSpy.calls.mostRecent().args[0]).toBe(coordinate);
    expect(wmsSpy.calls.mostRecent().args[1]).toBe(1.54);
    expect(wmsSpy.calls.mostRecent().args[2]).toBe("EPSG:28992");
    expect(wmsSpy.calls.mostRecent().args[3].INFO_FORMAT).toBe(
      "application/json"
    );
    expect(wmsSpy.calls.mostRecent().args[3].QUERY_LAYERS).toEqual([
      "testQueryLayer"
    ]);
    expect(wmsSpy.calls.mostRecent().args[3].FEATURE_COUNT).toBe(17);
  });

  it("should not return features when the featureInfoUrl returns an error", (done) => {
    const event = { coordinate } as MapBrowserEvent;
    spyOn(coreMapService, "getMap").and.returnValue(addLayerMock);
    spyOn(coreSelectionService, "handleFeatureInfoForLayer");
    setWMSKaartlaagVariables("wmsLayerName");

    component.ngOnInit();
    const wmsSpy: Spy = spyOn(
      component["wmsSource"],
      "getFeatureInfoUrl"
    ).and.callThrough();

    component.events.subscribe((result: MapComponentEvent) => {
      expect(result.type).toEqual(MapComponentEventTypes.WMSFEATUREINFO);
      expect(result.mapIndex).toBe(DEFAULT_MAPINDEX);
      expect(result.layerName).toBe("wmsLayerName");
      expect(result.message).toBe(
        "Kon geen features ophalen van featureInfoUrl vanwege server geeft 503 terug"
      );
      expect(coreSelectionService.handleFeatureInfoForLayer).toHaveBeenCalled();
      done();
    });
    component.getFeatureInfo(event);

    const req = httpTestingController.expectOne((request) =>
      request.url.startsWith("test.url")
    );
    req.error(new ProgressEvent("error"), {
      statusText: "server geeft 503 terug"
    });
    httpTestingController.verify();
    expect(wmsSpy.calls.count())
      .withContext("getFeatureInforUrl not called")
      .toBe(1);
    expect(wmsSpy.calls.mostRecent().args[0]).toBe(coordinate);
  });

  it("should not return features when the featureInfoUrl is not found", (done) => {
    const event = { coordinate } as MapBrowserEvent;
    spyOn(coreMapService, "getMap").and.returnValue(addLayerMock);
    spyOn(coreSelectionService, "handleFeatureInfoForLayer");
    setWMSKaartlaagVariables("wmsLayerName");

    component.ngOnInit();
    const wmsSpy: Spy = spyOn(
      component["wmsSource"],
      "getFeatureInfoUrl"
    ).and.returnValue(undefined);

    component.events.subscribe((result: MapComponentEvent) => {
      expect(result.type).toEqual(MapComponentEventTypes.WMSFEATUREINFO);
      expect(result.mapIndex).toBe(DEFAULT_MAPINDEX);
      expect(result.layerName).toBe("wmsLayerName");
      expect(result.message).toBe("Geen featureInfoUrl gevonden");
      expect(coreSelectionService.handleFeatureInfoForLayer).toHaveBeenCalled();
      done();
    });
    component.getFeatureInfo(event);

    httpTestingController.expectNone("test.url");

    httpTestingController.verify();
    expect(wmsSpy.calls.count())
      .withContext("getFeatureInforUrl not called")
      .toBe(1);
    expect(wmsSpy.calls.mostRecent().args[0]).toBe(coordinate);
  });

  it("should not return features when the viewResolution is not in layerResolutionRange", (done) => {
    const event = { coordinate } as MapBrowserEvent;
    spyOn(coreMapService, "getMap").and.returnValue(addLayerMock);
    spyOn(coreSelectionService, "handleFeatureInfoForLayer");
    setWMSKaartlaagVariables("wmsLayerName");
    addLayerMock.getView().setResolution(undefined);

    component.ngOnInit();

    component.events.subscribe((result: MapComponentEvent) => {
      expect(result.type).toEqual(MapComponentEventTypes.WMSFEATUREINFO);
      expect(result.mapIndex).toBe(DEFAULT_MAPINDEX);
      expect(result.layerName).toBe("wmsLayerName");
      expect(result.message).toBe(
        "Binnen deze resolutie zijn er geen features gevonden."
      );
      expect(coreSelectionService.handleFeatureInfoForLayer).toHaveBeenCalled();
      done();
    });
    component.getFeatureInfo(event);

    httpTestingController.expectNone("test.url");
  });

  it("should update the styles within the WMS Source and local source options within setStyles", () => {
    const wmsSpy: Spy = spyOn(
      component["wmsSource"],
      "updateParams"
    ).and.callThrough();

    component.setStyles(["styleNew1", "styleNew2"]);

    expect(component.options?.sourceOptions?.params?.["STYLES"]).toEqual([
      "styleNew1",
      "styleNew2"
    ]);
    expect(wmsSpy.calls.count()).withContext("updateParams not called").toBe(1);
    expect(wmsSpy.calls.mostRecent().args[0]).toEqual({
      STYLES: ["styleNew1", "styleNew2"]
    });
  });

  describe("setStyle", () => {
    let wmsSpy: Spy;
    let localSourceUpdateSpy: Spy;

    beforeEach(() => {
      wmsSpy = spyOn(component["wmsSource"], "updateParams").and.callThrough();
      localSourceUpdateSpy = spyOn<any>(
        component,
        "updateLocalSourceOptionsFromWmsSource"
      ).and.callThrough();
    });

    it("should update the style for the correct layer and update the local source with multiple layers", () => {
      spyOn(component["wmsSource"], "getParams").and.returnValue({
        layers: ["layer1", "layer2"],
        STYLES: ["style1", "style2"]
      });

      component.setStyle("styleNew2", "layer2");

      expect(wmsSpy).toHaveBeenCalledOnceWith({
        STYLES: ["style1", "styleNew2"]
      });
      expect(localSourceUpdateSpy).toHaveBeenCalledTimes(1);
    });

    it("should update the style for the correct layer and update the local source with multiple layers with no initial styles", () => {
      spyOn(component["wmsSource"], "getParams").and.returnValue({
        layers: ["layer1", "layer2"]
      });
      component.setStyle("styleNew2", "layer2");

      expect(wmsSpy).toHaveBeenCalledOnceWith({
        STYLES: ["", "styleNew2"]
      });
      expect(localSourceUpdateSpy).toHaveBeenCalledTimes(1);
    });

    it("should update the style for a single layer with an initial style and update the local source", () => {
      spyOn(component["wmsSource"], "getParams").and.returnValue({
        layers: "layer1",
        STYLES: "style1"
      });
      component.setStyle("style1New", "layer1");

      expect(wmsSpy).toHaveBeenCalledOnceWith({
        STYLES: "style1New"
      });
      expect(localSourceUpdateSpy).toHaveBeenCalledTimes(1);
    });

    it("should update the style for a single layer without an initial style and update the local source", () => {
      spyOn(component["wmsSource"], "getParams").and.returnValue({
        layers: "layer1"
      });

      component.setStyle("style1New", "layer1");

      expect(wmsSpy).toHaveBeenCalledOnceWith({
        STYLES: "style1New"
      });
      expect(localSourceUpdateSpy).toHaveBeenCalledTimes(1);
    });

    it("should do nothing if the provided layerName in setStyle does not exist", () => {
      spyOn(component["wmsSource"], "getParams").and.returnValue({
        layers: ["layer1", "layer2"],
        STYLES: ["style1", "style2"]
      });

      component.setStyle("styleNew", "layerUnknown");

      expect(wmsSpy).toHaveBeenCalledTimes(0);
    });
  });

  it("should set the DPI options for all types of servers if devicePixelRatio > 1", () => {
    const params: { [x: string]: any } = {};

    component["addDpiToParams"](params, 3);

    expect(params).toEqual({ DPI: 270, MAP_RESOLUTION: 270 });
  });

  it("should not set the DPI options if devicePixelRatio == 1", () => {
    const params: { [x: string]: any } = {};

    component["addDpiToParams"](params, 1);

    expect(params).toEqual({});
  });

  function setWMSKaartlaagVariables(nameLayer: string) {
    component.options = {
      attributions: "test-attribution",
      getFeatureInfoQueryLayers: ["testQueryLayer"],
      layerName: nameLayer,
      layers: ["testlayer"],
      minResolution: 0,
      maxResolution: 100,
      url: "test.url",
      zIndex: 123
    };
  }
});
