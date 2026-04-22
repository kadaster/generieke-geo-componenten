import { TestBed } from "@angular/core/testing";
import { GgcLayerService } from "./ggc-layer.service";
import { GgcMapService } from "../../map/service/ggc-map.service";
import { WmtsLayerOptions } from "../../layer/model/wmts-layer.model";
import {
  provideHttpClient,
  withInterceptorsFromDi
} from "@angular/common/http";
import { CoreWmsWmtsCapabilitiesService } from "../../layer/service/core-wms-wmts-capabilities.service";
import SpyObj = jasmine.SpyObj;
import { of } from "rxjs";
import { WmsLayerOptions } from "../../layer/model/wms-layer.model";
import { CoreMapService } from "../../map/service/core-map.service";
import OlMap from "ol/Map";
import {
  DEFAULT_MAPINDEX,
  Webservice2DType
} from "@kadaster/ggc-models";

describe("LayerService", () => {
  let service: GgcLayerService;
  let mapServiceSpy: jasmine.SpyObj<GgcMapService>;
  let mockCreateComponent: jasmine.Spy;
  let capSpy: SpyObj<CoreWmsWmtsCapabilitiesService>;
  let coreMapServiceSpy: SpyObj<CoreMapService>;
  beforeEach(() => {
    const mapServiceMock = jasmine.createSpyObj("MapService", [
      "getLayer",
      "getMap",
      "getLayerChangedObservable"
    ]);

    mapServiceMock.getLayer.and.returnValue(null);
    mapServiceMock.getMap.and.returnValue({
      removeLayer: jasmine.createSpy("removeLayer")
    });
    mapServiceMock.getLayerChangedObservable.and.returnValue(of());

    mockCreateComponent = jasmine.createSpy("createComponent");
    coreMapServiceSpy = jasmine.createSpyObj("coreMapService", [
      "getLayerChangedObservable",
      "getMap"
    ]);
    capSpy = jasmine.createSpyObj("CapabilitiesService", [
      "getCapabilitiesForUrl",
      "optionsFromCapabilities"
    ]);
    capSpy.getCapabilitiesForUrl.and.returnValue(of({}));

    coreMapServiceSpy.getLayerChangedObservable.and.returnValue(of());
    coreMapServiceSpy.getMap.and.returnValue(new OlMap());

    TestBed.configureTestingModule({
      providers: [
        GgcLayerService,
        provideHttpClient(withInterceptorsFromDi()),
        { provide: GgcMapService, useValue: mapServiceMock },
        { provide: CoreWmsWmtsCapabilitiesService, useValue: capSpy },
        { provide: CoreMapService, useValue: coreMapServiceSpy }
      ]
    });

    service = TestBed.inject(GgcLayerService);
    mapServiceSpy = TestBed.inject(
      GgcMapService
    ) as jasmine.SpyObj<GgcMapService>;
    (globalThis as any).createComponent = mockCreateComponent;
  });

  afterEach(() => {
    delete (globalThis as any).createComponent;
  });

  it("should add a WMS layer if layerId is not set but generated", () => {
    const layerOptions: WmsLayerOptions = {
      mapIndex: "testMap",
      url: "wmsTestUrl"
    };

    spyOn(service, "addWmsLayer").and.callThrough();
    const layerId = service.addWmsLayer(layerOptions);
    service.addWmsLayer(layerOptions);

    expect(isUUID(layerId!)).toBeTrue();
    expect(service.addWmsLayer).toHaveBeenCalled();
    expect(capSpy.getCapabilitiesForUrl).toHaveBeenCalledWith(
      "wmsTestUrl",
      "WMS",
      false
    );
  });

  it("should add a WMTS layer and initialize it", () => {
    const layerOptions: WmtsLayerOptions = {
      mapIndex: "testMap",
      layerId: "wmtsLayer",
      url: "wmtsTestUrl",
      layer: "testLayer",
      minResolution: 100,
      maxResolution: 1000,
      attributions: "WMTS Test Attribution",
      getFeatureInfoOnSingleclick: false
    };

    spyOn(service, "addWmtsLayer").and.callThrough();

    const layerId = service.addWmtsLayer(layerOptions);

    expect(service.addWmtsLayer).toHaveBeenCalled();
    expect(layerId).toBe("wmtsLayer");
    expect(capSpy.getCapabilitiesForUrl).toHaveBeenCalledWith(
      "wmtsTestUrl",
      "WMTS"
    );
  });

  it("should add a WMTS layer if layerId is not set, but generated", () => {
    const layerOptions: WmtsLayerOptions = {
      mapIndex: "testMap",
      url: "wmtsTestUrl",
      layer: "testLayer",
      minResolution: 100,
      maxResolution: 1000,
      attributions: "WMTS Test Attribution",
      getFeatureInfoOnSingleclick: false
    };

    spyOn(service, "addWmtsLayer").and.callThrough();
    const layerId = service.addWmtsLayer(layerOptions);

    expect(isUUID(layerId!)).toBeTrue();
    expect(service.addWmtsLayer).toHaveBeenCalled();
    expect(capSpy.getCapabilitiesForUrl).toHaveBeenCalled();
  });

  it("should remove a layer", () => {
    const mockLayer = {};
    const mockMap = {
      removeLayer: jasmine.createSpy()
    };

    mapServiceSpy.getLayer.and.returnValue(mockLayer as any);
    mapServiceSpy.getMap.and.returnValue(mockMap as any);

    service.removeLayer("testMap", "testLayer");

    expect(mapServiceSpy.getLayer).toHaveBeenCalledWith("testLayer", "testMap");
    expect(mockMap.removeLayer).toHaveBeenCalledWith(mockLayer);
  });

  it("should not remove a layer if it does not exist", () => {
    mapServiceSpy.getLayer.and.returnValue(undefined);

    service.removeLayer("testMap", "nonexistentLayer");

    expect(mapServiceSpy.getLayer).toHaveBeenCalledWith(
      "nonexistentLayer",
      "testMap"
    );
    expect(mapServiceSpy.getMap).not.toHaveBeenCalled();
  });

  it("should return all active legends", () => {
    service["mapConfigurations"].set(DEFAULT_MAPINDEX, [
      {
        url: "url",
        type: Webservice2DType.WMTS,
        title: "serviceTitle1",
        layers: [
          {
            layerId: "id1",
            title: "layerTitle1",
            activeLegend: { legendUrl: "legendUrlId1" }
          },
          {
            layerId: "id2",
            activeLegend: { legendUrl: "legendUrlId2" }
          }
        ]
      }
    ]);
    spyOn(service, "isVisible").and.callFake((id) => {
      if (id == "id1") return true;
      if (id == "id2") return false;
      return false;
    });
    spyOn(service, "getEnabled").and.callFake(() => {
      return true;
    });
    expect(service.getCurrentActiveLegends(DEFAULT_MAPINDEX)).toEqual([
      {
        layerId: "id1",
        legend: { legendUrl: "legendUrlId1" },
        serviceTitle: "serviceTitle1",
        layerTitle: "layerTitle1",
        layerEnabled: true,
        legendIndex: undefined
      }
    ]);
  });

  function isUUID(str: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
});
