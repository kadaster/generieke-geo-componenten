import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GgcWmsWmtsCapabilitiesService } from "./ggc-wms-wmts-capabilities.service";
import { CoreWmsWmtsCapabilitiesService } from "./core-wms-wmts-capabilities.service";
import { ServiceCapabilities } from "./ggc-capabilities.service";
import { provideZoneChangeDetection } from "@angular/core";

const WMS_CAPABILITIES = {
  Service: {
    Title: "Test WMS Service",
    Abstract: "Beschrijving van WMS service"
  },
  Request: {
    GetCapabilities: {
      DCPType: {
        HTTP: {
          Get: {
            OnlineResource:
              "https://example.com/wms?service=WMS&request=GetCapabilities"
          }
        }
      }
    }
  },
  Capability: {
    Layer: {
      Layer: [
        {
          Name: "laag_1",
          Title: "Laag 1 titel",
          MaxScaleDenominator: "5000",
          MinScaleDenominator: "250",
          Style: [
            {
              Name: "default",
              LegendURL: [
                {
                  OnlineResource:
                    "https://example.com/wms?request=GetLegendGraphic&layer=laag_1"
                }
              ]
            },
            {
              Name: "grijs",
              LegendURL: [
                { OnlineResource: "https://example.com/legend/grijs.png" }
              ]
            }
          ]
        },
        {
          Name: "laag_2",
          Title: "Laag 2 titel",
          MaxScaleDenominator: "10000",
          MinScaleDenominator: "500",
          Style: [
            {
              Name: "default",
              LegendURL: [
                {
                  OnlineResource:
                    "https://example.com/wms?request=GetLegendGraphic&layer=laag_2"
                }
              ]
            }
          ]
        }
      ]
    }
  }
};

const WMTS_CAPABILITIES = {
  OperationsMetadata: {
    DCP: {
      HTTP: {
        Get: [{ href: "https://example.com/wmts?SERVICE=WMTS" }]
      }
    }
  },
  Contents: {
    Layer: [
      {
        Identifier: "wmts_layer_1",
        Title: "WMTS Laag 1",
        Style: [
          {
            Identifier: "default",
            LegendURL: [{ href: "https://example.com/wmts/legend/layer1.png" }]
          }
        ]
      },
      {
        Identifier: "wmts_layer_2",
        Title: "WMTS Laag 2",
        Style: [
          {
            Identifier: "line",
            LegendURL: [
              { href: "https://example.com/wmts/legend/layer2-line.png" }
            ]
          },
          {
            Identifier: "fill",
            LegendURL: [
              { href: "https://example.com/wmts/legend/layer2-fill.png" }
            ]
          }
        ]
      }
    ]
  }
};

const WMS_CAPABILITIES_WITHOUT_STYLES = {
  Service: { Title: "WMS zonder styles", Abstract: "" },
  Request: {
    GetCapabilities: {
      DCPType: { HTTP: { Get: { OnlineResource: "https://example.com/wms" } } }
    }
  },
  Capability: {
    Layer: { Layer: [{ Name: "laag_zonder_styles", Title: "Geen styles" }] }
  }
};

const WMTS_CAPABILITIES_WITHOUT_STYLES = {
  OperationsMetadata: {
    DCP: { HTTP: { Get: [{ href: "https://example.com/wmts" }] } }
  },
  Contents: { Layer: [{ Identifier: "wmts_no_styles", Title: "Geen styles" }] }
};

class CoreCapabilitiesServiceMock {
  getCapabilitiesForUrl = jasmine.createSpy("getCapabilitiesForUrl");
}

describe("GgcWmsWmtsCapabilitiesService", () => {
  let service: GgcWmsWmtsCapabilitiesService;
  let coreMock: CoreCapabilitiesServiceMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GgcWmsWmtsCapabilitiesService,
        {
          provide: CoreWmsWmtsCapabilitiesService,
          useClass: CoreCapabilitiesServiceMock
        },
        provideZoneChangeDetection()
      ]
    });
    service = TestBed.inject(GgcWmsWmtsCapabilitiesService);
    coreMock = TestBed.inject(
      CoreWmsWmtsCapabilitiesService
    ) as unknown as CoreCapabilitiesServiceMock;
  });

  describe("getCapabilities", () => {
    it("should call the core service with the correct args", (done) => {
      const baseUrl = "https://example.com/path";
      const type = "WMS" as const;
      const expected = { ok: true };

      coreMock.getCapabilitiesForUrl.and.returnValue(of(expected));

      service.getCapabilities(baseUrl, type).subscribe((res) => {
        expect(coreMock.getCapabilitiesForUrl).toHaveBeenCalledWith(
          baseUrl,
          type
        );
        expect(res).toEqual(expected);
        done();
      });
    });

    it("will propagate errors of CoreWmsWmtsCapabilitiesService", (done) => {
      const error = new Error("network error");
      coreMock.getCapabilitiesForUrl.and.returnValue(throwError(() => error));

      service.getCapabilities("u", "WMTS").subscribe({
        next: () => fail("Expected error"),
        error: (e) => {
          expect(e).toBe(error);
          done();
        }
      });
    });
  });

  describe("getCapabilitiesServiceWMS", () => {
    it("will return a service (happy path)", (done) => {
      coreMock.getCapabilitiesForUrl.and.returnValue(of(WMS_CAPABILITIES));

      service
        .getServiceCapabilitiesWMS("https://example.com/wms")
        .subscribe((svc: ServiceCapabilities | undefined) => {
          if (!svc) {
            fail("Expected service to be definend");
            done();
            return;
          }
          expect(svc.type).toBe("WMS");
          expect(svc.title).toBe("Test WMS Service");
          expect(svc.abstract).toBe("Beschrijving van WMS service");
          expect(svc.url).toBe(
            "https://example.com/wms?service=WMS&request=GetCapabilities"
          );
          expect(svc.layers.length).toBe(2);

          // Layer 1 assertions
          const l1 = svc.layers[0];
          expect(l1.title).toBe("laag_1");
          expect(l1.maxResolution).toBe("5000");
          expect(l1.minResolution).toBe("250");
          expect(l1.styles.length).toBe(2);
          expect(l1.styles[0]).toEqual({
            name: "default",
            legendURL:
              "https://example.com/wms?request=GetLegendGraphic&layer=laag_1"
          });
          // Layer 2 assertions
          const l2 = svc.layers[1];
          expect(l2.title).toBe("laag_2");
          expect(l2.styles.length).toBe(1);

          done();
        });
    });

    it("extractStylesFromWMSLayer should retun the correct style", () => {
      const layer = WMS_CAPABILITIES.Capability.Layer.Layer[0];
      const styles = service.extractStylesFromWMSLayer(layer);
      expect(styles.length).toBe(2);
      expect(styles[1]).toEqual({
        name: "grijs",
        legendURL: "https://example.com/legend/grijs.png"
      });
    });
  });

  describe("getCapabilitiesServiceWMTS", () => {
    it("should convert capabilities to a Styles object (happy path)", (done) => {
      coreMock.getCapabilitiesForUrl.and.returnValue(of(WMTS_CAPABILITIES));

      service
        .getServiceCapabilitiesWMTS("https://example.com/wmts")
        .subscribe((svc: ServiceCapabilities | undefined) => {
          if (!svc) {
            fail("Expected service to be definend");
            done();
            return;
          }
          expect(svc.type).toBe("WMTS");
          expect(svc.url).toBe("https://example.com/wmts?SERVICE=WMTS");
          expect(svc.layers.length).toBe(2);

          const l1 = svc.layers[0];
          expect(l1.name).toBe("wmts_layer_1");
          expect(l1.title).toBe("WMTS Laag 1");
          expect(l1.styles.length).toBe(1);
          expect(l1.styles[0]).toEqual({
            name: "default",
            legendURL: "https://example.com/wmts/legend/layer1.png"
          });

          const l2 = svc.layers[1];
          expect(l2.name).toBe("wmts_layer_2");
          expect(l2.styles.length).toBe(2);
          done();
        });
    });

    it("extractStylesFromWMTSLayer should return correct Style[]", () => {
      const layer = WMTS_CAPABILITIES.Contents.Layer[1];
      const styles = service.extractStylesFromWMTSLayer(layer);
      expect(styles.length).toBe(2);
      expect(styles[0]).toEqual({
        name: "line",
        legendURL: "https://example.com/wmts/legend/layer2-line.png"
      });
    });
  });

  describe("edge-cases & robustness", () => {
    it("extractServiceWMS: handles empty capabilities/missing layers", () => {
      const result = service.extractServiceCapabilitiesWMS({} as any);
      expect(result.layers.length).toBe(0);
    });

    it("should handle capabilities without WMS styles", () => {
      const result = service.extractServiceCapabilitiesWMS(
        WMS_CAPABILITIES_WITHOUT_STYLES as any
      );
      expect(result.layers.length).toBe(1);
      expect(result.layers[0].styles.length).toBe(0);
    });

    it("extractServiceWMTS: handles empty capabilities/missing layers", () => {
      const result = service.extractServiceCapabilitiesWMTS({} as any);
      expect(result.layers.length).toBe(0);
    });

    it("should handle missing styles in WMTS capabilities", () => {
      const result = service.extractServiceCapabilitiesWMTS(
        WMTS_CAPABILITIES_WITHOUT_STYLES as any
      );
      expect(result.layers.length).toBe(1);
      expect(result.layers[0].styles.length).toBe(0);
    });
  });
});
