import { TestBed } from "@angular/core/testing";
import { CameraValues } from "../model/interfaces";

import { CoreCameraService } from "./core-camera.service";

describe("CameraService", () => {
  let service: CoreCameraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoreCameraService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should preserve replay and repeated camera updates on the Observable", () => {
    const cameraValues: CameraValues = {
      cameraPosition: { lat: 52, lon: 5 },
      orientation: { heading: 90 }
    };
    const emittedValues: CameraValues[] = [];
    const subscription = service
      .getCameraValuesObservable()
      .subscribe((value) => emittedValues.push(value));

    expect(emittedValues).toEqual([]);

    service.setCameraValues(cameraValues);
    service.setCameraValues(cameraValues);
    subscription.unsubscribe();

    expect(emittedValues).toEqual([cameraValues, cameraValues]);

    const replayedValues: CameraValues[] = [];
    const replaySubscription = service
      .getCameraValuesObservable()
      .subscribe((value) => replayedValues.push(value));
    replaySubscription.unsubscribe();

    expect(replayedValues).toEqual([cameraValues]);
  });
});
