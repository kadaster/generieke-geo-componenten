import type { Mock, MockedObject } from "vitest";
import { TestBed } from "@angular/core/testing";

import { GgcLocationService } from "./ggc-location.service";
import { CoreViewerService } from "./core-viewer.service";
import { Viewer } from "@cesium/widgets";
import { createCesiumMock } from "../viewer/viewer-mock.spec";
import { Entity } from "@cesium/engine";
import { cameraUtils } from "../utils/camera-utils";
import { vi } from "vitest";
describe("GgcLocationService", () => {
  let service: GgcLocationService;
  let coreViewerServiceSpy: MockedObject<CoreViewerService>;
  let locationServiceSpy: Mock;
  let cesiumMock: Partial<Viewer>;

  beforeEach(() => {
    coreViewerServiceSpy = {
      getViewer: vi.fn().mockName("CoreViewerService.getViewer")
    };
    vi.spyOn(cameraUtils, "flyToLookAtPosition");

    cesiumMock = createCesiumMock();
    coreViewerServiceSpy.getViewer.mockReturnValue(cesiumMock as Viewer);
    TestBed.configureTestingModule({
      providers: [
        GgcLocationService,
        { provide: CoreViewerService, useValue: coreViewerServiceSpy }
      ]
    });

    service = TestBed.inject(GgcLocationService);
    vi.spyOn(navigator.geolocation, "getCurrentPosition").mockImplementation(
      (...args: any[]) => {
        const position = { coords: { latitude: 0, longitude: 0 } };
        args[0](position);
      }
    );
    locationServiceSpy = vi.spyOn<any>(service, "getLocation");
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should zoom to current location", async () => {
    service.zoomToCurrentLocation();
    expect(locationServiceSpy).toHaveBeenCalled();
    setTimeout(() => {
      expect(cameraUtils.flyToLookAtPosition).toHaveBeenCalled();
    });
  });

  it("should zoom to current location and mark", async () => {
    service.zoomToCurrentLocationAndMark();
    expect(locationServiceSpy).toHaveBeenCalled();
    setTimeout(() => {
      expect(cameraUtils.flyToLookAtPosition).toHaveBeenCalled();
      expect(cesiumMock.entities?.add).toHaveBeenCalled();
      expect(cesiumMock.entities?.remove).not.toHaveBeenCalled();
    });
  });

  it("should zoom to current location and renew mark", async () => {
    service["marked"] = new Entity();
    service.zoomToCurrentLocationAndMark();
    expect(locationServiceSpy).toHaveBeenCalled();
    setTimeout(() => {
      expect(cameraUtils.flyToLookAtPosition).toHaveBeenCalled();
      expect(cesiumMock.entities?.add).toHaveBeenCalled();
      expect(cesiumMock.entities?.remove).toHaveBeenCalled();
    });
  });

  it("should remove mark", async () => {
    service["marked"] = new Entity();
    service.removeLocationMark();
    expect(locationServiceSpy).not.toHaveBeenCalled();
    setTimeout(() => {
      expect(cesiumMock.camera?.flyTo).not.toHaveBeenCalled();
      expect(cesiumMock.entities?.add).not.toHaveBeenCalled();
      expect(cesiumMock.entities?.remove).toHaveBeenCalled();
    });
  });
});
