import { TestBed } from "@angular/core/testing";

import { GgcViewerService } from "./ggc-viewer.service";
import { CoreViewerService } from "./core-viewer.service";
import { Viewer } from "@cesium/widgets";
import { Cartesian3, Rectangle } from "@cesium/engine";
import { MAX_VIEWDISTANCE, MIN_VIEWDISTANCE } from "../utils/camera-utils";
import { createCesiumMock } from "../viewer/viewer-mock.spec";

describe("ViewerService", () => {
  let service: GgcViewerService;
  let coreViewerService: jasmine.SpyObj<CoreViewerService>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GgcViewerService);
    coreViewerService = TestBed.inject(
      CoreViewerService
    ) as jasmine.SpyObj<CoreViewerService>;
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
