import { TestBed } from "@angular/core/testing";
import { Injector } from "@angular/core";
import { GgcSearchLocationConnectService } from "./connect.service";

describe("GgcSearchLocationConnectService", () => {
  let service: GgcSearchLocationConnectService;
  let injectorSpy: jasmine.SpyObj<Injector>;

  let mapServiceInstance: any;

  beforeEach(() => {
    injectorSpy = jasmine.createSpyObj("Injector", ["get"]);

    mapServiceInstance = { name: "MapService" };

    TestBed.configureTestingModule({
      providers: [
        GgcSearchLocationConnectService,
        { provide: Injector, useValue: injectorSpy }
      ]
    });

    service = TestBed.inject(GgcSearchLocationConnectService);
  });

  /**
   * Mock dynamic import
   */
  function mockModule() {
    spyOn<any>(service as any, "loadMapModule").and.resolveTo({
      GgcMapService: class {}
    });
  }

  describe("getMapService", () => {
    it("should load MapService via injector", async () => {
      mockModule();
      injectorSpy.get.and.returnValue(mapServiceInstance);

      const result = await service.getMapService();

      expect(injectorSpy.get).toHaveBeenCalled();
      expect(result).toBe(mapServiceInstance);
    });

    it("should cache MapService (only 1 injector call)", async () => {
      mockModule();
      injectorSpy.get.and.returnValue(mapServiceInstance);

      const first = await service.getMapService();
      const second = await service.getMapService();

      expect(injectorSpy.get).toHaveBeenCalledTimes(1);
      expect(first).toBe(second);
    });

    it("should return undefined when module load fails", async () => {
      spyOn<any>(service as any, "loadMapModule").and.rejectWith(
        new Error("fail")
      );

      const result = await service.getMapService();

      expect(result).toBeUndefined();
    });

    it("should return undefined when injector throws error", async () => {
      mockModule();
      injectorSpy.get.and.throwError("injector error");

      const result = await service.getMapService();

      expect(result).toBeUndefined();
    });
  });
});
