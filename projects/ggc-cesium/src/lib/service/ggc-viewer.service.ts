import { inject, Injectable } from "@angular/core";
import { CoreViewerService } from "./core-viewer.service";
import {
  getCameraValues,
  MAX_VIEWDISTANCE,
  MIN_VIEWDISTANCE
} from "../utils/camera-utils";
import { CameraValues } from "../model/interfaces";
import { Cartesian3, Rectangle } from "@cesium/engine";

/**
 * Service met helper-functionaliteit rondom de Cesium viewer.
 *
 * Deze service biedt:
 * - Toegang tot de huidige {@link CameraValues};
 * - Berekeningen voor extent, center en kijkafstand;
 * - Hulpfuncties voor het werken met GeoJSON extents.
 *
 * Wordt voornamelijk gebruikt door viewer-logica zoals camera positioning
 * en "zoom-to-fit" functionaliteit.
 */
@Injectable({
  providedIn: "root"
})
export class GgcViewerService {
  private readonly coreViewerService = inject(CoreViewerService);

  /**
   * Haalt de huidige camerawaarden op van de viewer.
   *
   * @returns De huidige {@link CameraValues} of `undefined` wanneer er nog geen viewer beschikbaar is
   */
  getCurrentCameraValues(): CameraValues | undefined {
    const viewer = this.coreViewerService.getViewer();
    if (viewer) {
      return getCameraValues(viewer.camera, viewer);
    }
    return undefined;
  }

  /**
   * Berekent het middelpunt van een gegeven extent.
   *
   * @param extent De {@link Rectangle} waarvoor het centrum berekend wordt
   * @returns Het centrum als {@link Cartesian3}
   */
  getCenter(extent: Rectangle): Cartesian3 {
    return Cartesian3.fromDegrees(
      (extent.west + extent.east) / 2,
      (extent.north + extent.south) / 2
    );
  }

  /**
   * Berekent een geschikte kijkafstand voor een extent.
   *
   * De afstand is gebaseerd op de grootste dimensie (breedte/hoogte)
   * en wordt begrensd door {@link MIN_VIEWDISTANCE} en {@link MAX_VIEWDISTANCE}.
   *
   * @param extent De {@link Rectangle} waarvoor de afstand berekend wordt
   * @returns De berekende afstand in meters
   */
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

  /**
   * Berekent de bounding box (extent) van een GeoJSON object.
   *
   * @param geojson GeoJSON string
   * @returns De berekende {@link Rectangle}
   */
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
      Math.min(extent1.west, extent2.west),
      Math.min(extent1.south, extent2.south),
      Math.max(extent1.east, extent2.east),
      Math.max(extent1.north, extent2.north)
    );
  }
}
