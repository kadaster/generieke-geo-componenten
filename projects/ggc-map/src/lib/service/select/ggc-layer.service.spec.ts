import type { MockedObject } from "vitest";
import { TestBed } from "@angular/core/testing";
import { GgcLayerService } from "./ggc-layer.service";
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
  // let mapServiceSpy: MockedObject<GgcMapService>;
  let capSpy: MockedObject<CoreWmsWmtsCapabilitiesService>;
  let coreMapServiceSpy: MockedObject<CoreMapService>;

  beforeEach(() => {
    coreMapServiceSpy = {
      getLayer: vi.fn().mockName("CoreMapService.getLayer"),
      getLayerChangedObservable: vi
        .fn()
        .mockName("coreMapService.getLayerChangedObservable")
        .mockReturnValue(of()),
      getMap: vi
        .fn()
        .mockName("coreMapService.getMap")
        .mockReturnValue({
          addLayer: vi.fn(),
          removeLayer: vi.fn()
        } as unknown as OlMap),
      emitLayerChangedEvent: vi.fn()
    } as unknown as MockedObject<CoreMapService>;
    capSpy = {
      getCapabilitiesForUrl: vi
        .fn()
        .mockName("CapabilitiesService.getCapabilitiesForUrl")
        .mockReturnValue(of({})),
      optionsFromCapabilities: vi
        .fn()
        .mockName("CapabilitiesService.optionsFromCapabilities")
    } as unknown as MockedObject<CoreWmsWmtsCapabilitiesService>;

    TestBed.configureTestingModule({
      providers: [
        GgcLayerService,
        provideHttpClient(withInterceptorsFromDi()),
        // { provide: GgcMapService, useValue: mapServiceSpy },
        { provide: CoreWmsWmtsCapabilitiesService, useValue: capSpy },
        { provide: CoreMapService, useValue: coreMapServiceSpy }
      ]
    });

    service = TestBed.inject(GgcLayerService);
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
    const mockLayer = {
      get: jasmine.createSpy("get").and.returnValue(undefined)
    };
    const mockMap = {
      removeLayer: vi.fn()
    };

    coreMapServiceSpy.getLayer.mockReturnValue(mockLayer as any);
    coreMapServiceSpy.getMap.mockReturnValue(mockMap as any);

    service.removeLayer("testMap", "testLayer");

    expect(coreMapServiceSpy.getLayer).toHaveBeenCalledWith(
      "testLayer",
      "testMap"
    );
    expect(mockMap.removeLayer).toHaveBeenCalledWith(mockLayer);
  });

  it("should not remove a layer if it does not exist", () => {
    coreMapServiceSpy.getLayer.mockReturnValue(undefined);

    service.removeLayer("testMap", "nonexistentLayer");

    expect(coreMapServiceSpy.getLayer).toHaveBeenCalledWith(
      "nonexistentLayer",
      "testMap"
    );
    expect(coreMapServiceSpy.getMap).not.toHaveBeenCalled();
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
