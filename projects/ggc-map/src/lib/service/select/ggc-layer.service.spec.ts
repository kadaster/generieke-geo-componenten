import type { Mock, MockedObject } from "vitest";
import { TestBed } from "@angular/core/testing";
import { GgcLayerService } from "./ggc-layer.service";
import { GgcMapService } from "../../map/service/ggc-map.service";
import { WmtsLayerOptions } from "../../layer/model/wmts-layer.model";
import {
  provideHttpClient,
  withInterceptorsFromDi
} from "@angular/common/http";
import { CoreWmsWmtsCapabilitiesService } from "../../layer/service/core-wms-wmts-capabilities.service";
import { of } from "rxjs";
import { WmsLayerOptions } from "../../layer/model/wms-layer.model";
import { CoreMapService } from "../../map/service/core-map.service";
import OlMap from "ol/Map";
import { DEFAULT_MAPINDEX, Webservice2DType } from "@kadaster/ggc-models";

describe("LayerService", () => {
  let service: GgcLayerService;
  let mapServiceSpy: MockedObject<GgcMapService>;
  let mockCreateComponent: Mock;
  let capSpy: Pick<
    MockedObject<CoreWmsWmtsCapabilitiesService>,
    "getCapabilitiesForUrl" | "optionsFromCapabilities"
  >;
  let coreMapServiceSpy: Pick<
    MockedObject<CoreMapService>,
    "getLayerChangedObservable" | "getMap"
  >;
  beforeEach(() => {
    const mapServiceMock = {
      getLayer: vi.fn().mockName("MapService.getLayer"),
      getMap: vi.fn().mockName("MapService.getMap"),
      getLayerChangedObservable: vi
        .fn()
        .mockName("MapService.getLayerChangedObservable")
    };

    mapServiceMock.getLayer.mockReturnValue(null);
    mapServiceMock.getMap.mockReturnValue({
      removeLayer: vi.fn()
    });
    mapServiceMock.getLayerChangedObservable.mockReturnValue(of());

    mockCreateComponent = vi.fn();
    coreMapServiceSpy = {
      getLayerChangedObservable: vi
        .fn()
        .mockName("coreMapService.getLayerChangedObservable"),
      getMap: vi.fn().mockName("coreMapService.getMap")
    };
    capSpy = {
      getCapabilitiesForUrl: vi
        .fn()
        .mockName("CapabilitiesService.getCapabilitiesForUrl"),
      optionsFromCapabilities: vi
        .fn()
        .mockName("CapabilitiesService.optionsFromCapabilities")
    };
    capSpy.getCapabilitiesForUrl.mockReturnValue(of({}));

    coreMapServiceSpy.getLayerChangedObservable.mockReturnValue(of());
    coreMapServiceSpy.getMap.mockReturnValue({
      addLayer: vi.fn(),
      removeLayer: vi.fn()
    } as unknown as OlMap);

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
    ) as MockedObject<GgcMapService>;
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

    vi.spyOn(service, "addWmsLayer");
    const layerId = service.addWmsLayer(layerOptions);
    service.addWmsLayer(layerOptions);

    expect(isUUID(layerId!)).toBe(true);
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

    vi.spyOn(service, "addWmtsLayer");

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

    vi.spyOn(service, "addWmtsLayer");
    const layerId = service.addWmtsLayer(layerOptions);

    expect(isUUID(layerId!)).toBe(true);
    expect(service.addWmtsLayer).toHaveBeenCalled();
    expect(capSpy.getCapabilitiesForUrl).toHaveBeenCalled();
  });

  it("should remove a layer", () => {
    const mockLayer = {};
    const mockMap = {
      removeLayer: vi.fn()
    };

    mapServiceSpy.getLayer.mockReturnValue(mockLayer as any);
    mapServiceSpy.getMap.mockReturnValue(mockMap as any);

    service.removeLayer("testMap", "testLayer");

    expect(mapServiceSpy.getLayer).toHaveBeenCalledWith("testLayer", "testMap");
    expect(mockMap.removeLayer).toHaveBeenCalledWith(mockLayer);
  });

  it("should not remove a layer if it does not exist", () => {
    mapServiceSpy.getLayer.mockReturnValue(undefined);

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
    vi.spyOn(service, "isVisible").mockImplementation((id) => {
      if (id == "id1") return true;
      if (id == "id2") return false;
      return false;
    });
    vi.spyOn(service, "getEnabled").mockImplementation(() => {
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
