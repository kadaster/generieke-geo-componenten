import { TestBed } from "@angular/core/testing";
import { Injector } from "@angular/core";
import { GgcLegendConnectService } from "./connect.service";

describe("GgcLegendConnectService", () => {
  let service: GgcLegendConnectService;
  let injectorSpy: jasmine.SpyObj<Injector>;

  let cesiumService: any;
  let mapLayerService: any;
  let mapEventsService: any;

  beforeEach(() => {
    injectorSpy = jasmine.createSpyObj("Injector", ["get"]);

    cesiumService = { name: "cesiumService" };
    mapLayerService = { name: "mapLayerService" };
    mapEventsService = { name: "mapEventsService" };

    TestBed.configureTestingModule({
      providers: [
        GgcLegendConnectService,
        { provide: Injector, useValue: injectorSpy }
      ]
    });

    service = TestBed.inject(GgcLegendConnectService);
  });

  function mockImports() {
    spyOn<any>(service as any, "loadCesiumModule").and.resolveTo({
      GgcSharedLayerService: class {}
    });

    spyOn<any>(service as any, "loadMapModule").and.resolveTo({
      GgcLayerService: class {},
      GgcMapEventsService: class {}
    });
  }

  describe("Cesium service", () => {
    it("moet Cesium service laden via injector", async () => {
      mockImports();
      injectorSpy.get.and.returnValue(cesiumService);

      const result = await service.getGgcCesiumSharedLayerService();

      expect(injectorSpy.get).toHaveBeenCalled();
      expect(result).toBe(cesiumService);
    });

    it("moet Cesium service cachen (1x injector call)", async () => {
      mockImports();
      injectorSpy.get.and.returnValue(cesiumService);

      const first = await service.getGgcCesiumSharedLayerService();
      const second = await service.getGgcCesiumSharedLayerService();

      expect(injectorSpy.get).toHaveBeenCalledTimes(1);
      expect(first).toBe(second);
    });

    it("moet undefined retourneren bij error", async () => {
      spyOn<any>(service as any, "loadCesiumModule").and.rejectWith(
        new Error("fail")
      );

      const result = await service.getGgcCesiumSharedLayerService();

      expect(result).toBeUndefined();
    });
  });

  describe("GGC Map Layer service", () => {
    it("moet layer service laden via injector", async () => {
      mockImports();
      injectorSpy.get.and.returnValue(mapLayerService);

      const result = await service.getGgcOLLayerService();

      expect(injectorSpy.get).toHaveBeenCalled();
      expect(result).toBe(mapLayerService);
    });

    it("moet layer service cachen", async () => {
      mockImports();
      injectorSpy.get.and.returnValue(mapLayerService);

      const first = await service.getGgcOLLayerService();
      const second = await service.getGgcOLLayerService();

      expect(injectorSpy.get).toHaveBeenCalledTimes(1);
      expect(first).toBe(second);
    });

    it("moet undefined retourneren bij error", async () => {
      spyOn<any>(service as any, "loadMapModule").and.rejectWith(
        new Error("fail")
      );

      const result = await service.getGgcOLLayerService();

      expect(result).toBeUndefined();
    });
  });

  describe("GGC Map Events service", () => {
    it("moet map events service laden via injector", async () => {
      mockImports();
      injectorSpy.get.and.returnValue(mapEventsService);

      const result = await service.getGgcOLMapEventsService();

      expect(injectorSpy.get).toHaveBeenCalled();
      expect(result).toBe(mapEventsService);
    });

    it("moet map events service cachen", async () => {
      mockImports();
      injectorSpy.get.and.returnValue(mapEventsService);

      const first = await service.getGgcOLMapEventsService();
      const second = await service.getGgcOLMapEventsService();

      expect(injectorSpy.get).toHaveBeenCalledTimes(1);
      expect(first).toBe(second);
    });

    it("moet undefined retourneren bij error", async () => {
      spyOn<any>(service as any, "loadMapModule").and.rejectWith(
        new Error("fail")
      );

      const result = await service.getGgcOLMapEventsService();

      expect(result).toBeUndefined();
    });
  });
});
