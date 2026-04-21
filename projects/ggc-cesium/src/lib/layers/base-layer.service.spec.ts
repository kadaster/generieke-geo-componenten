import { TestBed } from "@angular/core/testing";
import { BaseLayerService } from "./base-layer.service";
import { LayerObject } from "../model/core-interfaces";
import { take } from "rxjs/operators";
import { LayerChangedEventTrigger } from "@kadaster/ggc-models";

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

  it("should emit layerChanged when addLayer is called", (done) => {
    const testId = "id1";
    service
      .getLayerChangedObservable()
      .pipe(take(1))
      .subscribe((id) => {
        expect(id).toEqual({
          layerId: testId,
          eventTrigger: LayerChangedEventTrigger.LAYER_ADDED
        });
        done();
      });
    service.addLayer("url", { layerId: testId, layerName: "name" });
  });

  it("isVisible should return true only if the layer exists in the map", () => {
    service["layerMap"].set("idExist", {});

    expect(service.isVisible("idExist")).toBeTrue();
    expect(service.isVisible("idNonExist")).toBeFalse();
  });

  it("should remove a layer and emit its id", (done) => {
    service["layerMap"].set("id1", {});

    service
      .getLayerChangedObservable()
      .pipe(take(1))
      .subscribe((id) => {
        expect(id).toEqual({
          layerId: "id1",
          eventTrigger: LayerChangedEventTrigger.LAYER_REMOVED
        });
        expect(service.isVisible("id1")).toBeFalse();
        done();
      });

    service.removeLayer("id1");
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
