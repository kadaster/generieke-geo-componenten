import { TestBed } from "@angular/core/testing";
import { Tiles3dLayerService } from "./tiles3d-layer.service";
import {
  Cesium3DTileFeature,
  Cesium3DTileset,
  PrimitiveCollection,
  Request,
  Resource
} from "@cesium/engine";
import { CoreCameraService } from "../service/core-camera.service";
import { LayerObject } from "../model/core-interfaces";
import { LayerConfig, TilesetConfig } from "../model/interfaces";
import { Subscription } from "rxjs";

describe("Tiles3dLayerService", () => {
  let service: Tiles3dLayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Tiles3dLayerService, CoreCameraService]
    });
    service = TestBed.inject(Tiles3dLayerService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("on creation", () => {
    it("layers should be instance of PrimitiveCollection", () => {
      expect(service["layers"] instanceof PrimitiveCollection).toBe(true);
    });
  });

  describe("on destroy", () => {
    it("it should clean up", () => {
      service["tilesetConfigs"] = [{} as TilesetConfig];
      service["cameraSubscriptions"].set("Test", {
        unsubscribe() {
          /* function */
        }
      } as Subscription);

      service.destroyLayers();

      expect(service["layers"]).toBeNull();
      expect(service["tilesetConfigs"].length).toBe(0);
      expect(service["cameraSubscriptions"].size).toBe(0);
    });
  });

  describe("on addLayer", () => {
    let createTilesetSpy: jasmine.Spy<any>;
    let layer: LayerConfig;
    const layerId = "testName";
    beforeEach(() => {
      createTilesetSpy = spyOn<any>(service, "createTileset");
      createTilesetSpy.and.resolveTo({} as Cesium3DTileset);

      layer = {
        layerId: layerId,
        layerName: "layerName"
      } as LayerConfig;
    });

    it("layer should be created", async () => {
      service["addLayer"]("3DTilesetLayer/url", layer);
      await createTilesetSpy;

      expect(service["layers"]?.length).toBe(1);
      expect(service["layerMap"].size).toBe(1);
      expect(service["layerMap"].has(layerId)).toBeTrue();
      expect(service["layerMap"].get(layerId)?.showFromDataset).toBeTrue();
      expect(
        service["layerMap"].get(layerId)?.showFromCameraCallback
      ).toBeUndefined();
      expect(service["createTileset"]).toHaveBeenCalledWith(
        "3DTilesetLayer/url",
        undefined
      );
    });

    it("should not update showFromDataset if already false, when layer is created", async () => {
      service["layerMap"].set(layerId, { showFromDataset: false });

      service["addLayer"]("3DTilesetLayer/url", layer);
      await createTilesetSpy;

      expect(service["layers"]?.length).toBe(1);
      expect(service["layerMap"].size).toBe(1);
      expect(service["layerMap"].has(layerId)).toBeTrue();
      expect(service["layerMap"].get(layerId)?.showFromDataset).toBeFalse();
      expect(
        service["layerMap"].get(layerId)?.showFromCameraCallback
      ).toBeUndefined();
      expect(service["createTileset"]).toHaveBeenCalledWith(
        "3DTilesetLayer/url",
        undefined
      );
    });

    it("layer should be created with constructorOptions", async () => {
      const constructorOptions = { maximumScreenSpaceError: 10 };
      service.setConfigs([
        {
          layerId,
          constructorOptions
        }
      ]);

      service["addLayer"]("3DTilesetLayer/url", layer);
      await createTilesetSpy;

      expect(service["layers"]?.length).toBe(1);
      expect(service["layerMap"].size).toBe(1);
      expect(service["layerMap"].has(layerId)).toBeTrue();
      expect(service["createTileset"]).toHaveBeenCalledWith(
        "3DTilesetLayer/url",
        constructorOptions
      );
    });

    it("layer should be created and showFromCameraCallback should be false, when cameraValuesShowFunction is present for layerName", async () => {
      service.setConfigs([
        {
          layerId,
          cameraValuesShowFunction: () => {
            return true;
          }
        }
      ]);

      service["addLayer"]("3DTilesetLayer/url", layer);
      await createTilesetSpy;

      expect(service["layers"]?.length).toBe(1);
      expect(service["layerMap"].size).toBe(1);
      expect(service["layerMap"].has(layerId)).toBeTrue();
      expect(service["createTileset"]).toHaveBeenCalledWith(
        "3DTilesetLayer/url",
        undefined
      );
    });

    it("should call subscribeToFunction, when cameraValuesShowFunction is present in tilesetConfig", async () => {
      const cameraValuesShowFunction = () => {
        return true;
      };
      const tilesetConfigs: TilesetConfig[] = [
        { layerId: "layer" },
        {
          layerId: "layer-with-function",
          cameraValuesShowFunction
        }
      ];
      service.setConfigs(tilesetConfigs);
      service.addLayer("url", {
        layerId: "layer-with-function",
        layerName: "name"
      } as LayerConfig);

      await createTilesetSpy;

      expect(
        service["cameraSubscriptions"].has("layer-with-function")
      ).toBeTrue();
    });

    describe("on getLayerName", () => {
      it("should return empty string when feature is undefined", () => {
        const emptyLayerName = service.getLayerName(undefined);

        expect(emptyLayerName).toEqual("");
      });

      it("should return layerName when feature's tileset is present in layerMap", () => {
        service["layerMap"].set("layerNameOne", createLayerObject("url/first"));
        service["layerMap"].set(
          "layerNameTwo",
          createLayerObject("url/second")
        );

        const mockFeature = {
          tileset: {
            resource: {
              request: {
                url: "url/second"
              } as Request
            } as Resource
          } as Cesium3DTileset
        } as Cesium3DTileFeature;

        const layerName = service.getLayerName(mockFeature);

        expect(layerName).toEqual("layerNameTwo");
      });
    });
  });

  function createLayerObject(url: string): LayerObject {
    return {
      layer: {
        resource: {
          request: {
            url
          } as Request
        } as Resource
      } as Cesium3DTileset,
      showFromDataset: true
    };
  }
});
