import type { MockedObject } from "vitest";
import { DatasetTreeMapConnectService } from "./dataset-tree-map-connect.service";
import { TestBed } from "@angular/core/testing";
import { of, EMPTY } from "rxjs";
import { GgcDatasetTreeConnectService } from "./connect.service";
import { DEFAULT_CESIUM_MAPINDEX, ViewerType } from "@kadaster/ggc-models";

describe("DatasetTreeMapConnectService", () => {
  let service: DatasetTreeMapConnectService;

  let mockCesiumLayerService: any;
  let mockMapLayerService: any;
  let mockMapEventsService: any;

  let mockConnectService: MockedObject<GgcDatasetTreeConnectService>;

  beforeEach(async () => {
    mockCesiumLayerService = {
      getLayerChangedObservable: vi
        .fn()
        .mockReturnValue(of({ layerId: "id-3d" })),
      getTitle: vi.fn().mockReturnValue("title-3d"),
      isVisible: vi.fn().mockReturnValue(true),
      toggleVisibility: vi.fn().mockReturnValue(false),
      getEnabled: vi.fn().mockReturnValue(true)
    };

    mockMapLayerService = {
      getLayerChangedObservable: vi
        .fn()
        .mockReturnValue(of({ layerId: "id-2d", mapIndex: "map" })),
      getTitle: vi.fn().mockReturnValue("title-2d"),
      isVisible: vi.fn().mockReturnValue(false),
      toggleVisibility: vi.fn().mockReturnValue(false),
      getEnabled: vi.fn().mockReturnValue(false)
    };

    mockMapEventsService = {
      getZoomendObservableForMap: vi.fn().mockReturnValue(of("zoom"))
    };

    mockConnectService = {
      getGgcCesiumSharedLayerService: vi
        .fn()
        .mockName(
          "GgcDatasetTreeConnectService.getGgcCesiumSharedLayerService"
        ),
      getGgcOLLayerService: vi
        .fn()
        .mockName("GgcDatasetTreeConnectService.getGgcOLLayerService"),
      getGgcOLMapEventsService: vi
        .fn()
        .mockName("GgcDatasetTreeConnectService.getGgcOLMapEventsService")
    } as MockedObject<GgcDatasetTreeConnectService>;

    await TestBed.configureTestingModule({
      providers: [
        DatasetTreeMapConnectService,
        {
          provide: GgcDatasetTreeConnectService,
          useValue: mockConnectService
        }
      ]
    }).compileComponents();
    mockConnectService.getGgcCesiumSharedLayerService.mockResolvedValue(
      mockCesiumLayerService
    );
    mockConnectService.getGgcOLLayerService.mockResolvedValue(
      mockMapLayerService
    );
    mockConnectService.getGgcOLMapEventsService.mockResolvedValue(
      mockMapEventsService
    );

    service = TestBed.inject(DatasetTreeMapConnectService);
  });

  it("should create", () => {
    expect(service).toBeTruthy();
  });

  describe("layerChangedObservable", () => {
    it("should return 2D layer stream", async () => {
      const obs = await service.getLayerChangedObservable(ViewerType.TWEE_D);

      obs.subscribe((val) => {
        expect(val.layerId).toBe("id-2d");
        expect(val.mapIndex).toBe("map");
      });

      expect(mockConnectService.getGgcOLLayerService).toHaveBeenCalled();
    });

    it("should return 3D layer stream", async () => {
      const obs = await service.getLayerChangedObservable(ViewerType.DRIE_D);

      obs.subscribe((val) => {
        expect(val.layerId).toBe("id-3d");
        expect(val.mapIndex).toBe(DEFAULT_CESIUM_MAPINDEX);
      });

      expect(
        mockConnectService.getGgcCesiumSharedLayerService
      ).toHaveBeenCalled();
    });
  });

  describe("zoomendObservable", () => {
    it("should return observable in 2D", async () => {
      const obs = await service.getZoomendObservableForMap(
        "mapIndex",
        ViewerType.TWEE_D
      );

      obs.subscribe((val) => {
        expect(val).toBe("zoom");
      });

      expect(mockConnectService.getGgcOLMapEventsService).toHaveBeenCalled();
    });

    it("should return EMPTY in 3D", async () => {
      const obs = await service.getZoomendObservableForMap(
        "mapIndex",
        ViewerType.DRIE_D
      );

      expect(obs).toBe(EMPTY);
    });
  });

  describe("metadata methods", () => {
    it("should get title (2D)", async () => {
      const result = await service.getTitle("id", "index", ViewerType.TWEE_D);

      expect(result).toBe("title-2d");
    });

    it("should get title (3D)", async () => {
      const result = await service.getTitle("id", "index", ViewerType.DRIE_D);

      expect(result).toBe("title-3d");
    });

    it("should get visibility (2D)", async () => {
      const result = await service.isVisible("id", "index", ViewerType.TWEE_D);

      expect(result).toBe(false);
    });

    it("should get visibility (3D)", async () => {
      const result = await service.isVisible("id", "index", ViewerType.DRIE_D);

      expect(result).toBe(true);
    });

    it("should get enabled state (2D)", async () => {
      const result = await service.getEnabled("id", "index", ViewerType.TWEE_D);

      expect(result).toBe(false);
    });

    it("should get enabled state (3D)", async () => {
      const result = await service.getEnabled("id", "index", ViewerType.DRIE_D);

      expect(result).toBe(true);
    });
  });
});
