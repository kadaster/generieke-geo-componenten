import type { MockedObject } from "vitest";
import { TestBed } from "@angular/core/testing";
import { GgcSharedLayerService } from "./ggc-shared-layer.service";
import { GeoJsonLayerService } from "./geojson-layer.service";
import { Tiles3dLayerService } from "./tiles3d-layer.service";
import { WmtsLayerService } from "./wmts-layer.service";
import { Subject } from "rxjs";
import { LayerConfig, Webservice } from "../model/interfaces";
import {
  CesiumLayerChangedEvent,
  Webservice3DType
} from "@kadaster/ggc-models";
import { vi } from "vitest";

describe("SharedLayerService", () => {
  let service: GgcSharedLayerService;

  let geoJsonServiceSpy: MockedObject<GeoJsonLayerService>;
  let tiles3dServiceSpy: MockedObject<Tiles3dLayerService>;
  let wmtsServiceSpy: MockedObject<WmtsLayerService>;

  beforeEach(() => {
    geoJsonServiceSpy = {
      addLayer: vi.fn().mockName("GeoJsonLayerService.addLayer"),
      removeLayer: vi.fn().mockName("GeoJsonLayerService.removeLayer"),
      isVisible: vi.fn().mockName("GeoJsonLayerService.isVisible"),
      getEnabled: vi.fn().mockName("GeoJsonLayerService.getEnabled"),
      getLayerChangedObservable: vi
        .fn()
        .mockName("GeoJsonLayerService.getLayerChangedObservable")
    } as MockedObject<GeoJsonLayerService>;
    tiles3dServiceSpy = {
      addLayer: vi.fn().mockName("Tiles3dLayerService.addLayer"),
      removeLayer: vi.fn().mockName("Tiles3dLayerService.removeLayer"),
      isVisible: vi.fn().mockName("Tiles3dLayerService.isVisible"),
      getEnabled: vi.fn().mockName("Tiles3dLayerService.getEnabled"),
      getLayerChangedObservable: vi
        .fn()
        .mockName("Tiles3dLayerService.getLayerChangedObservable")
    } as MockedObject<Tiles3dLayerService>;
    wmtsServiceSpy = {
      addLayer: vi.fn().mockName("WmtsLayerService.addLayer"),
      removeLayer: vi.fn().mockName("WmtsLayerService.removeLayer"),
      isVisible: vi.fn().mockName("WmtsLayerService.isVisible"),
      getEnabled: vi.fn().mockName("WmtsLayerService.getEnabled"),
      getLayerChangedObservable: vi
        .fn()
        .mockName("WmtsLayerService.getLayerChangedObservable")
    } as MockedObject<WmtsLayerService>;

    geoJsonServiceSpy.getLayerChangedObservable.mockReturnValue(
      new Subject<CesiumLayerChangedEvent>()
    );
    tiles3dServiceSpy.getLayerChangedObservable.mockReturnValue(
      new Subject<CesiumLayerChangedEvent>()
    );
    wmtsServiceSpy.getLayerChangedObservable.mockReturnValue(
      new Subject<CesiumLayerChangedEvent>()
    );

    TestBed.configureTestingModule({
      providers: [
        GgcSharedLayerService,
        { provide: GeoJsonLayerService, useValue: geoJsonServiceSpy },
        { provide: Tiles3dLayerService, useValue: tiles3dServiceSpy },
        { provide: WmtsLayerService, useValue: wmtsServiceSpy }
      ]
    });

    service = TestBed.inject(GgcSharedLayerService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should load webservices and call addLayer for visible layers", () => {
    const webserviceGeojson: Webservice = {
      url: "geojsonUrl",
      type: Webservice3DType.GEOJSON,
      layers: [{ layerId: "idGeojson", visible: true } as LayerConfig]
    };
    const webserviceWmts: Webservice = {
      url: "wmtsUrl",
      type: Webservice3DType.WMTS,
      layers: [{ layerId: "idWtms", visible: true } as LayerConfig]
    };
    const webservice3dTiles: Webservice = {
      url: "drieDtilesUrl",
      type: Webservice3DType.TILES3D,
      layers: [{ layerId: "idTiles3D", visible: true } as LayerConfig]
    };

    service.loadWebservices([
      webserviceGeojson,
      webserviceWmts,
      webservice3dTiles
    ]);

    expect(geoJsonServiceSpy.addLayer).toHaveBeenCalledWith(
      "geojsonUrl",
      expect.objectContaining({ layerId: "idGeojson" })
    );
    expect(wmtsServiceSpy.addLayer).toHaveBeenCalledWith(
      "wmtsUrl",
      expect.objectContaining({ layerId: "idWtms" })
    );
    expect(tiles3dServiceSpy.addLayer).toHaveBeenCalledWith(
      "drieDtilesUrl",
      expect.objectContaining({ layerId: "idTiles3D" })
    );
  });

  it("should load webservices and not call addLayer for invisible layers", () => {
    const webserviceGeojson: Webservice = {
      url: "geojsonUrl",
      type: Webservice3DType.GEOJSON,
      layers: [{ layerId: "idGeojson", visible: false } as LayerConfig]
    };

    service.loadWebservices([webserviceGeojson]);

    expect(geoJsonServiceSpy.addLayer).not.toHaveBeenCalled();
  });

  it("should call addLayer to correct service", () => {
    const layer: LayerConfig = {
      layerId: "id1",
      visible: true,
      layerName: "name",
      url: "url"
    };

    service.addLayer(Webservice3DType.WMTS, layer);
    expect(wmtsServiceSpy.addLayer).toHaveBeenCalled();
  });

  it("should call removeLayer on the correct service", () => {
    const layer: LayerConfig = {
      layerId: "id1",
      title: "TestLayer"
    } as LayerConfig;

    service["layerConfigurations"].push({
      url: "https:////x",
      type: Webservice3DType.TILES3D,
      layers: [layer]
    });
    service.removeLayer("id1");
    expect(tiles3dServiceSpy.removeLayer).toHaveBeenCalledWith("id1");
  });

  it("should reload a layer by removing and re-adding it", () => {
    const layerId = "id1";

    const removeSpy = vi.spyOn(service, "removeLayer");
    const addSpy = vi.spyOn(service as any, "addLayerFromLayersConfig");

    service.reloadLayer(layerId);

    expect(removeSpy).toHaveBeenCalledWith(layerId);
    expect(addSpy).toHaveBeenCalledWith(layerId);
  });

  it("should return true if any service reports visible", () => {
    wmtsServiceSpy.isVisible.mockReturnValue(false);
    geoJsonServiceSpy.isVisible.mockReturnValue(true);

    expect(service.isVisible("id1")).toBe(true);
  });

  it("should remove layer if currently visible when toggled", () => {
    geoJsonServiceSpy.isVisible.mockReturnValue(true);

    const layer: LayerConfig = { layerId: "id1" } as LayerConfig;

    service["layerConfigurations"].push({
      url: "https:////x",
      type: Webservice3DType.GEOJSON,
      layers: [layer]
    });

    service.toggleVisibility("id1");

    expect(geoJsonServiceSpy.removeLayer).toHaveBeenCalledWith("id1");
  });

  it("should add layer if currently not visible when toggled", () => {
    geoJsonServiceSpy.isVisible.mockReturnValue(false);
    wmtsServiceSpy.isVisible.mockReturnValue(false);
    tiles3dServiceSpy.isVisible.mockReturnValue(false);

    const layer: LayerConfig = {
      layerId: "id1",
      layerName: "x",
      url: "https:////x"
    };

    service["layerConfigurations"].push({
      url: "https:////x",
      type: Webservice3DType.GEOJSON,
      layers: [layer]
    });

    service.toggleVisibility("id1");
    expect(geoJsonServiceSpy.addLayer).toHaveBeenCalled();
  });

  it("should return the layer title", () => {
    service["layerConfigurations"].push({
      url: "https:////x",
      type: Webservice3DType.WMTS,
      layers: [{ layerId: "id1", title: "MyLayer" } as LayerConfig]
    });
    expect(service.getTitle("id1")).toBe("MyLayer");
  });

  it("should return enabled of a layer", () => {
    wmtsServiceSpy.getEnabled.mockReturnValue(true);
    service["layerConfigurations"].push({
      url: "https:////x",
      type: Webservice3DType.WMTS,
      layers: [{ layerId: "id1" } as LayerConfig]
    });
    expect(service.getEnabled("id1")).toBe(true);
  });

  it("should return all active legends", () => {
    service["layerConfigurations"].push({
      url: "url",
      type: Webservice3DType.WMTS,
      title: "serviceTitle1",
      layers: [
        {
          layerId: "id1",
          title: "layerTitle1",
          activeLegend: { legendUrl: "legendUrlId1" }
        } as LayerConfig
      ]
    });
    service["layerConfigurations"].push({
      url: "url",
      type: Webservice3DType.WMTS,
      layers: [
        {
          layerId: "id2",
          activeLegend: { legendUrl: "legendUrlId2" }
        } as LayerConfig
      ]
    });
    wmtsServiceSpy.isVisible.mockImplementation((id) => {
      if (id == "id1") return true;
      if (id == "id2") return false;
      return false;
    });
    wmtsServiceSpy.getEnabled.mockReturnValue(true);
    expect(service.getCurrentActiveLegends()).toEqual([
      {
        layerId: "id1",
        legend: { legendUrl: "legendUrlId1" },
        serviceTitle: "serviceTitle1",
        layerTitle: "layerTitle1",
        layerEnabled: true
      }
    ]);
  });

  describe("setVisibilityLayers", () => {
    beforeEach(() => {
      service["layerConfigurations"].push({
        url: "https://test",
        type: Webservice3DType.GEOJSON,
        layers: [
          { layerId: "id1", layerName: "layer1", url: "url" } as LayerConfig,
          { layerId: "id2", layerName: "layer2", url: "url" } as LayerConfig
        ]
      });
    });

    it("should add layer when visible = true and layer is not visible", () => {
      geoJsonServiceSpy.isVisible.mockReturnValue(false);
      wmtsServiceSpy.isVisible.mockReturnValue(false);
      tiles3dServiceSpy.isVisible.mockReturnValue(false);

      service.setVisibilityLayers(["id1"], true);

      expect(geoJsonServiceSpy.addLayer).toHaveBeenCalled();
    });

    it("should NOT add layer when already visible", () => {
      geoJsonServiceSpy.isVisible.mockReturnValue(true);

      service.setVisibilityLayers(["id1"], true);

      expect(geoJsonServiceSpy.addLayer).not.toHaveBeenCalled();
    });

    it("should remove layer when visible = false and layer is visible", () => {
      geoJsonServiceSpy.isVisible.mockReturnValue(true);

      service.setVisibilityLayers(["id1"], false);

      expect(geoJsonServiceSpy.removeLayer).toHaveBeenCalledWith("id1");
    });

    it("should NOT remove layer when already not visible", () => {
      geoJsonServiceSpy.isVisible.mockReturnValue(false);
      wmtsServiceSpy.isVisible.mockReturnValue(false);
      tiles3dServiceSpy.isVisible.mockReturnValue(false);

      service.setVisibilityLayers(["id1"], false);

      expect(geoJsonServiceSpy.removeLayer).not.toHaveBeenCalled();
    });

    it("should handle multiple layerIds correctly", () => {
      geoJsonServiceSpy.isVisible.mockImplementation(
        (id: string) => id === "id1"
      );

      service.setVisibilityLayers(["id1", "id2"], false);

      expect(geoJsonServiceSpy.removeLayer).toHaveBeenCalledWith("id1");
      expect(geoJsonServiceSpy.removeLayer).not.toHaveBeenCalledWith("id2");
    });

    it("should ignore undefined layerIds", () => {
      geoJsonServiceSpy.isVisible.mockReturnValue(false);

      service.setVisibilityLayers(["id1", undefined as any], true);

      expect(geoJsonServiceSpy.addLayer).toHaveBeenCalledTimes(1);
    });
  });
});
