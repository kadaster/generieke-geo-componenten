import type { MockedObject } from "vitest";
import { TestBed } from "@angular/core/testing";
import { GgcLayerService } from "./ggc-layer.service";
import { WmtsLayerOptions } from "../../layer/model/wmts-layer.model";
import {
  provideHttpClient,
  withInterceptorsFromDi
} from "@angular/common/http";
import { CoreWmsWmtsCapabilitiesRequestService } from "../../layer/service/core-wms-wmts-capabilities-request.service";
import { of } from "rxjs";
import { WmsLayerOptions } from "../../layer/model/wms-layer.model";
import { VectorTileLayerOptions } from "../../layer/model/vector-tile-layer.model";
import { CoreMapService } from "../../map/service/core-map.service";
import OlMap from "ol/Map";
import { DEFAULT_MAPINDEX, Webservice2DType } from "@kadaster/ggc-models";
import { LayerChangedEventTrigger } from "@kadaster/ggc-models/src/lib/models/layer-changed-event.model";
import { createWmtsCapabilitiesMock } from "../../layer/service/mock/wmts-capabilities.mock";

describe("LayerService", () => {
  let service: GgcLayerService;
  let capSpy: MockedObject<CoreWmsWmtsCapabilitiesRequestService>;
  let coreMapServiceSpy: MockedObject<CoreMapService>;

  const MAP_INDEX = "testMap";

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
    } as unknown as MockedObject<CoreWmsWmtsCapabilitiesRequestService>;

    TestBed.configureTestingModule({
      providers: [
        GgcLayerService,
        provideHttpClient(withInterceptorsFromDi()),
        // { provide: GgcMapService, useValue: mapServiceSpy },
        { provide: CoreWmsWmtsCapabilitiesRequestService, useValue: capSpy },
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

    capSpy.getCapabilitiesForUrl.mockReturnValue(
      of(createWmtsCapabilitiesMock("testLayer"))
    );
    vi.spyOn(service, "addWmtsLayer");

    const layerId = service.addWmtsLayer(layerOptions);

    expect(service.addWmtsLayer).toHaveBeenCalled();
    expect(layerId).toBe("wmtsLayer");
    expect(capSpy.getCapabilitiesForUrl).toHaveBeenCalledWith(
      "wmtsTestUrl",
      "WMTS",
      false
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
    capSpy.getCapabilitiesForUrl.mockReturnValue(
      of(createWmtsCapabilitiesMock("testLayer"))
    );
    const layerId = service.addWmtsLayer(layerOptions);

    expect(isUUID(layerId!)).toBe(true);
    expect(service.addWmtsLayer).toHaveBeenCalled();
    expect(capSpy.getCapabilitiesForUrl).toHaveBeenCalled();
  });

  it("should remove a layer", () => {
    const mockLayer = {
      get: vi.fn().mockReturnValue(undefined)
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

  describe("loadWebservices", () => {
    function createWebservice(layerOverrides: any = {}) {
      return {
        url: "http://test-url",
        type: Webservice2DType.WMS,
        title: "testService",
        layers: [
          {
            layerId: "layer1",
            ...layerOverrides
          }
        ]
      };
    }

    it.each([
      { visible: true, persistent: undefined, shouldAdd: true },
      { visible: undefined, persistent: undefined, shouldAdd: true },
      { visible: false, persistent: undefined, shouldAdd: false },
      { visible: true, persistent: true, shouldAdd: true },
      { visible: false, persistent: true, shouldAdd: true }
    ])(
      "should handle visibility correctly",
      ({ visible, persistent, shouldAdd }) => {
        const webservice = createWebservice({ visible, persistent });

        const addLayerSpy = vi
          .spyOn(service, "addLayer")
          .mockReturnValue("layer1");

        service.loadWebservices([webservice as any], MAP_INDEX);

        if (shouldAdd) {
          expect(addLayerSpy).toHaveBeenCalledTimes(1);
        } else {
          expect(addLayerSpy).not.toHaveBeenCalled();
        }
      }
    );

    it("should set extra properties on layers", () => {
      const webservice = createWebservice();

      service.loadWebservices([webservice as any], MAP_INDEX);

      const layer = webservice.layers[0];

      expect(layer.url).toBe("http://test-url");
      expect(layer.mapIndex).toBe(MAP_INDEX);
      expect(layer.visible).toBe(true); // default applied
    });

    it("should preserve explicit visible=false", () => {
      const webservice = createWebservice({ visible: false });

      service.loadWebservices([webservice as any], MAP_INDEX);

      const layer = webservice.layers[0];

      expect(layer.visible).toBe(false);
    });

    it("should emit LAYER_INITIALIZED for every layer", () => {
      const webservice = {
        url: "url",
        type: Webservice2DType.WMS,
        layers: [{ layerId: "l1" }, { layerId: "l2", visible: false }]
      };

      const emitSpy = vi.spyOn(service as any, "emitLayerChanged");

      service.loadWebservices([webservice as any], MAP_INDEX);

      expect(emitSpy).toHaveBeenCalledWith(
        "l1",
        MAP_INDEX,
        LayerChangedEventTrigger.LAYER_INITIALIZED
      );

      expect(emitSpy).toHaveBeenCalledWith(
        "l2",
        MAP_INDEX,
        LayerChangedEventTrigger.LAYER_INITIALIZED
      );

      expect(emitSpy).toHaveBeenCalledTimes(2);
    });
  });

  it("should return layer configs for given mapIndex", () => {
    const config = [
      {
        url: "test-url",
        type: Webservice2DType.WMS,
        layers: [{ layerId: "layer-1", title: "Layer 1" }]
      }
    ];

    service["mapConfigurations"].set("testMap", config as any);
    const result = service.getLayerConfigs("testMap");
    expect(result).toEqual(config);
  });

  it("should reload a layer by removing and adding it again", () => {
    const removeSpy = vi.spyOn(service, "removeLayer");
    const addSpy = vi.spyOn(service as any, "addLayerFromMapConfig");

    service.reloadLayer("layer-1", "testMap");

    expect(removeSpy).toHaveBeenCalledWith("testMap", "layer-1");
    expect(addSpy).toHaveBeenCalledWith("layer-1", "testMap");
  });

  describe("styles", () => {
    function loadStylesWebservice(
      layerOverrides: any = {},
      type: Webservice2DType = Webservice2DType.WMS
    ) {
      const webservice = {
        url: "http://test-url",
        type,
        title: "testService",
        layers: [
          {
            layerId: "layer1",
            visible: false,
            styles: [
              {
                name: "standaard",
                title: "Standaardvisualisatie",
                legend: {
                  layerId: "layer1",
                  legend: { legendUrl: "standaard.png" }
                }
              },
              {
                name: "kwaliteit",
                title: "Kwaliteitsvisualisatie",
                legend: {
                  layerId: "layer1",
                  legend: { legendUrl: "kwaliteit.png" }
                }
              }
            ],
            ...layerOverrides
          }
        ]
      };
      service.loadWebservices([webservice as any], MAP_INDEX);
      return webservice;
    }

    it("should return the configured styles of a layer", () => {
      loadStylesWebservice();

      expect(
        service.getStyles("layer1", MAP_INDEX).map((style) => style.name)
      ).toEqual(["standaard", "kwaliteit"]);
    });

    it("should return an empty array when a layer has no styles", () => {
      loadStylesWebservice({ styles: undefined });

      expect(service.getStyles("layer1", MAP_INDEX)).toEqual([]);
    });

    it("should make the first style active when no activeStyle is configured", () => {
      loadStylesWebservice();

      expect(service.getActiveStyle("layer1", MAP_INDEX)?.name).toBe(
        "standaard"
      );
      expect(service.getLayerConfig("layer1", MAP_INDEX)?.activeLegend).toEqual(
        { legendUrl: "standaard.png" }
      );
    });

    it("should keep the configured activeStyle", () => {
      loadStylesWebservice({ activeStyle: "kwaliteit" });

      expect(service.getActiveStyle("layer1", MAP_INDEX)?.name).toBe(
        "kwaliteit"
      );
    });

    it("should set the active style, its legend and the WMS STYLES parameter", () => {
      loadStylesWebservice();

      service.setActiveStyle("kwaliteit", "layer1", MAP_INDEX);

      const layerConfig = service.getLayerConfig(
        "layer1",
        MAP_INDEX
      ) as WmsLayerOptions;
      expect(layerConfig.activeStyle).toBe("kwaliteit");
      expect(layerConfig.activeLegend).toEqual({ legendUrl: "kwaliteit.png" });
      expect(layerConfig.sourceOptions?.params?.["STYLES"]).toBe("kwaliteit");
    });

    it("should set the WMTS style on the source options", () => {
      loadStylesWebservice({}, Webservice2DType.WMTS);

      service.setActiveStyle("kwaliteit", "layer1", MAP_INDEX);

      const layerConfig = service.getLayerConfig(
        "layer1",
        MAP_INDEX
      ) as WmtsLayerOptions;
      expect(layerConfig.sourceOptions?.style).toBe("kwaliteit");
    });

    it("should set the vector tile style url from the style legend", () => {
      loadStylesWebservice(
        {
          styles: [
            {
              name: "standaard",
              legend: {
                layerId: "layer1",
                legend: { name: "standaard", url: "standaard-mapbox.json" }
              }
            },
            {
              name: "darkmode",
              legend: {
                layerId: "layer1",
                legend: { name: "darkmode", url: "darkmode-mapbox.json" }
              }
            }
          ]
        },
        Webservice2DType.VECTOR
      );

      service.setActiveStyle("darkmode", "layer1", MAP_INDEX);

      expect(
        (service.getLayerConfig("layer1", MAP_INDEX) as VectorTileLayerOptions)
          .style
      ).toBe("darkmode-mapbox.json");
    });

    it("should reload a visible layer when the active style changes", () => {
      loadStylesWebservice({ visible: true });
      vi.spyOn(service, "isVisible").mockReturnValue(true);
      const reloadSpy = vi.spyOn(service, "reloadLayer").mockReturnValue();

      service.setActiveStyle("kwaliteit", "layer1", MAP_INDEX);

      expect(reloadSpy).toHaveBeenCalledWith("layer1", MAP_INDEX);
    });

    it("should ignore an unknown style", () => {
      loadStylesWebservice();
      const reloadSpy = vi.spyOn(service, "reloadLayer").mockReturnValue();

      service.setActiveStyle("onbekend", "layer1", MAP_INDEX);

      expect(service.getActiveStyle("layer1", MAP_INDEX)?.name).toBe(
        "standaard"
      );
      expect(reloadSpy).not.toHaveBeenCalled();
    });
  });

  function isUUID(str: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
});
