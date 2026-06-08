import type { MockedObject } from "vitest";
import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import {
  GgcCapabilitiesService,
  ServiceCapabilities
} from "./ggc-capabilities.service";
import { GgcWmsWmtsCapabilitiesService } from "./ggc-wms-wmts-capabilities.service";
import { GgcOgcApiCapabilitiesService } from "./ggc-ogc-api-capabilities.service";
import { provideZoneChangeDetection } from "@angular/core";

describe("GgcCapabilitiesService", () => {
  let service: GgcCapabilitiesService;

  let wmsWmtsSvcSpy: Pick<
    MockedObject<GgcWmsWmtsCapabilitiesService>,
    "getServiceCapabilitiesWMS" | "getServiceCapabilitiesWMTS"
  >;
  let ogcApiSvcSpy: Pick<
    MockedObject<GgcOgcApiCapabilitiesService>,
    "getServiceCapabilitiesOgcApi"
  >;

  const baseUrl = "https://example.test/service";

  beforeEach(() => {
    wmsWmtsSvcSpy = {
      getServiceCapabilitiesWMS: vi
        .fn()
        .mockName("GgcWmsWmtsCapabilitiesService.getServiceCapabilitiesWMS"),
      getServiceCapabilitiesWMTS: vi
        .fn()
        .mockName("GgcWmsWmtsCapabilitiesService.getServiceCapabilitiesWMTS")
    };

    ogcApiSvcSpy = {
      getServiceCapabilitiesOgcApi: vi
        .fn()
        .mockName("GgcOgcApiCapabilitiesService.getServiceCapabilitiesOgcApi")
    };

    TestBed.configureTestingModule({
      providers: [
        GgcCapabilitiesService,
        { provide: GgcWmsWmtsCapabilitiesService, useValue: wmsWmtsSvcSpy },
        { provide: GgcOgcApiCapabilitiesService, useValue: ogcApiSvcSpy },
        provideZoneChangeDetection()
      ]
    });

    service = TestBed.inject(GgcCapabilitiesService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("getServiceFromCapabilities", () => {
    it("serviceType WMS roept WMS-capabilities aan en geeft resultaat door", async () => {
      const wmsMock: ServiceCapabilities = {
        url: baseUrl,
        type: "WMS",
        layers: [
          {
            name: "wms:layer",
            title: "WMS Layer",
            styles: [
              { name: "default", legendURL: "https://example.test/legend.png" }
            ]
          }
        ]
      };
      wmsWmtsSvcSpy.getServiceCapabilitiesWMS.mockReturnValue(of(wmsMock));

      service.getServiceFromCapabilities(baseUrl, "WMS").subscribe((result) => {
        expect(result).toEqual(wmsMock);

        // controleer aanroepen
        expect(wmsWmtsSvcSpy.getServiceCapabilitiesWMS).toHaveBeenCalledTimes(
          1
        );

        // controleer aanroepen
        expect(wmsWmtsSvcSpy.getServiceCapabilitiesWMS).toHaveBeenCalledWith(
          baseUrl
        );
      });
    });

    it("serviceType WMTS roept WMTS-capabilities aan en geeft resultaat door", async () => {
      const wmtsMock: ServiceCapabilities = {
        url: baseUrl,
        type: "WMTS",
        layers: [
          {
            name: "wmts:layer",
            title: "WMTS Layer",
            styles: [
              { name: "default", legendURL: "https://example.test/legend2.png" }
            ]
          }
        ]
      };
      wmsWmtsSvcSpy.getServiceCapabilitiesWMTS.mockReturnValue(of(wmtsMock));

      service
        .getServiceFromCapabilities(baseUrl, "WMTS")
        .subscribe((result) => {
          expect(result).toEqual(wmtsMock);

          expect(
            wmsWmtsSvcSpy.getServiceCapabilitiesWMTS
          ).toHaveBeenCalledTimes(1);

          expect(wmsWmtsSvcSpy.getServiceCapabilitiesWMTS).toHaveBeenCalledWith(
            baseUrl
          );
        });
    });

    it("serviceType OGCAPI roept OGC API-capabilities aan en geeft resultaat door", async () => {
      const ogcApiMock: ServiceCapabilities = {
        url: baseUrl,
        type: "OGCAPI",
        layers: [
          {
            name: "ogc:collection",
            title: "OGC Collection",
            styles: [
              { name: "default", legendURL: "https://example.test/legend3.png" }
            ]
          }
        ]
      };
      ogcApiSvcSpy.getServiceCapabilitiesOgcApi.mockReturnValue(of(ogcApiMock));

      service
        .getServiceFromCapabilities(baseUrl, "OGCAPI")
        .subscribe((result) => {
          expect(result).toEqual(ogcApiMock);

          expect(
            ogcApiSvcSpy.getServiceCapabilitiesOgcApi
          ).toHaveBeenCalledTimes(1);

          expect(
            ogcApiSvcSpy.getServiceCapabilitiesOgcApi
          ).toHaveBeenCalledWith(baseUrl);
        });
    });
  });

  describe("getServiceLayerStyles", () => {
    it("zou WMS styles terug moeten geven wanneer gezocht wordt op de juiste layer naam", async () => {
      const baseUrl = "baseUrl";
      const wmsMock: ServiceCapabilities = {
        url: baseUrl,
        type: "WMS",
        layers: [
          {
            name: "wms:layer",
            title: "WMS Layer",
            styles: [
              { name: "default", legendURL: "https://example.test/legend.png" }
            ]
          }
        ]
      };
      wmsWmtsSvcSpy.getServiceCapabilitiesWMS.mockReturnValue(of(wmsMock));

      service
        .getServiceLayerStyles(baseUrl, "WMS", "wms:layer")
        .subscribe((result) => {
          expect(result).toBe(wmsMock.layers[0].styles);
        });
    });

    it("zou WMTS styles terug moeten geven wanneer gezocht wordt op de juiste layer naam", async () => {
      const baseUrl = "baseUrl";
      const wmtsMock: ServiceCapabilities = {
        url: baseUrl,
        type: "WMTS",
        layers: [
          {
            name: "wmts:layer",
            title: "WMTS Layer",
            styles: [
              { name: "default", legendURL: "https://example.test/legend.png" }
            ]
          }
        ]
      };
      wmsWmtsSvcSpy.getServiceCapabilitiesWMTS.mockReturnValue(of(wmtsMock));

      service
        .getServiceLayerStyles(baseUrl, "WMTS", "wmts:layer")
        .subscribe((result) => {
          expect(result).toBe(wmtsMock.layers[0].styles);
        });
    });

    it("zou OGCAPI styles terug moeten geven wanneer gezocht wordt op de juiste layer naam", async () => {
      const baseUrl = "baseUrl";
      const ogcMock: ServiceCapabilities = {
        url: baseUrl,
        type: "OGCAPI",
        layers: [
          {
            name: "ogc:layer",
            title: "OGC Layer",
            styles: [
              { name: "default", legendURL: "https://example.test/legend.png" }
            ]
          }
        ]
      };
      ogcApiSvcSpy.getServiceCapabilitiesOgcApi.mockReturnValue(of(ogcMock));

      service
        .getServiceLayerStyles(baseUrl, "OGCAPI", "ogc:layer")
        .subscribe((result) => {
          expect(result).toBe(ogcMock.layers[0].styles);
        });
    });
  });
});
