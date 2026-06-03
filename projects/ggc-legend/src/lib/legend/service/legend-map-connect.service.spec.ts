import type { MockedObject } from "vitest";
import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { GgcLegendMapConnectService } from "./legend-map-connect.service";
import { GgcLegendConnectService } from "./connect.service";

describe("GgcLegendMapConnectService", () => {
  let service: GgcLegendMapConnectService;

  let cesiumLayerService: any;
  let mapLayerService: any;
  let mapEventsService: any;

  let legendConnectSpy: MockedObject<GgcLegendConnectService>;

  beforeEach(async () => {
    cesiumLayerService = {
      getLegendAddedObservable: vi.fn().mockReturnValue(of("add-3d")),
      getLegendRemovedObservable: vi.fn().mockReturnValue(of("remove-3d")),
      getEnabled: vi.fn().mockReturnValue(true),
      getCurrentActiveLegends: vi
        .fn()
        .mockReturnValue([{ legendUrl: "cesium-legend" }])
    };

    mapLayerService = {
      getLegendAddedObservable: vi.fn().mockReturnValue(of("add-2d")),
      getLegendRemovedObservable: vi.fn().mockReturnValue(of("remove-2d")),
      getEnabled: vi.fn().mockReturnValue(false),
      getCurrentActiveLegends: vi
        .fn()
        .mockReturnValue([{ legendUrl: "map-legend" }])
    };

    mapEventsService = {
      getZoomendObservableForMap: vi.fn().mockReturnValue(of("zoom-2d"))
    };

    legendConnectSpy = {
      getGgcCesiumSharedLayerService: vi
        .fn()
        .mockName("GgcLegendConnectService.getGgcCesiumSharedLayerService"),
      getGgcOLLayerService: vi
        .fn()
        .mockName("GgcLegendConnectService.getGgcOLLayerService"),
      getGgcOLMapEventsService: vi
        .fn()
        .mockName("GgcLegendConnectService.getGgcOLMapEventsService")
    };

    legendConnectSpy.getGgcCesiumSharedLayerService.mockResolvedValue(
      cesiumLayerService
    );
    legendConnectSpy.getGgcOLLayerService.mockResolvedValue(mapLayerService);
    legendConnectSpy.getGgcOLMapEventsService.mockResolvedValue(
      mapEventsService
    );

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

      expect(result).toEqual(expect.arrayContaining(["add-2d", "add-3d"]));
    });
  });

  describe("legend removed stream", () => {
    it("should merge 2D and 3D legend removed observables", async () => {
      const obs = await service.getLegendRemovedObservable();

      const result: any[] = [];
      obs.subscribe((v) => result.push(v));

      expect(result).toEqual(
        expect.arrayContaining(["remove-2d", "remove-3d"])
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
        expect.arrayContaining([
          expect.objectContaining({ legendUrl: "map-legend" }),
          expect.objectContaining({ legendUrl: "cesium-legend" })
        ])
      );
    });
  });

  describe("enabled state", () => {
    it("should return combined enabled state", async () => {
      const enabled = await service.getEnabled("layerId", "mapIndex");

      expect(enabled).toBe(false);
    });
  });
});
