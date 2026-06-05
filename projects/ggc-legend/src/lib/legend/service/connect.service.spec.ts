import type { MockedObject } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Injector } from "@angular/core";
import { GgcLegendConnectService } from "./connect.service";

describe("GgcLegendConnectService", () => {
  let legendConnectService: GgcLegendConnectService;
  let injectorSpy: MockedObject<Injector>;

  let cesiumService: any;
  let mapLayerService: any;
  let mapEventsService: any;

  beforeEach(() => {
    injectorSpy = {
      get: vi.fn().mockName("Injector.get")
    };

    cesiumService = { name: "cesiumService" };
    mapLayerService = { name: "mapLayerService" };
    mapEventsService = { name: "mapEventsService" };

    TestBed.configureTestingModule({
      providers: [
        GgcLegendConnectService,
        { provide: Injector, useValue: injectorSpy }
      ]
    });

    legendConnectService = TestBed.inject(GgcLegendConnectService);
  });

  function mockImports() {
    vi.spyOn(legendConnectService as any, "loadCesiumModule").mockResolvedValue(
      {
        GgcSharedLayerService: class {}
      }
    );

    vi.spyOn(legendConnectService as any, "loadMapModule").mockResolvedValue({
      GgcLayerService: class {},
      GgcMapEventsService: class {}
    });
  }

  describe("Cesium service", () => {
    it("moet Cesium service laden via injector", async () => {
      mockImports();
      injectorSpy.get.mockReturnValue(cesiumService);

      const result =
        await legendConnectService.getGgcCesiumSharedLayerService();

      expect(injectorSpy.get).toHaveBeenCalled();
      expect(result).toBe(cesiumService);
    });

    it("moet Cesium service cachen (1x injector call)", async () => {
      mockImports();
      injectorSpy.get.mockReturnValue(cesiumService);

      const first = await legendConnectService.getGgcCesiumSharedLayerService();
      const second =
        await legendConnectService.getGgcCesiumSharedLayerService();

      expect(injectorSpy.get).toHaveBeenCalledTimes(1);
      expect(first).toBe(second);
    });

    it("moet undefined retourneren bij error", async () => {
      vi.spyOn(
        legendConnectService as any,
        "loadCesiumModule"
      ).mockRejectedValue(new Error("fail"));

      const result =
        await legendConnectService.getGgcCesiumSharedLayerService();

      expect(result).toBeUndefined();
    });
  });

  describe("GGC Map Layer service", () => {
    it("moet layer service laden via injector", async () => {
      mockImports();
      injectorSpy.get.mockReturnValue(mapLayerService);

      const result = await legendConnectService.getGgcOLLayerService();

      expect(injectorSpy.get).toHaveBeenCalled();
      expect(result).toBe(mapLayerService);
    });

    it("moet layer service cachen", async () => {
      mockImports();
      injectorSpy.get.mockReturnValue(mapLayerService);

      const first = await legendConnectService.getGgcOLLayerService();
      const second = await legendConnectService.getGgcOLLayerService();

      expect(injectorSpy.get).toHaveBeenCalledTimes(1);
      expect(first).toBe(second);
    });

    it("moet undefined retourneren bij error", async () => {
      vi.spyOn(legendConnectService as any, "loadMapModule").mockRejectedValue(
        new Error("fail")
      );

      const result = await legendConnectService.getGgcOLLayerService();

      expect(result).toBeUndefined();
    });
  });

  describe("GGC Map Events service", () => {
    it("moet map events service laden via injector", async () => {
      mockImports();
      injectorSpy.get.mockReturnValue(mapEventsService);

      const result = await legendConnectService.getGgcOLMapEventsService();

      expect(injectorSpy.get).toHaveBeenCalled();
      expect(result).toBe(mapEventsService);
    });

    it("moet map events service cachen", async () => {
      mockImports();
      injectorSpy.get.mockReturnValue(mapEventsService);

      const first = await legendConnectService.getGgcOLMapEventsService();
      const second = await legendConnectService.getGgcOLMapEventsService();

      expect(injectorSpy.get).toHaveBeenCalledTimes(1);
      expect(first).toBe(second);
    });

    it("moet undefined retourneren bij error", async () => {
      vi.spyOn(legendConnectService as any, "loadMapModule").mockRejectedValue(
        new Error("fail")
      );

      const result = await legendConnectService.getGgcOLMapEventsService();

      expect(result).toBeUndefined();
    });
  });
});
