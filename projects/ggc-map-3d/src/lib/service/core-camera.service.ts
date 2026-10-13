import { Service } from "@angular/core";
import { CameraValues } from "../model/interfaces";
import { ReplaySubject } from "rxjs";

@Service()
export class CoreCameraService {
  private readonly cameraValuesSubject: ReplaySubject<CameraValues> =
    new ReplaySubject<CameraValues>(1);

  setCameraValues(cameraValues: CameraValues): void {
    this.cameraValuesSubject.next(cameraValues);
  }

  getCameraValuesObservable() {
    return this.cameraValuesSubject.asObservable();
  }
}
