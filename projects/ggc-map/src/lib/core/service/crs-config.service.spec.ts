import { inject, TestBed } from "@angular/core/testing";

import { GgcCrsConfigService } from "./ggc-crs-config.service";

describe("CrsConfigService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GgcCrsConfigService]
    });
  });

  it("should be created", inject(
    [GgcCrsConfigService],
    (service: GgcCrsConfigService) => {
      expect(service).toBeTruthy();
    }
  ));

  it("getRdNewCrsConfig, should return info on CRS Rd New", inject(
    [GgcCrsConfigService],
    (service: GgcCrsConfigService) => {
      const rdNewConfig = service.getRdNewCrsConfig();

      expect(rdNewConfig.projectionCode).toBe("EPSG:28992");
      expect(rdNewConfig.extent).toEqual([
        -285401.92, 22598.08, 595401.92, 903401.92
      ]);
      expect(rdNewConfig.resolutions.length).toBe(26);
      expect(rdNewConfig.matrixSet).toBe("EPSG:28992");
      expect(rdNewConfig.matrixIds.length).toBe(26);
      expect(rdNewConfig.units).toBe("m");
    }
  ));
});
