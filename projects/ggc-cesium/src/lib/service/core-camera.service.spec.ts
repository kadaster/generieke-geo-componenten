import { TestBed } from "@angular/core/testing";

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
});
