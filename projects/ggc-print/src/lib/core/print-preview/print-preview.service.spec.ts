import type { MockedObject } from "vitest";
import Interaction from "ol/interaction/Interaction";
import OlMap from "ol/Map";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import { MapAreaSizeInPixels } from "../../model/print-request/mapfish-print-properties";
import { PrintPreviewService } from "./print-preview.service";
import { TestBed } from "@angular/core/testing";
import { GgcMapService } from "@kadaster/ggc-map";

describe("PrintPreviewService", () => {
  let service: PrintPreviewService;
  let mapServiceSpy: MockedObject<GgcMapService>;

  beforeEach(() => {
    mapServiceSpy = {
      getMap: vi.fn()
    } as unknown as MockedObject<GgcMapService>;
    TestBed.configureTestingModule({
      providers: [
        PrintPreviewService,
        { provide: GgcMapService, useValue: mapServiceSpy }
      ]
    });
    service = TestBed.inject(PrintPreviewService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("prepareMapForPrintPreview should create layer and interaction", () => {
    const mapIndex = "print";

    const mapMock = {
      addInteraction(_): void {}
    } as OlMap;

    mapServiceSpy.getMap.mockReturnValue(mapMock);

    service["addLayerToMap"] = vi.fn();
    service["defaultPreviewStyle"] = vi.fn();

    service.prepareMapForPrintPreview(mapIndex);

    expect(mapServiceSpy.getMap).toHaveBeenCalledWith(mapIndex);
    expect(service["addLayerToMap"]).toHaveBeenCalled();
    expect(service["defaultPreviewStyle"]).toHaveBeenCalled();

    expect(service["feature"]).toBeDefined();
    expect(service["translateLayer"]).toBeDefined();
    expect(service["translateInteraction"]).toBeDefined();
    expect(service["translateSubscription"]).toBeDefined();
  });

  it(
    "prepareMapForPrintPreview should create layer and interaction with a custom StyleLike object " +
      "and not call the default style method",
    () => {
      const mapIndex = "print";

      const style = new Style({
        stroke: new Stroke({
          color: "rgba(235, 64, 52, 1)",
          width: 3
        })
      });

      const mapMock = {
        addInteraction(_: Interaction): void {}
      } as OlMap;

      mapServiceSpy.getMap.mockReturnValue(mapMock);

      service["addLayerToMap"] = vi.fn();
      service["defaultPreviewStyle"] = vi.fn();

      service.prepareMapForPrintPreview(mapIndex, style);

      expect(mapServiceSpy.getMap).toHaveBeenCalledWith(mapIndex);
      expect(service["defaultPreviewStyle"]).not.toHaveBeenCalled();

      expect(service["feature"]).toBeDefined();
      expect(service["translateLayer"].getStyle()).toBe(style);
      expect(service["translateInteraction"]).toBeDefined();
      expect(service["translateSubscription"]).toBeDefined();
    }
  );

  it("clearPrintPreview should cleanup layer and translate-interaction", () => {
    service["map"] = {
      removeInteraction: vi.fn()
    } as any;
    service["translateLayer"] = {
      setMap: vi.fn()
    } as any;

    service.clearPrintPreview();

    expect(service["map"].removeInteraction).toHaveBeenCalled();
    expect(service["translateLayer"].setMap).toHaveBeenCalledWith(null);
  });

  it("updateMapAreaSize should set mapAreSize and call updatePrintPreview", () => {
    service["updatePrintPreview"] = vi.fn();

    service.updateMapAreaSize({ width: 12, height: 34 });

    const updatedMapAreaSize: MapAreaSizeInPixels | undefined =
      service["mapAreaSize"];

    if (updatedMapAreaSize) {
      expect(updatedMapAreaSize).toBeDefined();
      expect(updatedMapAreaSize.width).toBe(12);
      expect(updatedMapAreaSize.height).toBe(34);
    } else {
      throw new Error("mapAreaSize should be defined");
    }
    expect(service["updatePrintPreview"]).toHaveBeenCalled();
  });

  it("updateScale should set scale and call updatePrintPreview", () => {
    service["updatePrintPreview"] = vi.fn();

    service.updateScale(1234);

    expect(service["scale"]).toBe(1234);
    expect(service["updatePrintPreview"]).toHaveBeenCalled();
  });

  it("updateCenter should set center and call updatePrintPreview", () => {
    service["updatePrintPreview"] = vi.fn();

    service.updateCenter([12, 34]);

    expect(service["center"]).toEqual([12, 34]);
    expect(service["updatePrintPreview"]).toHaveBeenCalled();
  });

  it("getCenterFromPrintPreview should return center", () => {
    service["center"] = [100, 200];

    const center = service.getCenterFromPrintPreview();

    expect(center).toEqual([100, 200]);
  });

  it("calculateCenter is called and center is undefined, it should set center to the center from map", () => {
    const mapSpy = {
      getView: vi.fn().mockReturnValue({ getCenter: () => [100, 200] })
    } as any;
    service["map"] = mapSpy;

    service["calculateCenter"]();

    expect(mapSpy.getView).toHaveBeenCalled();
    expect(service["center"]).toEqual([100, 200]);
  });

  it("calculateCenter is called and center is defined, it should not get the center from the map", () => {
    service["center"] = [200, 300];

    service["map"] = {
      getView: vi.fn()
    } as any;

    service["calculateCenter"]();

    expect(service["map"].getView).not.toHaveBeenCalled();
    expect(service["center"]).toEqual([200, 300]);
  });

  it("updatePrintPreview is called and center is undefined, it should not update printRectangle", () => {
    service["calculateCenter"] = vi.fn();
    service["mapAreaSize"] = { width: 555, height: 660 };
    service["scale"] = 1000;
    service["feature"] = { setGeometry: vi.fn() } as any;

    service["updatePrintPreview"]();

    expect(service["printRectangle"]).toBeUndefined();
    expect(service["center"]).toBeUndefined();
    expect(service["feature"].setGeometry).not.toHaveBeenCalled();
    expect(service["calculateCenter"]).toHaveBeenCalled();
  });

  it("updatePrintPreview is called and scale is undefined, it should not update printRectangle", () => {
    service["calculateCenter"] = vi.fn();
    service["mapAreaSize"] = { width: 555, height: 660 };
    service["center"] = [123, 456];
    service["feature"] = { setGeometry: vi.fn() } as any;

    service["updatePrintPreview"]();

    expect(service["printRectangle"]).toBeUndefined();
    expect(service["feature"].setGeometry).not.toHaveBeenCalled();
    expect(service["calculateCenter"]).toHaveBeenCalled();
  });

  it("updatePrintPreview is called and mapAreaSize is undefined, it should not update printRectangle", () => {
    service["calculateCenter"] = vi.fn();
    service["scale"] = 1000;
    service["center"] = [3, 4];
    service["feature"] = { setGeometry: vi.fn() } as any;

    service["updatePrintPreview"]();

    expect(service["printRectangle"]).toBeUndefined();
    expect(service["feature"].setGeometry).not.toHaveBeenCalled();
    expect(service["calculateCenter"]).toHaveBeenCalled();
  });

  it(
    "updatePrintPreview is called and printRectangle, scale and mapAreaSize are defined, " +
      "it should get the center from printrectangle",
    () => {
      service["scale"] = 500;
      service["mapAreaSize"] = { width: 555, height: 660 };
      service["center"] = [200, 300];
      service["calculateCenter"] = vi.fn();
      service["feature"] = { setGeometry: vi.fn() } as any;

      service["updatePrintPreview"]();

      expect(service["printRectangle"][0]).toBe(151.05208333333334);
      expect(service["printRectangle"][1]).toBe(241.79166666666669);
      expect(service["printRectangle"][2]).toBe(248.94791666666666);
      expect(service["printRectangle"][3]).toBe(358.2083333333333);
      expect(service["feature"].setGeometry).toHaveBeenCalled();
      expect(service["calculateCenter"]).toHaveBeenCalled();
    }
  );

  it("updatePrintPreviewOnTranslateEvent should update printRectangle", () => {
    const eventMock = {
      features: {
        getLength: () => 1,
        item: () => ({
          getGeometry: () => ({
            getExtent: () => [1, 2, 3, 4]
          })
        })
      }
    } as any;

    service["updatePrintPreviewOnTranslateEvent"](eventMock);

    expect(service["printRectangle"]).toEqual([1, 2, 3, 4]);
    expect(service["center"]).toEqual([2, 3]);
  });
});
