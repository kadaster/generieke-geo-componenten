import { TestBed } from "@angular/core/testing";
import { Injector } from "@angular/core";
import { GgcDatasetTreeConnectService } from "./connect.service";

describe("GgcDatasetTreeConnectService", () => {
  let service: GgcDatasetTreeConnectService;
  let injectorSpy: jasmine.SpyObj<Injector>;

  let cesiumInstance: any;
  let mapLayerInstance: any;
  let mapEventsInstance: any;

  beforeEach(() => {
    injectorSpy = jasmine.createSpyObj("Injector", ["get"]);

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
    spyOn<any>(service as any, "loadCesiumModule").and.resolveTo(module.cesium);
    spyOn<any>(service as any, "loadMapModule").and.resolveTo(module.map);
  }

  describe("Cesium service", () => {
    it("moet Cesium service laden via injector", async () => {
      mockImport({
        cesium: {
          GgcSharedLayerService: class {}
        }
      });

      injectorSpy.get.and.returnValue(cesiumInstance);

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

      injectorSpy.get.and.returnValue(cesiumInstance);

      const first = await service.getGgcCesiumSharedLayerService();
      const second = await service.getGgcCesiumSharedLayerService();

      expect(injectorSpy.get).toHaveBeenCalledTimes(1);
      expect(first).toBe(second);
    });

    it("moet undefined retourneren bij fout", async () => {
      spyOn<any>(service as any, "loadCesiumModule").and.rejectWith("fail");

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

      injectorSpy.get.and.returnValue(mapLayerInstance);

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

      injectorSpy.get.and.returnValue(mapLayerInstance);

      const first = await service.getGgcOLLayerService();
      const second = await service.getGgcOLLayerService();

      expect(injectorSpy.get).toHaveBeenCalledTimes(1);
      expect(first).toBe(second);
    });

    it("moet undefined retourneren bij fout", async () => {
      spyOn<any>(service as any, "loadMapModule").and.rejectWith("fail");

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

      injectorSpy.get.and.returnValue(mapEventsInstance);

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

      injectorSpy.get.and.returnValue(mapEventsInstance);

      const first = await service.getGgcOLMapEventsService();
      const second = await service.getGgcOLMapEventsService();

      expect(injectorSpy.get).toHaveBeenCalledTimes(1);
      expect(first).toBe(second);
    });

    it("moet undefined retourneren bij fout", async () => {
      spyOn<any>(service as any, "loadMapModule").and.rejectWith("fail");

      const result = await service.getGgcOLMapEventsService();

      expect(result).toBeUndefined();
    });
  });
});
