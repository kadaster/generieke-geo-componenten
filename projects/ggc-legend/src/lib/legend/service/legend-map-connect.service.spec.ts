import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { GgcLegendMapConnectService } from "./legend-map-connect.service";
import { GgcLegendConnectService } from "./connect.service";

describe("GgcLegendMapConnectService", () => {
  let service: GgcLegendMapConnectService;

  let mockCesiumLayerService: any;
  let mockMapLayerService: any;
  let mockMapEventsService: any;

  let mockConnectService: any;

  beforeEach(async () => {
    mockCesiumLayerService = {
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

    mockMapLayerService = {
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

    mockMapEventsService = {
      getZoomendObservableForMap: jasmine
        .createSpy()
        .and.returnValue(of("zoom-2d"))
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
        GgcLegendMapConnectService,
        { provide: GgcLegendConnectService, useValue: mockConnectService }
      ]
    }).compileComponents();

    service = TestBed.inject(GgcLegendMapConnectService);
  });

  it("should create", () => {
    expect(service).toBeTruthy();
  });

  it("should merge LegendAdded observables from 2D and 3D", async () => {
    const obs = await service.getLegendAddedObservable();

    const received: any[] = [];
    obs.subscribe((val) => received.push(val));

    expect(received).toContain("add-2d");
    expect(received).toContain("add-3d");
  });

  it("should merge LegendRemoved observables from 2D and 3D", async () => {
    const obs = await service.getLegendRemovedObservable();

    const received: any[] = [];
    obs.subscribe((val) => received.push(val));

    expect(received).toContain("remove-2d");
    expect(received).toContain("remove-3d");
  });

  it("should get zoomend observable for 2D maps", async () => {
    const obs = await service.getZoomendObservableForMap("mapIndex");

    obs.subscribe((val) => {
      expect(val).toBe("zoom-2d");
    });
  });

  it("should concatenate active legends from 2D and 3D", async () => {
    const legends = await service.getCurrentActiveLegends("mapIndex");

    expect(legends.length).toBe(2);
    expect(legends).toContain(
      jasmine.objectContaining({ legendUrl: "map-legend" })
    );
    expect(legends).toContain(
      jasmine.objectContaining({ legendUrl: "cesium-legend" })
    );
  });

  it("should return enabled values", async () => {
    const enabled = await service.getEnabled("layerId", "mapIndex");
    expect(enabled).toBeFalse();
  });
});
