import type { MockedObject } from "vitest";
import { TestBed } from "@angular/core/testing";

import { GgcViewerService } from "./ggc-viewer.service";
import { CoreViewerService } from "./core-viewer.service";
import { Viewer } from "@cesium/widgets";
import { Cartesian3, Rectangle } from "@cesium/engine";
import { MAX_VIEWDISTANCE, MIN_VIEWDISTANCE } from "../utils/camera-utils";
import { createCesiumMock } from "../viewer/viewer-mock";
import { firstValueFrom } from "rxjs";
import { CameraValues } from "../model/interfaces";
import { CoreCameraService } from "./core-camera.service";

describe("GgcViewerService", () => {
  let service: GgcViewerService;
  let coreViewerService: MockedObject<CoreViewerService>;
  let coreCameraService: CoreCameraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GgcViewerService);
    coreViewerService = TestBed.inject(
      CoreViewerService
    ) as MockedObject<CoreViewerService>;
    coreCameraService = TestBed.inject(CoreCameraService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("shouldn't receive current CameraValues", () => {
    expect(service.getCurrentCameraValues()).toBeUndefined();
  });

  it("should receive current CameraValues", () => {
    coreViewerService.setViewer(
      createCesiumMock({ cameraPitch: -Math.PI / 8 }) as Viewer
    );
    expect(service.getCurrentCameraValues()).toBeDefined();
  });

  describe("getCenter", () => {
    it("should give the center of the given extent", () => {
      const extent = new Rectangle(4.0, 50.0, 6.0, 52.0);
      const center = service["getCenter"](extent);
      expect(center).toEqual(Cartesian3.fromDegrees(5.0, 51.0, 0));
    });
  });

  describe("calculateDistance", () => {
    it("should return height when height > width", () => {
      const extent = new Rectangle(4.0, 50.0, 4.0001, 50.005);
      const distance = service["calculateDistance"](extent);
      expect(Math.floor(distance)).toBe(556);
    });
    it("should return width when width > height", () => {
      const extent = new Rectangle(4.0, 50.0, 4.01, 50.001);
      const distance = service["calculateDistance"](extent);
      expect(Math.floor(distance)).toBe(716);
    });
    it("should return minViewdistance when distance < minViewdistance", () => {
      const extent = new Rectangle(4.0, 50.0, 4.001, 50.001);
      const distance = service["calculateDistance"](extent);
      expect(Math.floor(distance)).toBe(MIN_VIEWDISTANCE);
    });
    it("should return maxViewdistance when distance < maxViewdistance", () => {
      const extent = new Rectangle(4.0, 50.0, 4.001, 51.0);
      const distance = service["calculateDistance"](extent);
      expect(Math.floor(distance)).toBe(MAX_VIEWDISTANCE);
    });
  });

  describe("viewer access", () => {
    it("should expose camera value updates", async () => {
      const cameraValues: CameraValues = {
        cameraPosition: { lat: 52, lon: 5 },
        orientation: { heading: 90 }
      };
      const cameraValuesPromise = firstValueFrom(
        service.getCameraValuesObservable()
      );

      coreCameraService.setCameraValues(cameraValues);

      await expect(cameraValuesPromise).resolves.toEqual(cameraValues);
    });
    it("should return undefined when no viewer is available", () => {
      expect(service.getCanvasCornerCoordinates()).toBeUndefined();
    });
    it("should get canvas corner coordinates from the current viewer", () => {
      const viewer = createViewerWithCanvas();
      coreViewerService.setViewer(viewer);

      const corners = service.getCanvasCornerCoordinates();

      expect(corners).toHaveLength(4);
      expect(corners?.[0].longitude).toBeCloseTo(5);
      expect(corners?.[0].latitude).toBeCloseTo(52);
    });
    it("should get canvas corner coordinates from the provided viewer", () => {
      const viewer = createViewerWithCanvas();

      const corners = service.getCanvasCornerCoordinates(viewer);

      expect(corners).toHaveLength(4);
    });
    it("should fallback to ellipsoid pick when globe pick returns undefined", () => {
      const viewer = createViewerWithCanvas({
        globePickResult: undefined,
        ellipsoidPickResult: Cartesian3.fromDegrees(5, 52)
      });

      const corners = service.getCanvasCornerCoordinates(viewer);

      expect(corners).toHaveLength(4);
      expect(corners?.[0].longitude).toBeCloseTo(5);
      expect(corners?.[0].latitude).toBeCloseTo(52);
    });
    it("should return undefined when globe and ellipsoid pick return undefined", () => {
      const viewer = createViewerWithCanvas({
        globePickResult: undefined,
        ellipsoidPickResult: undefined
      });

      const corners = service.getCanvasCornerCoordinates(viewer);

      expect(corners).toBeUndefined();
    });
  });

  describe("getExtent", () => {
    it("should get the extent of a simple polygon", () => {
      const geojson = getJson();
      const extent = service["getExtent"](geojson);
      expect(extent).toEqual(new Rectangle(10, 10, 20, 20));
    });
  });
});

function getJson(): string {
  return `{
    "type": "Polygon",
    "coordinates": [
      [[10,10],[10,20],[20,20],[20,10],[10,10]]
    ]
  }`;
}

function createViewerWithCanvas(options?: {
  globePickResult?: Cartesian3 | undefined;
  ellipsoidPickResult?: Cartesian3 | undefined;
}): Viewer {
  const defaultPickResult = Cartesian3.fromDegrees(5, 52);
  const globePickResult =
    options && "globePickResult" in options
      ? options.globePickResult
      : defaultPickResult;
  const ellipsoidPickResult =
    options && "ellipsoidPickResult" in options
      ? options.ellipsoidPickResult
      : defaultPickResult;
  return {
    scene: {
      camera: {
        getPickRay: vi.fn().mockReturnValue({}),
        pickEllipsoid: vi.fn().mockReturnValue(ellipsoidPickResult)
      },
      canvas: {
        clientWidth: 200,
        clientHeight: 100
      },
      globe: {
        pick: vi.fn().mockReturnValue(globePickResult)
      }
    }
  } as unknown as Viewer;
}
