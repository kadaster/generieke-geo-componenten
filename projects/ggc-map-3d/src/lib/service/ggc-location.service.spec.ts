import type { MockedObject } from "vitest";
import { TestBed } from "@angular/core/testing";

import { GgcLocationService } from "./ggc-location.service";
import { CoreViewerService } from "./core-viewer.service";
import { Viewer } from "@cesium/widgets";
import { createCesiumMock } from "../viewer/viewer-mock";
import { cameraUtils } from "../utils/camera-utils";
import { vi } from "vitest";
import {
  BoundingSphere,
  Entity,
  HeadingPitchRange,
  Matrix4,
  Rectangle
} from "@cesium/engine";

describe("GgcLocationService", () => {
  let service: GgcLocationService;
  let coreViewerServiceMock: MockedObject<CoreViewerService>;
  let cesiumMock: Partial<Viewer>;

  const mockCoordinates: GeolocationCoordinates = {
    latitude: 52.3676,
    longitude: 4.9041
  } as GeolocationCoordinates;

  beforeEach(() => {
    coreViewerServiceMock = {
      getViewer: vi.fn().mockName("CoreViewerService.getViewer")
    } as MockedObject<CoreViewerService>;
    cesiumMock = createCesiumMock({ cameraPitch: -Math.PI / 6 });

    vi.spyOn(cameraUtils, "flyToLookAtPosition").mockResolvedValue();

    coreViewerServiceMock.getViewer.mockReturnValue(cesiumMock as Viewer);
    TestBed.configureTestingModule({
      providers: [
        GgcLocationService,
        { provide: CoreViewerService, useValue: coreViewerServiceMock }
      ]
    });

    service = TestBed.inject(GgcLocationService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should zoom to current location keeping heading and pitch", async () => {
    await service.zoomToCurrentLocation(mockCoordinates);

    expect(cameraUtils.flyToLookAtPosition).toHaveBeenCalledWith(
      {
        lookAtPosition: {
          lon: mockCoordinates.longitude,
          lat: mockCoordinates.latitude
        },
        orientation: {
          heading: expect.closeTo(45),
          pitch: expect.closeTo(-30)
        },
        range: 500
      },
      cesiumMock
    );
  });

  it("should zoom to bbox keeping heading and pitch", () => {
    service.zoomToBBox([5.75, 51.8, 5.9, 51.88]);

    const [boundingSphere, offset] = vi.mocked(
      cesiumMock.camera!.viewBoundingSphere
    ).mock.calls[0];
    expect(boundingSphere).toEqual(
      BoundingSphere.fromRectangle3D(
        Rectangle.fromDegrees(5.75, 51.8, 5.9, 51.88)
      )
    );
    expect(offset).toEqual(new HeadingPitchRange(Math.PI / 4, -Math.PI / 6, 0));
    expect(cesiumMock.camera!.lookAtTransform).toHaveBeenCalledWith(
      Matrix4.IDENTITY
    );
  });

  it("should not zoom when viewer is not available", async () => {
    coreViewerServiceMock.getViewer.mockReturnValue(undefined);

    await service.zoomToCurrentLocation(mockCoordinates);

    expect(cameraUtils.flyToLookAtPosition).not.toHaveBeenCalled();
  });

  it("should add location mark", () => {
    service.addLocationMark(mockCoordinates);

    expect(cesiumMock.entities?.add).toHaveBeenCalled();
    expect(cesiumMock.entities?.remove).not.toHaveBeenCalled();
  });

  it("should renew location mark when one already exists", () => {
    service["marked"] = new Entity();
    service.addLocationMark(mockCoordinates);

    expect(cesiumMock.entities?.add).toHaveBeenCalled();
    expect(cesiumMock.entities?.remove).toHaveBeenCalled();
  });

  it("should remove mark", () => {
    service["marked"] = new Entity();
    service.removeLocationMark();

    expect(cesiumMock.entities?.add).not.toHaveBeenCalled();
    expect(cesiumMock.entities?.remove).toHaveBeenCalled();
    expect(service["marked"]).toBeUndefined();
  });

  it("should not remove mark when none exists", () => {
    service.removeLocationMark();

    expect(cesiumMock.entities?.remove).not.toHaveBeenCalled();
  });

  it("should update marker svg", () => {
    const newSvg = "data:image/svg+xml,<svg>custom</svg>";
    service.setMarkerSvg(newSvg);

    expect(service["markerSvg"]).toBe(newSvg);
  });
});
