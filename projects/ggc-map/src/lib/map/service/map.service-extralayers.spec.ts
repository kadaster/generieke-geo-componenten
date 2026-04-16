import { TestBed } from "@angular/core/testing";
import { GgcCrsConfigService } from "../../core/service/ggc-crs-config.service";
import { CoreMapService } from "./core-map.service";
import { GgcMapService } from "./ggc-map.service";
import { provideZoneChangeDetection } from "@angular/core";

describe("MapService", () => {
  let mapService: GgcMapService;
  let coreMapService: CoreMapService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GgcMapService,
        CoreMapService,
        GgcCrsConfigService,
        provideZoneChangeDetection()
      ]
    });

    mapService = TestBed.inject(GgcMapService);
    coreMapService = TestBed.inject(CoreMapService);
  });

  it("should be created", () => {
    expect(mapService).toBeTruthy();
    expect(coreMapService["extraLayers"]).toEqual(["selection", "highlight"]);
  });
});
