import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { GgcLegendMapConnectService } from "./legend-map-connect.service";
import { GgcLegendConnectService } from "./connect.service";

describe("GgcLegendMapConnectService", () => {
  let service: GgcLegendMapConnectService;

  let cesiumLayerService: any;
  let mapLayerService: any;
  let mapEventsService: any;

  let legendConnectSpy: jasmine.SpyObj<GgcLegendConnectService>;

  beforeEach(async () => {
    cesiumLayerService = {
      getLegendAddedObservable: jasmine
        .createSpy()
        .and.returnValue(of("add-3d")),
      getLegendRemovedObservable: jasmine
        .createSpy()
        .and.returnValue(of("remove-3d")),
      getEnabled: jasmine.createSpy().and.returnValue(true),
      getCurrentActiveLegends: jasmine
        .createSpy()
        .and.returnValue([{ legendUrl: "cesium-legend" }])
    };

    mapLayerService = {
      getLegendAddedObservable: jasmine
        .createSpy()
        .and.returnValue(of("add-2d")),
      getLegendRemovedObservable: jasmine
        .createSpy()
        .and.returnValue(of("remove-2d")),
      getEnabled: jasmine.createSpy().and.returnValue(false),
      getCurrentActiveLegends: jasmine
        .createSpy()
        .and.returnValue([{ legendUrl: "map-legend" }])
    };

    mapEventsService = {
      getZoomendObservableForMap: jasmine
        .createSpy()
        .and.returnValue(of("zoom-2d"))
    };

    legendConnectSpy = jasmine.createSpyObj("GgcLegendConnectService", [
      "getGgcCesiumSharedLayerService",
      "getGgcOLLayerService",
      "getGgcOLMapEventsService"
    ]);

    legendConnectSpy.getGgcCesiumSharedLayerService.and.resolveTo(
      cesiumLayerService
    );
    legendConnectSpy.getGgcOLLayerService.and.resolveTo(mapLayerService);
    legendConnectSpy.getGgcOLMapEventsService.and.resolveTo(mapEventsService);

    await TestBed.configureTestingModule({
      providers: [
        GgcLegendMapConnectService,
        {
          provide: GgcLegendConnectService,
          useValue: legendConnectSpy
        }
      ]
    }).compileComponents();

    service = TestBed.inject(GgcLegendMapConnectService);
  });

  it("should create", () => {
    expect(service).toBeTruthy();
  });

  describe("legend added stream", () => {
    it("should merge 2D and 3D legend added observables", async () => {
      const obs = await service.getLegendAddedObservable();

      const result: any[] = [];
      obs.subscribe((v) => result.push(v));

      expect(result).toEqual(jasmine.arrayContaining(["add-2d", "add-3d"]));
    });
  });

  describe("legend removed stream", () => {
    it("should merge 2D and 3D legend removed observables", async () => {
      const obs = await service.getLegendRemovedObservable();

      const result: any[] = [];
      obs.subscribe((v) => result.push(v));

      expect(result).toEqual(
        jasmine.arrayContaining(["remove-2d", "remove-3d"])
      );
    });
  });

  describe("zoom observable", () => {
    it("should return zoom observable for 2D maps", async () => {
      const obs = await service.getZoomendObservableForMap("mapIndex");

      obs.subscribe((val) => {
        expect(val).toBe("zoom-2d");
      });
    });
  });

  describe("active legends", () => {
    it("should combine legends from 2D and 3D", async () => {
      const legends = await service.getCurrentActiveLegends("mapIndex");

      expect(legends).toEqual(
        jasmine.arrayContaining([
          jasmine.objectContaining({ legendUrl: "map-legend" }),
          jasmine.objectContaining({ legendUrl: "cesium-legend" })
        ])
      );
    });
  });

  describe("enabled state", () => {
    it("should return combined enabled state", async () => {
      const enabled = await service.getEnabled("layerId", "mapIndex");

      expect(enabled).toBeFalse();
    });
  });
});
