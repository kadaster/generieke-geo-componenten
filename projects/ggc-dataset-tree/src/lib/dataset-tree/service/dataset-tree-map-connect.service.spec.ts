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

  let mockConnectService: jasmine.SpyObj<GgcDatasetTreeConnectService>;

  beforeEach(async () => {
    mockCesiumLayerService = {
      getLayerChangedObservable: jasmine
        .createSpy()
        .and.returnValue(of({ layerId: "id-3d" })),
      getTitle: jasmine.createSpy().and.returnValue("title-3d"),
      isVisible: jasmine.createSpy().and.returnValue(true),
      toggleVisibility: jasmine.createSpy().and.returnValue(false),
      getEnabled: jasmine.createSpy().and.returnValue(true)
    };

    mockMapLayerService = {
      getLayerChangedObservable: jasmine
        .createSpy()
        .and.returnValue(of({ layerId: "id-2d", mapIndex: "map" })),
      getTitle: jasmine.createSpy().and.returnValue("title-2d"),
      isVisible: jasmine.createSpy().and.returnValue(false),
      toggleVisibility: jasmine.createSpy().and.returnValue(false),
      getEnabled: jasmine.createSpy().and.returnValue(false)
    };

    mockMapEventsService = {
      getZoomendObservableForMap: jasmine
        .createSpy()
        .and.returnValue(of("zoom"))
    };

    mockConnectService = jasmine.createSpyObj("GgcDatasetTreeConnectService", [
      "getGgcCesiumSharedLayerService",
      "getGgcOLLayerService",
      "getGgcOLMapEventsService"
    ]);

    mockConnectService.getGgcCesiumSharedLayerService.and.resolveTo(
      mockCesiumLayerService
    );
    mockConnectService.getGgcOLLayerService.and.resolveTo(mockMapLayerService);
    mockConnectService.getGgcOLMapEventsService.and.resolveTo(
      mockMapEventsService
    );

    await TestBed.configureTestingModule({
      providers: [
        DatasetTreeMapConnectService,
        {
          provide: GgcDatasetTreeConnectService,
          useValue: mockConnectService
        }
      ]
    }).compileComponents();

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
