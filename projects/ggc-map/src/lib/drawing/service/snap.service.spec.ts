import { TestBed } from "@angular/core/testing";

import { GgcSnapService } from "./ggc-snap.service";
import { CoreSnapService } from "./core-snap.service";

describe("SnapService", () => {
  let service: GgcSnapService;
  let coreSnapService: CoreSnapService;

  const layerName = "testLayer";
  const mapIndex = "testMap";

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GgcSnapService);
    coreSnapService = TestBed.inject(CoreSnapService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should call coreSnapService.startSnap", () => {
    spyOn(coreSnapService, "startSnap");
    service.startSnap(layerName, mapIndex, {
      pixelTolerance: 30,
      snapLayers: ["snapLayer"],
      snapDrawLayers: ["snapDrawLayer"]
    });

    expect(coreSnapService.startSnap).toHaveBeenCalledWith(
      layerName,
      mapIndex,
      {
        pixelTolerance: 30,
        snapLayers: ["snapLayer"],
        snapDrawLayers: ["snapDrawLayer"]
      }
    );
  });

  it("should call coreSnapService.stopSnap", () => {
    spyOn(coreSnapService, "stopSnap");
    service.stopSnap(mapIndex);

    expect(coreSnapService.stopSnap).toHaveBeenCalledWith(mapIndex);
  });

  it("should call coreSnapService.getSnapExtendedEventsObservable", () => {
    spyOn(coreSnapService, "getSnapExtendedEventsObservable");
    service.getSnapExtendedEventsObservable(mapIndex);

    expect(
      coreSnapService.getSnapExtendedEventsObservable
    ).toHaveBeenCalledWith(mapIndex);
  });
});
