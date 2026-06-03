import type { MockedObject } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Injector } from "@angular/core";
import { GgcToolbarConnectService } from "./connect.service";

describe("GgcToolbarConnectService", () => {
  let service: GgcToolbarConnectService;
  let injectorSpy: MockedObject<Injector>;

  beforeEach(() => {
    injectorSpy = {
      get: vi.fn().mockName("Injector.get")
    };

    TestBed.configureTestingModule({
      providers: [
        GgcToolbarConnectService,
        { provide: Injector, useValue: injectorSpy }
      ]
    });

    service = TestBed.inject(GgcToolbarConnectService);
  });

  function mockModule(overrides: Partial<any> = {}) {
    return {
      GgcMapService: class {},
      GgcDrawService: class {},
      MapComponentDrawTypes: { polygon: "polygon" },
      ...overrides
    };
  }

  it("moet geïnitialiseerd worden", () => {
    expect(service).toBeTruthy();
  });

  describe("getMapService", () => {
    it("laadt en retourneert de MapService via de injector", async () => {
      const module = mockModule();
      const mockInstance = { name: "MapService" };

      vi.spyOn<any>(service, "loadMapModule").mockResolvedValue(module);
      injectorSpy.get.mockReturnValue(mockInstance);

      const result = await service.getMapService();

      expect(injectorSpy.get).toHaveBeenCalledWith(module.GgcMapService);
      expect(result).toBe(mockInstance);
    });

    it("cachet de MapService (slechts één injector call)", async () => {
      const module = mockModule();
      const mockInstance = { name: "MapService" };

      vi.spyOn<any>(service, "loadMapModule").mockResolvedValue(module);
      injectorSpy.get.mockReturnValue(mockInstance);

      const first = await service.getMapService();
      const second = await service.getMapService();

      expect(injectorSpy.get).toHaveBeenCalledTimes(1);
      expect(first).toBe(second);
    });

    it("geeft undefined/null terug als injector niets levert", async () => {
      const module = mockModule();

      vi.spyOn<any>(service, "loadMapModule").mockResolvedValue(module);
      injectorSpy.get.mockReturnValue(null);

      const result = await service.getMapService();

      expect(result).toBeNull();
    });

    it("vangt fouten bij laden van module", async () => {
      vi.spyOn<any>(service, "loadMapModule").mockRejectedValue("load error");

      const result = await service.getMapService();

      expect(result).toBeUndefined();
    });
  });

  describe("getDrawService", () => {
    it("laadt en retourneert de DrawService via de injector", async () => {
      const module = mockModule();
      const mockInstance = { name: "DrawService" };

      vi.spyOn<any>(service, "loadMapModule").mockResolvedValue(module);
      injectorSpy.get.mockReturnValue(mockInstance);

      const result = await service.getDrawService();

      expect(injectorSpy.get).toHaveBeenCalledWith(module.GgcDrawService);
      expect(result).toBe(mockInstance);
    });

    it("cachet de DrawService", async () => {
      const module = mockModule();
      const mockInstance = { name: "DrawService" };

      vi.spyOn<any>(service, "loadMapModule").mockResolvedValue(module);
      injectorSpy.get.mockReturnValue(mockInstance);

      await service.getDrawService();
      await service.getDrawService();

      expect(injectorSpy.get).toHaveBeenCalledTimes(1);
    });
  });
});
