import type { MockedObject } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Injector } from "@angular/core";
import { GgcSearchLocationConnectService } from "./connect.service";

describe("GgcSearchLocationConnectService", () => {
  let service: GgcSearchLocationConnectService;
  let injectorSpy: MockedObject<Injector>;

  let mapServiceInstance: any;

  beforeEach(() => {
    injectorSpy = {
      get: vi.fn().mockName("Injector.get")
    };

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
    vi.spyOn(service as any, "loadMapModule").mockResolvedValue({
      GgcMapService: class {}
    });
  }

  describe("getMapService", () => {
    it("should load MapService via injector", async () => {
      mockModule();
      injectorSpy.get.mockReturnValue(mapServiceInstance);

      const result = await service.getMapService();

      expect(injectorSpy.get).toHaveBeenCalled();
      expect(result).toBe(mapServiceInstance);
    });

    it("should cache MapService (only 1 injector call)", async () => {
      mockModule();
      injectorSpy.get.mockReturnValue(mapServiceInstance);

      const first = await service.getMapService();
      const second = await service.getMapService();

      expect(injectorSpy.get).toHaveBeenCalledTimes(1);
      expect(first).toBe(second);
    });

    it("should return undefined when module load fails", async () => {
      vi.spyOn(service as any, "loadMapModule").mockRejectedValue(
        new Error("fail")
      );

      const result = await service.getMapService();

      expect(result).toBeUndefined();
    });

    it("should return undefined when injector throws error", async () => {
      mockModule();
      injectorSpy.get.mockImplementation(() => {
        throw new Error("injector error");
      });

      const result = await service.getMapService();

      expect(result).toBeUndefined();
    });
  });
});
