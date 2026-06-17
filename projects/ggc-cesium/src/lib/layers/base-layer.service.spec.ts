import { TestBed } from "@angular/core/testing";
import { BaseLayerService } from "./base-layer.service";
import { LayerObject } from "../model/core-interfaces";
import { LayerChangedEventTrigger } from "@kadaster/ggc-models";
import { firstValueFrom } from "rxjs";

describe("BaseLayerService", () => {
  let service: BaseLayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BaseLayerService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("on creation", () => {
    it("layerMap should have 0 entries", () => {
      expect(service["layerMap"].size).toEqual(0);
    });
  });

  it("should emit layerChanged when addLayer is called", async () => {
    const testId = "id1";

    const resultPromise = firstValueFrom(service.getLayerChangedObservable());

    service.addLayer("url", { layerId: testId, layerName: "name" });

    const id = await resultPromise;

    expect(id).toEqual({
      layerId: testId,
      eventTrigger: LayerChangedEventTrigger.LAYER_ADDED
    });
  });

  it("isVisible should return true only if the layer exists in the map", () => {
    service["layerMap"].set("idExist", {});

    expect(service.isVisible("idExist")).toBe(true);
    expect(service.isVisible("idNonExist")).toBe(false);
  });

  it("should remove a layer and emit its id", async () => {
    service["layerMap"].set("id1", {});

    const resultPromise = firstValueFrom(service.getLayerChangedObservable());

    service.removeLayer("id1");

    const id = await resultPromise;

    expect(id).toEqual({
      layerId: "id1",
      eventTrigger: LayerChangedEventTrigger.LAYER_REMOVED
    });
    expect(service.isVisible("id1")).toBe(false);
  });

  describe("on destroy", () => {
    beforeEach(() => {
      service["layerMap"].set("layer", {} as LayerObject);
    });
    it("layerMap should have 0 entries", () => {
      expect(service["layerMap"].size).toEqual(1);
      service.destroyLayers();
      expect(service["layerMap"].size).toEqual(0);
    });
  });
});
