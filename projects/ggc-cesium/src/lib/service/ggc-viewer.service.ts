import { inject, Injectable } from "@angular/core";
import { CoreViewerService } from "./core-viewer.service";
import {
  getCameraValues,
  MAX_VIEWDISTANCE,
  MIN_VIEWDISTANCE
} from "../utils/camera-utils";
import { CameraValues } from "../model/interfaces";
import { Cartesian3, Rectangle } from "@cesium/engine";

@Injectable({
  providedIn: "root"
})
export class GgcViewerService {
  private coreViewerService = inject(CoreViewerService);

  getCurrentCameraValues(): CameraValues | undefined {
    const viewer = this.coreViewerService.getViewer();
    if (viewer) {
      return getCameraValues(viewer.camera, viewer);
    }
    return undefined;
  }

  getCenter(extent: Rectangle): Cartesian3 {
    return Cartesian3.fromDegrees(
      (extent.west + extent.east) / 2,
      (extent.north + extent.south) / 2
    );
  }

  calculateDistance(extent: Rectangle): number {
    const left = Cartesian3.fromDegrees(
      extent.west,
      (extent.north + extent.south) / 2
    );
    const right = Cartesian3.fromDegrees(
      extent.east,
      (extent.north + extent.south) / 2
    );
    const up = Cartesian3.fromDegrees(
      (extent.west + extent.east) / 2,
      extent.north
    );
    const down = Cartesian3.fromDegrees(
      (extent.west + extent.east) / 2,
      extent.south
    );
    const width = Cartesian3.distance(left, right);
    const height = Cartesian3.distance(up, down);
    return Math.min(
      MAX_VIEWDISTANCE,
      Math.max(width, height, MIN_VIEWDISTANCE)
    );
  }

  getExtent(geojson: string): Rectangle {
    let extent = new Rectangle(90, 90, -90, -90);
    const json = JSON.parse(geojson);
    const result = this.getExtentRecursive(json.coordinates);
    extent = this.getNewExtent(result, extent);
    return extent;
  }

  private getExtentRecursive(input: any[]): Rectangle {
    let extent = new Rectangle(90, 90, -90, -90);
    if (Array.isArray(input[0])) {
      input.forEach((i) => {
        const result = this.getExtentRecursive(i);
        extent = this.getNewExtent(result, extent);
      });
    } else {
      const extent1 = new Rectangle(input[0], input[1], input[0], input[1]);
      extent = this.getNewExtent(extent1, extent);
    }
    return extent;
  }

  private getNewExtent(extent1: Rectangle, extent2: Rectangle): Rectangle {
    return new Rectangle(
      extent1.west < extent2.west ? extent1.west : extent2.west,
      extent1.south < extent2.south ? extent1.south : extent2.south,
      extent1.east > extent2.east ? extent1.east : extent2.east,
      extent1.north > extent2.north ? extent1.north : extent2.north
    );
  }
}
