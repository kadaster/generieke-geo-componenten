import { TestBed } from "@angular/core/testing";

import { GgcLocationService } from "./ggc-location.service";
import { CoreViewerService } from "./core-viewer.service";
import { Viewer } from "@cesium/widgets";
import { createCesiumMock } from "../viewer/viewer-mock.spec";
import { Entity } from "@cesium/engine";
import { cameraUtils } from "../utils/camera-utils";

describe("LocationService", () => {
  let service: GgcLocationService;
  let coreViewerServiceSpy: jasmine.SpyObj<CoreViewerService>;
  let locationServiceSpy: jasmine.Spy;
  let cesiumMock: Partial<Viewer>;

  beforeEach(() => {
    coreViewerServiceSpy = jasmine.createSpyObj("CoreViewerService", [
      "getViewer"
    ]);
    spyOn(cameraUtils, "flyToLookAtPosition");

    cesiumMock = createCesiumMock();
    coreViewerServiceSpy.getViewer.and.returnValue(cesiumMock as Viewer);
    TestBed.configureTestingModule({
      providers: [
        GgcLocationService,
        { provide: CoreViewerService, useValue: coreViewerServiceSpy }
      ]
    });

    service = TestBed.inject(GgcLocationService);
    spyOn(navigator.geolocation, "getCurrentPosition").and.callFake(
      (...args: any[]) => {
        const position = { coords: { latitude: 0, longitude: 0 } };
        args[0](position);
      }
    );
    locationServiceSpy = spyOn<any>(service, "getLocation").and.callThrough();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should zoom to current location", (done) => {
    service.zoomToCurrentLocation();
    expect(locationServiceSpy).toHaveBeenCalled();
    setTimeout(() => {
      expect(cameraUtils.flyToLookAtPosition).toHaveBeenCalled();
      done();
    });
  });

  it("should zoom to current location and mark", (done) => {
    service.zoomToCurrentLocationAndMark();
    expect(locationServiceSpy).toHaveBeenCalled();
    setTimeout(() => {
      expect(cameraUtils.flyToLookAtPosition).toHaveBeenCalled();
      expect(cesiumMock.entities?.add).toHaveBeenCalled();
      expect(cesiumMock.entities?.remove).not.toHaveBeenCalled();
      done();
    });
  });

  it("should zoom to current location and renew mark", (done) => {
    service["marked"] = new Entity();
    service.zoomToCurrentLocationAndMark();
    expect(locationServiceSpy).toHaveBeenCalled();
    setTimeout(() => {
      expect(cameraUtils.flyToLookAtPosition).toHaveBeenCalled();
      expect(cesiumMock.entities?.add).toHaveBeenCalled();
      expect(cesiumMock.entities?.remove).toHaveBeenCalled();
      done();
    });
  });

  it("should remove mark", (done) => {
    service["marked"] = new Entity();
    service.removeLocationMark();
    expect(locationServiceSpy).not.toHaveBeenCalled();
    setTimeout(() => {
      expect(cesiumMock.camera?.flyTo).not.toHaveBeenCalled();
      expect(cesiumMock.entities?.add).not.toHaveBeenCalled();
      expect(cesiumMock.entities?.remove).toHaveBeenCalled();
      done();
    });
  });
});
