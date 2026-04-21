import { TestBed } from "@angular/core/testing";
import { Injector } from "@angular/core";
import { GgcToolbarConnectService } from "./connect.service";

describe("GgcSearchLocationConnectService", () => {
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

  it("Moet correct geïnitialiseerd worden", () => {
    expect(service).toBeTruthy();
  });

  describe("loadMapService", () => {
    it("Moet de GgcMapService ophalen uit de injector na het laden van de module", async () => {
      const mockMapService = { name: "MockMapService" };
      injectorSpy.get.and.returnValue(mockMapService);

      await service.loadMapService();

      expect(injectorSpy.get).toHaveBeenCalled();
      expect(service.getMapService()).toBe(mockMapService);
    });

    it("Moet de service maar één keer laden", async () => {
      const mockMapService = { name: "MockMapService" };
      injectorSpy.get.and.returnValue(mockMapService);

      await service.loadMapService();
      await service.loadMapService();

      expect(injectorSpy.get).toHaveBeenCalledTimes(1);
    });

    it("Moet undefined retourneren als de injector de service niet kan vinden", async () => {
      injectorSpy.get.and.returnValue(null);

      await service.loadMapService();

      expect(service.getMapService()).toBeNull();
    });

    it("Moet fouten opvangen als de module niet geladen kan worden", async () => {
      injectorSpy.get.and.throwError("Module not found");

      await expectAsync(service.loadMapService()).toBeResolved();
      expect(service.getMapService()).toBeUndefined();
    });
  });

  describe("getMapService", () => {
    it("Moet undefined teruggeven als de service nog niet geladen is", () => {
      expect(service.getMapService()).toBeUndefined();
    });
  });

  describe("loadDrawService", () => {
    it("Moet de GgcDrawService ophalen uit de injector na het laden van de module", async () => {
      const mockDrawService = { name: "MockDrawService" };
      injectorSpy.get.and.returnValue(mockDrawService);

      await service.loadDrawService();

      expect(injectorSpy.get).toHaveBeenCalled();
      expect(service.getDrawService()).toBe(mockDrawService);
    });

    it("Moet de service maar één keer laden", async () => {
      const mockDrawService = { name: "MockDrawService" };
      injectorSpy.get.and.returnValue(mockDrawService);

      await service.loadDrawService();
      await service.loadDrawService();

      expect(injectorSpy.get).toHaveBeenCalledTimes(1);
    });

    it("Moet undefined retourneren als de injector de service niet kan vinden", async () => {
      injectorSpy.get.and.returnValue(null);

      await service.loadDrawService();

      expect(service.getDrawService()).toBeNull();
    });

    it("Moet fouten opvangen als de module niet geladen kan worden", async () => {
      injectorSpy.get.and.throwError("Module not found");

      await expectAsync(service.loadDrawService()).toBeResolved();
      expect(service.getDrawService()).toBeUndefined();
    });
  });

  describe("getDrawService", () => {
    it("Moet undefined teruggeven als de service nog niet geladen is", () => {
      expect(service.getDrawService()).toBeUndefined();
    });
  });
});
