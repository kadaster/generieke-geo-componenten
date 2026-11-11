import { inject, Service } from "@angular/core";
import { CoreViewerService } from "./core-viewer.service";
import { CoreCameraService } from "./core-camera.service";
import {
  getCameraValues,
  MAX_VIEWDISTANCE,
  MIN_VIEWDISTANCE
} from "../utils/camera-utils";
import { CameraValues } from "../model/interfaces";
import {
  Cartesian2,
  Cartesian3,
  Cartographic,
  Rectangle
} from "@cesium/engine";
import { Viewer } from "@cesium/widgets";
import { Observable } from "rxjs";

/**
 * Service met helper-functionaliteit rondom de Cesium viewer.
 *
 * Deze service biedt:
 * - Toegang tot de huidige {@link CameraValues};
 * - Berekeningen voor extent, center en kijkafstand;
 * - Berekenen van hoekcoördinaten van het canvas;
 * - Hulpfuncties voor het werken met GeoJSON extents.
 *
 * Wordt voornamelijk gebruikt door viewer-logica zoals camera positioning
 * en "zoom-to-fit" functionaliteit.
 */
@Service()
export class GgcViewerService {
  private readonly coreViewerService = inject(CoreViewerService);
  private readonly coreCameraService = inject(CoreCameraService);

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

  // Onderstaande functie toegevoegd om problemen met compileren te ondervangen.
  /**
   * Geeft een observable met updates van de camerawaarden van de viewer.
   *
   * @returns Een {@link Observable} van {@link CameraValues}
   */
  getCameraValuesObservable(): Observable<CameraValues> {
    return this.coreCameraService.getCameraValuesObservable();
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
   * Berekent de geografische coördinaten van de vier hoeken van het canvas.
   *
   * @param viewer De Cesium-viewer waarvoor de coördinaten worden berekend
   * @returns De hoekcoördinaten met longitude en latitude in graden en height in meters. Wanneer minstebns één hoek geen raakpunt met het aardoppervlak oplevert, retouneert  de functie undefined.
   */
  getCanvasCornerCoordinates(
    viewer: Viewer | undefined = this.coreViewerService.getViewer()
  ): { longitude: number; latitude: number; height: number }[] | undefined {
    if (!viewer) return undefined;
    const scene = viewer.scene;
    const camera = scene.camera;
    const canvas = scene.canvas;

    const corners = [
      new Cartesian2(0, 0),
      new Cartesian2(canvas.clientWidth, 0),
      new Cartesian2(canvas.clientWidth, canvas.clientHeight),
      new Cartesian2(0, canvas.clientHeight)
    ];

    const result: {
      longitude: number;
      latitude: number;
      height: number;
    }[] = [];

    for (const corner of corners) {
      const ray = camera.getPickRay(corner);
      if (!ray) return undefined;

      const cartesian = scene.globe.pick(ray, scene);
      if (!cartesian) return undefined;

      const cartographic = Cartographic.fromCartesian(cartesian);

      result.push({
        longitude: (cartographic.longitude * 180) / Math.PI,
        latitude: (cartographic.latitude * 180) / Math.PI,
        height: cartographic.height
      });
    }
    return result;
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
