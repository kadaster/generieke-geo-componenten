import { inject, Injectable } from "@angular/core";
import { CoreViewerService } from "./core-viewer.service";
import { Cartesian3, Entity, HeightReference, Rectangle } from "@cesium/engine";
import { cameraUtils } from "../utils/camera-utils";
import { CameraOptions } from "../model/interfaces";

/**
 * Service voor locatie-gerelateerde functionaliteit binnen de Cesium viewer.
 *
 * Deze service biedt:
 * - Functionaliteit om de camera naar een specifieke geografische locatie te bewegen;
 * - Ondersteuning voor zoomen naar een bounding box;
 * - Het plaatsen en verwijderen van een visuele marker op de kaart;
 * - Configuratie van een custom marker (SVG).
 *
 * Wordt onder andere gebruikt door zoek- en geolocatiecomponenten.
 */
@Injectable({
  providedIn: "root"
})
export class GgcLocationService {
  private readonly coreViewerService = inject(CoreViewerService);
  private marked: Entity | undefined = undefined;
  private markerSvg: string;

  constructor() {
    this.markerSvg = this.getSvg();
  }

  /**
   * Zoomt de viewer naar de huidige geografische locatie.
   *
   * Gebruikt een 'lookAtPosition' camera configuratie om de camera
   * gericht naar de opgegeven coordinaten te bewegen.
   *
   * @param coordinates De geolocation coordinates (latitude/longitude)
   * @returns Promise die resolved wanneer de animatie voltooid is
   */
  async zoomToCurrentLocation(
    coordinates: GeolocationCoordinates
  ): Promise<void> {
    const cameraOptions: CameraOptions = {
      lookAtPosition: {
        lon: coordinates.longitude,
        lat: coordinates.latitude
      }
    } as CameraOptions;
    const viewer = this.coreViewerService.getViewer();
    if (viewer) {
      await cameraUtils.flyToLookAtPosition(cameraOptions, viewer);
    }
  }

  /**
   * Zoomt de viewer naar een bounding box.
   *
   * @param bbox Array met [west, south, east, north] in graden
   */
  zoomToBBox(bbox: number[]) {
    const viewer = this.coreViewerService.getViewer();
    if (!viewer) return;

    const [west, south, east, north] = bbox;

    const rectangle = Rectangle.fromDegrees(west, south, east, north);

    viewer.camera.setView({
      destination: rectangle
    });
  }

  /**
   * Plaatst een marker op de opgegeven locatie.
   *
   * Indien er al een marker bestaat, wordt deze eerst verwijderd.
   *
   * @param coordinates De geolocation coordinates
   */
  addLocationMark(coordinates: GeolocationCoordinates): void {
    this.removeLocationMark();
    this.marked = new Entity({
      position: Cartesian3.fromDegrees(
        coordinates.longitude,
        coordinates.latitude
      ),
      billboard: {
        image: this.markerSvg,
        heightReference: HeightReference.CLAMP_TO_GROUND
      }
    });
    this.coreViewerService.getViewer()?.entities.add(this.marked);
  }

  /**
   * Verwijdert de huidige locatie marker van de kaart.
   */
  removeLocationMark(): void {
    if (this.marked !== undefined) {
      this.coreViewerService.getViewer()?.entities.remove(this.marked);
      this.marked = undefined;
    }
  }

  /**
   * Zet een custom SVG voor de locatie marker.
   *
   * @param markerSvg SVG string (bijv. data URL)
   */
  public setMarkerSvg(markerSvg: string) {
    this.markerSvg = markerSvg;
  }

  private getSvg(): string {
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="40" height="40" viewBox="0 0 256 256" xml:space="preserve"><defs></defs><g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)" ><path d="M 45 90 c -1.415 0 -2.725 -0.748 -3.444 -1.966 l -4.385 -7.417 C 28.167 65.396 19.664 51.02 16.759 45.189 c -2.112 -4.331 -3.175 -8.955 -3.175 -13.773 C 13.584 14.093 27.677 0 45 0 c 17.323 0 31.416 14.093 31.416 31.416 c 0 4.815 -1.063 9.438 -3.157 13.741 c -0.025 0.052 -0.053 0.104 -0.08 0.155 c -2.961 5.909 -11.41 20.193 -20.353 35.309 l -4.382 7.413 C 47.725 89.252 46.415 90 45 90 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(4,136,219); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" /><path d="M 45 45.678 c -8.474 0 -15.369 -6.894 -15.369 -15.368 S 36.526 14.941 45 14.941 c 8.474 0 15.368 6.895 15.368 15.369 S 53.474 45.678 45 45.678 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" /></g></svg>`;
  }
}
