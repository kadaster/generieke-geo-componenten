import { TestBed } from "@angular/core/testing";
import { ImageryLayer, ImageryLayerCollection } from "@cesium/engine";
import { WmtsLayerService } from "./wmts-layer.service";
import { LayerConfig } from "../model/interfaces";

function createTestLayer(layerId: string, zIndex?: number) {
  return {
    layerId: layerId,
    technicalName: "imageryTechName",
    layerName: "name",
    zIndex
  } as LayerConfig;
}

describe("WmtsLayerService", () => {
  let service: WmtsLayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WmtsLayerService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("on creation", () => {
    it("layers should be instance of ImageryLayerCollection", () => {
      expect(service["layers"] instanceof ImageryLayerCollection).toBe(true);
    });
  });

  describe("on addLayer", () => {
    it("layer should be created", () => {
      const layerId = "layer-one";
      service["addLayer"]("imageryLayer/url", createTestLayer(layerId, 2));

      expect(service["layers"]?.length).toBe(1);
      expect(service["layerMap"].size).toBe(1);
      expect(service["layerMap"].has(layerId)).toBeTrue();
      const layerObject = service["layerMap"].get(layerId);
      expect(layerObject?.layer instanceof ImageryLayer).toBeTrue();
      expect(layerObject?.zIndex).toBe(2);
    });

    it("layer with zIndex and layerMap contains layers", () => {
      const layerNameWithoutZIndex = "no-z-index-1";
      const layerNameWithZIndex = "z-index";
      const layerNameWithoutZIndexTwo = "no-z-index-2";
      const layerNameWithoutZIndexThree = "no-z-index-3";
      service["addLayer"](
        "imageryLayer/url",
        createTestLayer(layerNameWithZIndex, 5)
      );
      service["addLayer"](
        "imageryLayer/url",
        createTestLayer(layerNameWithoutZIndex, -1)
      );
      service["addLayer"](
        "imageryLayer/url",
        createTestLayer(layerNameWithoutZIndexTwo)
      );
      service["addLayer"](
        "imageryLayer/url",
        createTestLayer(layerNameWithoutZIndexThree)
      );

      expect(service["layers"]?.length).toBe(4);
      expect(service["layerMap"].size).toBe(4);
      const imageryLayers = service["layers"] as ImageryLayerCollection;
      expect(
        imageryLayers.indexOf(
          service["layerMap"].get(layerNameWithoutZIndex)?.layer as ImageryLayer
        )
      ).toBe(0);
      expect(
        imageryLayers.indexOf(
          service["layerMap"].get(layerNameWithZIndex)?.layer as ImageryLayer
        )
      ).toBe(3);
      expect(
        imageryLayers.indexOf(
          service["layerMap"].get(layerNameWithoutZIndexTwo)
            ?.layer as ImageryLayer
        )
      ).toBe(1);
      expect(
        imageryLayers.indexOf(
          service["layerMap"].get(layerNameWithoutZIndexThree)
            ?.layer as ImageryLayer
        )
      ).toBe(2);
    });
  });
});
