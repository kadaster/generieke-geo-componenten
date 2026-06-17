import type { MockedObject } from "vitest";
import { TestBed } from "@angular/core/testing";

import { GgcLocationService } from "./ggc-location.service";
import { CoreViewerService } from "./core-viewer.service";
import { Viewer } from "@cesium/widgets";
import { createCesiumMock } from "../viewer/viewer-mock";
import { cameraUtils } from "../utils/camera-utils";
import { vi } from "vitest";
import { Entity } from "@cesium/engine";
describe("GgcLocationService", () => {
  let service: GgcLocationService;
  let coreViewerServiceMock: MockedObject<CoreViewerService>;
  let locationServiceMock: any;
  let cesiumMock: Partial<Viewer>;

  beforeEach(() => {
    // Add navigator to jsdom
    Object.defineProperty(globalThis.navigator, "geolocation", {
      value: {
        getCurrentPosition: vi.fn()
      },
      configurable: true
    });

    coreViewerServiceMock = {
      getViewer: vi.fn().mockName("CoreViewerService.getViewer")
    } as MockedObject<CoreViewerService>;
    cesiumMock = createCesiumMock();

    vi.spyOn(cameraUtils, "flyToLookAtPosition");

    coreViewerServiceMock.getViewer.mockReturnValue(cesiumMock as Viewer);
    TestBed.configureTestingModule({
      providers: [
        GgcLocationService,
        { provide: CoreViewerService, useValue: coreViewerServiceMock }
      ]
    });

    service = TestBed.inject(GgcLocationService);
    vi.spyOn(navigator.geolocation, "getCurrentPosition").mockImplementation(
      (...args: any[]) => {
        const position = { coords: { latitude: 0, longitude: 0 } };
        args[0](position);
      }
    );
    locationServiceMock = vi.spyOn(service as any, "getLocation");
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should zoom to current location", async () => {
    service.zoomToCurrentLocation();
    expect(locationServiceMock).toHaveBeenCalled();

    await Promise.resolve();

    expect(cameraUtils.flyToLookAtPosition).toHaveBeenCalled();
  });

  it("should zoom to current location and mark", async () => {
    service.zoomToCurrentLocationAndMark();
    expect(locationServiceMock).toHaveBeenCalled();

    await Promise.resolve();

    expect(cameraUtils.flyToLookAtPosition).toHaveBeenCalled();
    expect(cesiumMock.entities?.add).toHaveBeenCalled();
    expect(cesiumMock.entities?.remove).not.toHaveBeenCalled();
  });

  it("should zoom to current location and renew mark", async () => {
    service["marked"] = new Entity();
    service.zoomToCurrentLocationAndMark();
    expect(locationServiceMock).toHaveBeenCalled();

    await Promise.resolve();

    expect(cameraUtils.flyToLookAtPosition).toHaveBeenCalled();
    expect(cesiumMock.entities?.add).toHaveBeenCalled();
    expect(cesiumMock.entities?.remove).toHaveBeenCalled();
  });

  it("should remove mark", async () => {
    service["marked"] = new Entity();
    service.removeLocationMark();

    await Promise.resolve();

    expect(locationServiceMock).not.toHaveBeenCalled();

    expect(cesiumMock.camera?.flyTo).not.toHaveBeenCalled();
    expect(cesiumMock.entities?.add).not.toHaveBeenCalled();
    expect(cesiumMock.entities?.remove).toHaveBeenCalled();
  });
});
