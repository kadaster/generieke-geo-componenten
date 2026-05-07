import { TestBed } from "@angular/core/testing";
import { Injector } from "@angular/core";
import { GgcToolbarConnectService } from "./connect.service";

describe("GgcToolbarConnectService", () => {
  let service: GgcToolbarConnectService;
  let injectorSpy: jasmine.SpyObj<Injector>;

  beforeEach(() => {
    injectorSpy = jasmine.createSpyObj("Injector", ["get"]);

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

      spyOn<any>(service, "loadMapModule").and.resolveTo(module);
      injectorSpy.get.and.returnValue(mockInstance);

      const result = await service.getMapService();

      expect(injectorSpy.get).toHaveBeenCalledWith(module.GgcMapService);
      expect(result).toBe(mockInstance);
    });

    it("cachet de MapService (slechts één injector call)", async () => {
      const module = mockModule();
      const mockInstance = { name: "MapService" };

      spyOn<any>(service, "loadMapModule").and.resolveTo(module);
      injectorSpy.get.and.returnValue(mockInstance);

      const first = await service.getMapService();
      const second = await service.getMapService();

      expect(injectorSpy.get).toHaveBeenCalledTimes(1);
      expect(first).toBe(second);
    });

    it("geeft undefined/null terug als injector niets levert", async () => {
      const module = mockModule();

      spyOn<any>(service, "loadMapModule").and.resolveTo(module);
      injectorSpy.get.and.returnValue(null);

      const result = await service.getMapService();

      expect(result).toBeNull();
    });

    it("vangt fouten bij laden van module", async () => {
      spyOn<any>(service, "loadMapModule").and.rejectWith("load error");

      const result = await service.getMapService();

      expect(result).toBeUndefined();
    });
  });

  describe("getDrawService", () => {
    it("laadt en retourneert de DrawService via de injector", async () => {
      const module = mockModule();
      const mockInstance = { name: "DrawService" };

      spyOn<any>(service, "loadMapModule").and.resolveTo(module);
      injectorSpy.get.and.returnValue(mockInstance);

      const result = await service.getDrawService();

      expect(injectorSpy.get).toHaveBeenCalledWith(module.GgcDrawService);
      expect(result).toBe(mockInstance);
    });

    it("cachet de DrawService", async () => {
      const module = mockModule();
      const mockInstance = { name: "DrawService" };

      spyOn<any>(service, "loadMapModule").and.resolveTo(module);
      injectorSpy.get.and.returnValue(mockInstance);

      await service.getDrawService();
      await service.getDrawService();

      expect(injectorSpy.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getMapComponentDrawTypes", () => {
    it("laadt en retourneert MapComponentDrawTypes", async () => {
      const module = mockModule({
        MapComponentDrawTypes: { point: "point" }
      });

      spyOn<any>(service, "loadMapModule").and.resolveTo(module);

      const result = await service.getMapComponentDrawTypes();

      expect(result).toEqual({ point: "point" });
    });

    it("cachet MapComponentDrawTypes", async () => {
      const module = mockModule();

      spyOn<any>(service, "loadMapModule").and.resolveTo(module);

      const first = await service.getMapComponentDrawTypes();
      const second = await service.getMapComponentDrawTypes();

      expect(first).toBe(second);
    });

    it("vangt fouten af bij laden", async () => {
      spyOn<any>(service, "loadMapModule").and.rejectWith("load error");

      const result = await service.getMapComponentDrawTypes();

      expect(result).toBeUndefined();
    });
  });
});
