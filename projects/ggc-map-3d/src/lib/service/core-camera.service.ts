import { Injectable } from "@angular/core";
import { CameraValues } from "../model/interfaces";
import { ReplaySubject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class CoreCameraService {
  private cameraValuesSubject: ReplaySubject<CameraValues> =
    new ReplaySubject<CameraValues>(1);

  setCameraValues(cameraValues: CameraValues) {
    this.cameraValuesSubject.next(cameraValues);
  }

  getCameraValuesObservable() {
    return this.cameraValuesSubject.asObservable();
  }
}
