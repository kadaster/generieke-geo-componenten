import { DatasetTreeMapConnectService } from "./dataset-tree-map-connect.service";
import { TestBed } from "@angular/core/testing";
import { EMPTY, of } from "rxjs";
import { GgcDatasetTreeConnectService } from "./connect.service";
import { DEFAULT_CESIUM_MAPINDEX, ViewerType } from "@kadaster/ggc-models";

describe("DatasetTreeMapConnectService", () => {
  let service: DatasetTreeMapConnectService;

  let mockCesiumLayerService: any;
  let mockMapLayerService: any;
  let mockMapEventsService: any;

  let mockConnectService: any;

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

    mockConnectService = {
      loadGgcCesiumSharedLayerService: jasmine
        .createSpy()
        .and.returnValue(Promise.resolve()),
      getGgcCesiumSharedLayerService: jasmine
        .createSpy()
        .and.returnValue(mockCesiumLayerService),

      loadGgcOLLayerService: jasmine
        .createSpy()
        .and.returnValue(Promise.resolve()),
      getGgcOLLayerService: jasmine
        .createSpy()
        .and.returnValue(mockMapLayerService),

      loadGgcOLMapEventsService: jasmine
        .createSpy()
        .and.returnValue(Promise.resolve()),
      getGgcOLMapEventsService: jasmine
        .createSpy()
        .and.returnValue(mockMapEventsService)
    };

    await TestBed.configureTestingModule({
      providers: [
        DatasetTreeMapConnectService,
        { provide: GgcDatasetTreeConnectService, useValue: mockConnectService }
      ]
    }).compileComponents();

    service = TestBed.inject(DatasetTreeMapConnectService);
  });

  it("should create", () => {
    expect(service).toBeTruthy();
  });

  it("should get the layerChangedObservable in 2D", async () => {
    const obs = await service.getLayerChangedObservable(ViewerType.TWEE_D);
    obs.subscribe((val) => {
      expect(val.layerId).toBe("id-2d");
      expect(val.mapIndex).toBe("map");
    });
  });

  it("should get the layerChangedObservable in 3D", async () => {
    const obs = await service.getLayerChangedObservable(ViewerType.DRIE_D);
    obs.subscribe((val) => {
      expect(val.layerId).toBe("id-3d");
      expect(val.mapIndex).toBe(DEFAULT_CESIUM_MAPINDEX);
    });
  });

  it("should get the zoomendObservable in 2D", async () => {
    const obs = await service.getZoomendObservableForMap(
      "mapIndex",
      ViewerType.TWEE_D
    );
    obs.subscribe((val) => {
      expect(val).toBe("zoom");
    });
  });

  it("should not get the zoomendObservable in 3D", async () => {
    const obs = await service.getZoomendObservableForMap(
      "mapIndex",
      ViewerType.DRIE_D
    );
    expect(obs).toBe(EMPTY);
  });

  it("should get the title in 2D", async () => {
    expect(await service.getTitle("id", "index", ViewerType.TWEE_D)).toBe(
      "title-2d"
    );
  });

  it("should get the title in 3D", async () => {
    expect(await service.getTitle("id", "index", ViewerType.DRIE_D)).toBe(
      "title-3d"
    );
  });

  it("should get the visibility in 2D", async () => {
    expect(await service.isVisible("id", "index", ViewerType.TWEE_D)).toBe(
      false
    );
  });

  it("should get the visibility in 3D", async () => {
    expect(await service.isVisible("id", "index", ViewerType.DRIE_D)).toBe(
      true
    );
  });

  it("should toggle the visibility in 2D", async () => {
    expect(await service.isVisible("id", "index", ViewerType.TWEE_D)).toBe(
      false
    );
  });

  it("should toggle the visibility in 3D", async () => {
    expect(await service.isVisible("id", "index", ViewerType.DRIE_D)).toBe(
      true
    );
  });

  it("should get enabled in 2D", async () => {
    expect(await service.isVisible("id", "index", ViewerType.TWEE_D)).toBe(
      false
    );
  });

  it("should get enabled in 3D", async () => {
    expect(await service.isVisible("id", "index", ViewerType.DRIE_D)).toBe(
      true
    );
  });
});
