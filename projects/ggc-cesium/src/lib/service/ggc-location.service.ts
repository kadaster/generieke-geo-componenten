import { inject, Injectable } from "@angular/core";
import { CoreViewerService } from "./core-viewer.service";
import { Cartesian3, Entity, HeightReference } from "@cesium/engine";
import { cameraUtils } from "../utils/camera-utils";
import { Subject } from "rxjs";
import { CameraOptions } from "../model/interfaces";

@Injectable({
  providedIn: "root"
})
export class GgcLocationService {
  private readonly coreViewerService = inject(CoreViewerService);
  private readonly geolocationPositionError: Subject<GeolocationPositionError> =
    new Subject<GeolocationPositionError>();
  private marked: Entity | undefined = undefined;
  private markerSvg: string;

  constructor() {
    this.markerSvg = this.getSvg();
  }

  zoomToCurrentLocation(): void {
    this.getLocation().then(async (location: GeolocationPosition) => {
      const cameraOptions: CameraOptions = {
        lookAtPosition: {
          lon: location.coords.longitude,
          lat: location.coords.latitude
        }
      } as CameraOptions;
      const viewer = this.coreViewerService.getViewer();
      if (viewer) {
        await cameraUtils.flyToLookAtPosition(cameraOptions, viewer);
      }
    });
  }

  zoomToCurrentLocationAndMark(): void {
    this.zoomToCurrentLocation();
    this.addLocationMark();
  }

  addLocationMark(): void {
    this.removeLocationMark();
    this.getLocation().then((location: GeolocationPosition) => {
      this.marked = new Entity({
        position: Cartesian3.fromDegrees(
          location.coords.longitude,
          location.coords.latitude
        ),
        billboard: {
          image: this.markerSvg,
          heightReference: HeightReference.CLAMP_TO_GROUND
        }
      });
      this.coreViewerService.getViewer()?.entities.add(this.marked);
    });
  }

  removeLocationMark(): void {
    if (this.marked !== undefined) {
      this.coreViewerService.getViewer()?.entities.remove(this.marked);
      this.marked = undefined;
    }
  }

  getGeolocationPositionErrorSubject(): Subject<GeolocationPositionError> {
    return this.geolocationPositionError;
  }

  public setMarkerSvg(markerSvg: string) {
    this.markerSvg = markerSvg;
  }

  private getLocation(): Promise<GeolocationPosition> {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("No support for geolocation"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          resolve(position);
        },
        (error: GeolocationPositionError) =>
          this.geolocationPositionError.next(error)
      );
    });
  }

  private getSvg(): string {
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="40" height="40" viewBox="0 0 256 256" xml:space="preserve"><defs></defs><g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)" ><path d="M 45 90 c -1.415 0 -2.725 -0.748 -3.444 -1.966 l -4.385 -7.417 C 28.167 65.396 19.664 51.02 16.759 45.189 c -2.112 -4.331 -3.175 -8.955 -3.175 -13.773 C 13.584 14.093 27.677 0 45 0 c 17.323 0 31.416 14.093 31.416 31.416 c 0 4.815 -1.063 9.438 -3.157 13.741 c -0.025 0.052 -0.053 0.104 -0.08 0.155 c -2.961 5.909 -11.41 20.193 -20.353 35.309 l -4.382 7.413 C 47.725 89.252 46.415 90 45 90 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(4,136,219); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" /><path d="M 45 45.678 c -8.474 0 -15.369 -6.894 -15.369 -15.368 S 36.526 14.941 45 14.941 c 8.474 0 15.368 6.895 15.368 15.369 S 53.474 45.678 45 45.678 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" /></g></svg>`;
  }
}
