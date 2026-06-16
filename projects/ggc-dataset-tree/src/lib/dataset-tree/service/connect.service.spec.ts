import type { MockedObject } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Injector } from "@angular/core";
import { GgcDatasetTreeConnectService } from "./connect.service";

describe("GgcDatasetTreeConnectService", () => {
  let service: GgcDatasetTreeConnectService;
  let injectorSpy: MockedObject<Injector>;

  let cesiumInstance: any;
  let mapLayerInstance: any;
  let mapEventsInstance: any;

  beforeEach(() => {
    injectorSpy = {
      get: vi.fn().mockName("Injector.get")
    };

    cesiumInstance = { name: "cesium" };
    mapLayerInstance = { name: "mapLayer" };
    mapEventsInstance = { name: "mapEvents" };

    TestBed.configureTestingModule({
      providers: [
        GgcDatasetTreeConnectService,
        { provide: Injector, useValue: injectorSpy }
      ]
    });

    service = TestBed.inject(GgcDatasetTreeConnectService);
  });

  function mockImport(module: any) {
    vi.spyOn(service as any, "loadCesiumModule").mockResolvedValue(
      module.cesium
    );
    vi.spyOn(service as any, "loadMapModule").mockResolvedValue(module.map);
  }

  describe("Cesium service", () => {
    it("moet Cesium service laden via injector", async () => {
      mockImport({
        cesium: {
          GgcSharedLayerService: class {}
        }
      });

      injectorSpy.get.mockReturnValue(cesiumInstance);

      const result = await service.getGgcCesiumSharedLayerService();

      expect(injectorSpy.get).toHaveBeenCalled();
      expect(result).toBe(cesiumInstance);
    });

    it("moet Cesium service cachen (maar 1x injector call)", async () => {
      mockImport({
        cesium: {
          GgcSharedLayerService: class {}
        }
      });

      injectorSpy.get.mockReturnValue(cesiumInstance);

      const first = await service.getGgcCesiumSharedLayerService();
      const second = await service.getGgcCesiumSharedLayerService();

      expect(injectorSpy.get).toHaveBeenCalledTimes(1);
      expect(first).toBe(second);
    });

    it("moet undefined retourneren bij fout", async () => {
      vi.spyOn(service as any, "loadCesiumModule").mockRejectedValue("fail");

      const result = await service.getGgcCesiumSharedLayerService();

      expect(result).toBeUndefined();
    });
  });

  describe("GGC Map Layer service", () => {
    it("moet GgcLayerService laden via injector", async () => {
      mockImport({
        map: {
          GgcLayerService: class {},
          GgcMapEventsService: class {}
        }
      });

      injectorSpy.get.mockReturnValue(mapLayerInstance);

      const result = await service.getGgcOLLayerService();

      expect(injectorSpy.get).toHaveBeenCalled();
      expect(result).toBe(mapLayerInstance);
    });

    it("moet GgcLayerService cachen", async () => {
      mockImport({
        map: {
          GgcLayerService: class {},
          GgcMapEventsService: class {}
        }
      });

      injectorSpy.get.mockReturnValue(mapLayerInstance);

      const first = await service.getGgcOLLayerService();
      const second = await service.getGgcOLLayerService();

      expect(injectorSpy.get).toHaveBeenCalledTimes(1);
      expect(first).toBe(second);
    });

    it("moet undefined retourneren bij fout", async () => {
      vi.spyOn(service as any, "loadMapModule").mockRejectedValue("fail");

      const result = await service.getGgcOLLayerService();

      expect(result).toBeUndefined();
    });
  });

  describe("Ggc Map Events service", () => {
    it("moet map events service laden via injector", async () => {
      mockImport({
        map: {
          GgcLayerService: class {},
          GgcMapEventsService: class {}
        }
      });

      injectorSpy.get.mockReturnValue(mapEventsInstance);

      const result = await service.getGgcOLMapEventsService();

      expect(injectorSpy.get).toHaveBeenCalled();
      expect(result).toBe(mapEventsInstance);
    });

    it("moet map events service cachen", async () => {
      mockImport({
        map: {
          GgcLayerService: class {},
          GgcMapEventsService: class {}
        }
      });

      injectorSpy.get.mockReturnValue(mapEventsInstance);

      const first = await service.getGgcOLMapEventsService();
      const second = await service.getGgcOLMapEventsService();

      expect(injectorSpy.get).toHaveBeenCalledTimes(1);
      expect(first).toBe(second);
    });

    it("moet undefined retourneren bij fout", async () => {
      vi.spyOn(service as any, "loadMapModule").mockRejectedValue("fail");

      const result = await service.getGgcOLMapEventsService();

      expect(result).toBeUndefined();
    });
  });
});
