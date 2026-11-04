import type { MockedObject } from "vitest";
import { TestBed } from "@angular/core/testing";
import { firstValueFrom, of } from "rxjs";
import {
  GgcCapabilitiesService,
  ServiceCapabilities
} from "./ggc-capabilities.service";
import { CoreWmsWmtsCapabilitiesService } from "./core-wms-wmts-capabilities.service";
import { GgcOgcApiCapabilitiesService } from "./ggc-ogc-api-capabilities.service";
import { provideZonelessChangeDetection } from "@angular/core";
import { Webservice2DType } from "@kadaster/ggc-models";
import { WmsLayerOptions } from "../model/wms-layer.model";
import { WmtsLayerOptions } from "../model/wmts-layer.model";
import { VectorTileLayerOptions } from "../model/vector-tile-layer.model";

describe("GgcCapabilitiesService", () => {
  let service: GgcCapabilitiesService;

  let wmsWmtsSvcSpy: MockedObject<CoreWmsWmtsCapabilitiesService>;
  let ogcApiSvcSpy: MockedObject<GgcOgcApiCapabilitiesService>;

  const baseUrl = "https://example.test/service";

  beforeEach(() => {
    wmsWmtsSvcSpy = {
      getServiceCapabilitiesWMS: vi
        .fn()
        .mockName("CoreWmsWmtsCapabilitiesService.getServiceCapabilitiesWMS"),
      getServiceCapabilitiesWMTS: vi
        .fn()
        .mockName("CoreWmsWmtsCapabilitiesService.getServiceCapabilitiesWMTS")
    } as MockedObject<CoreWmsWmtsCapabilitiesService>;

    ogcApiSvcSpy = {
      getServiceCapabilitiesOgcApi: vi
        .fn()
        .mockName("GgcOgcApiCapabilitiesService.getServiceCapabilitiesOgcApi")
    } as MockedObject<GgcOgcApiCapabilitiesService>;

    TestBed.configureTestingModule({
      providers: [
        GgcCapabilitiesService,
        {
          provide: CoreWmsWmtsCapabilitiesService,
          useValue: wmsWmtsSvcSpy
        },
        { provide: GgcOgcApiCapabilitiesService, useValue: ogcApiSvcSpy },
        provideZonelessChangeDetection()
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

  describe("mapCapabilitiesOnLayerOptions", () => {
    it("WMS: mapt title en resoluties van de laag met dezelfde name", async () => {
      const wmsMock: ServiceCapabilities = {
        url: baseUrl,
        type: "WMS",
        layers: [
          { name: "other", title: "Andere laag", styles: [] },
          {
            name: "natura2000",
            title: "Natura 2000",
            maxResolution: "28",
            minResolution: "0.28",
            styles: []
          }
        ]
      };
      wmsWmtsSvcSpy.getServiceCapabilitiesWMS.mockReturnValue(of(wmsMock));
      const wmsLayerOptions: WmsLayerOptions = {
        url: `${baseUrl}?service=WMS`,
        layers: ["natura2000", "other"]
      };

      const result = await firstValueFrom(
        service.mapCapabilitiesOnLayerOptions(
          wmsLayerOptions,
          Webservice2DType.WMS
        )
      );

      expect(wmsWmtsSvcSpy.getServiceCapabilitiesWMS).toHaveBeenCalledWith(
        baseUrl
      );
      expect(result.title).toBe("Natura 2000");
      expect(result.maxResolution).toBe(28);
      expect(result.minResolution).toBe(0.28);
      expect(wmsLayerOptions.title).toBeUndefined();
    });

    it("overschrijft bestaande waarden niet", async () => {
      const wmsMock: ServiceCapabilities = {
        url: baseUrl,
        type: "WMS",
        layers: [
          {
            name: "laag",
            title: "Titel uit capabilities",
            maxResolution: "100000",
            minResolution: "1000",
            styles: []
          }
        ]
      };
      wmsWmtsSvcSpy.getServiceCapabilitiesWMS.mockReturnValue(of(wmsMock));
      const wmsLayerOptions: WmsLayerOptions = {
        url: baseUrl,
        layers: "laag",
        title: "Eigen titel",
        minResolution: 1,
        maxResolution: 2
      };

      const result = await firstValueFrom(
        service.mapCapabilitiesOnLayerOptions(
          wmsLayerOptions,
          Webservice2DType.WMS
        )
      );

      expect(result).toEqual(wmsLayerOptions);
    });

    it("WMTS: matcht op layer en mapt alleen title", async () => {
      const wmtsMock: ServiceCapabilities = {
        url: baseUrl,
        type: "WMTS",
        layers: [{ name: "wmts:layer", title: "WMTS Layer", styles: [] }]
      };
      wmsWmtsSvcSpy.getServiceCapabilitiesWMTS.mockReturnValue(of(wmtsMock));
      const wmtsLayerOptions: WmtsLayerOptions = {
        url: `${baseUrl}?request=GetCapabilities`,
        layer: "wmts:layer"
      };

      const result = await firstValueFrom(
        service.mapCapabilitiesOnLayerOptions(
          wmtsLayerOptions,
          Webservice2DType.WMTS
        )
      );

      expect(wmsWmtsSvcSpy.getServiceCapabilitiesWMTS).toHaveBeenCalledWith(
        baseUrl
      );
      expect(result.title).toBe("WMTS Layer");
      expect(result.minResolution).toBeUndefined();
      expect(result.maxResolution).toBeUndefined();
    });

    it("WMS: gebruikt layerName boven layers", async () => {
      wmsWmtsSvcSpy.getServiceCapabilitiesWMS.mockReturnValue(
        of({
          url: baseUrl,
          type: "WMS",
          layers: [
            { name: "uit-layers", title: "Layers", styles: [] },
            { name: "uit-layerName", title: "LayerName", styles: [] }
          ]
        })
      );
      const wmsLayerOptions: WmsLayerOptions = {
        url: baseUrl,
        layerName: "uit-layerName",
        layers: ["uit-layers"]
      };

      const result = await firstValueFrom(
        service.mapCapabilitiesOnLayerOptions(
          wmsLayerOptions,
          Webservice2DType.WMS
        )
      );

      expect(result.title).toBe("LayerName");
    });

    it("WMTS: gebruikt layerName boven layer", async () => {
      wmsWmtsSvcSpy.getServiceCapabilitiesWMTS.mockReturnValue(
        of({
          url: baseUrl,
          type: "WMTS",
          layers: [
            { name: "uit-layer", title: "Layer", styles: [] },
            { name: "uit-layerName", title: "LayerName", styles: [] }
          ]
        })
      );
      const wmtsLayerOptions: WmtsLayerOptions = {
        url: baseUrl,
        layerName: "uit-layerName",
        layer: "uit-layer"
      };

      const result = await firstValueFrom(
        service.mapCapabilitiesOnLayerOptions(
          wmtsLayerOptions,
          Webservice2DType.WMTS
        )
      );

      expect(result.title).toBe("LayerName");
    });

    it("Vector: haalt OGC API capabilities op van de landingspagina", async () => {
      const landingPageUrl = "https://api.example.test/ogc/v1";
      const ogcMock: ServiceCapabilities = {
        url: landingPageUrl,
        type: "OGCAPI",
        layers: [
          {
            name: "tiles",
            title: "Tiles",
            maxResolution: "3440.64",
            minResolution: "0.105",
            styles: []
          }
        ]
      };
      ogcApiSvcSpy.getServiceCapabilitiesOgcApi.mockReturnValue(of(ogcMock));
      const vectorTileLayerOptions: VectorTileLayerOptions = {
        url: `${landingPageUrl}/tiles/NetherlandsRDNewQuad/{z}/{y}/{x}?f=mvt`
      };

      const result = await firstValueFrom(
        service.mapCapabilitiesOnLayerOptions(
          vectorTileLayerOptions,
          Webservice2DType.VECTOR
        )
      );

      expect(ogcApiSvcSpy.getServiceCapabilitiesOgcApi).toHaveBeenCalledWith(
        landingPageUrl
      );
      expect(result).toEqual({
        ...vectorTileLayerOptions,
        title: "Tiles",
        maxResolution: 3440.64,
        minResolution: 0.105
      });
    });

    describe("Vector met enableOverzoom", () => {
      const landingPageUrl = "https://api.example.test/ogc/v1";
      const vectorTileUrl = `${landingPageUrl}/tiles/NetherlandsRDNewQuad/{z}/{y}/{x}?f=mvt`;

      beforeEach(() => {
        ogcApiSvcSpy.getServiceCapabilitiesOgcApi.mockReturnValue(
          of({
            url: landingPageUrl,
            type: "OGCAPI",
            layers: [
              {
                name: "tiles",
                title: "Tiles",
                maxResolution: "3440.64",
                minResolution: "0.105",
                styles: []
              }
            ]
          })
        );
      });

      it("zet minResolution niet uit de capabilities maar wel maxResolution", async () => {
        const vectorTileLayerOptions: VectorTileLayerOptions = {
          url: vectorTileUrl,
          enableOverzoom: true
        };

        const result = await firstValueFrom(
          service.mapCapabilitiesOnLayerOptions(
            vectorTileLayerOptions,
            Webservice2DType.VECTOR
          )
        );

        expect(result.minResolution).toBeUndefined();
        expect(result.maxResolution).toBe(3440.64);
        expect(result.title).toBe("Tiles");
      });
    });

    it("geeft layerOptions ongewijzigd terug als er geen passende laag is", async () => {
      wmsWmtsSvcSpy.getServiceCapabilitiesWMS.mockReturnValue(
        of({ url: baseUrl, type: "WMS", layers: [] })
      );
      const wmsLayerOptions: WmsLayerOptions = { url: baseUrl, layers: "x" };

      const result = await firstValueFrom(
        service.mapCapabilitiesOnLayerOptions(
          wmsLayerOptions,
          Webservice2DType.WMS
        )
      );

      expect(result).toBe(wmsLayerOptions);
    });

    it.each([Webservice2DType.GEOJSON, Webservice2DType.IMAGE])(
      "%s: doet niets en haalt geen capabilities op",
      async (layerType) => {
        const layerOptions = { url: `${baseUrl}?f=json` };

        const result = await firstValueFrom(
          service.mapCapabilitiesOnLayerOptions(layerOptions, layerType)
        );

        expect(result).toBe(layerOptions);
        expect(wmsWmtsSvcSpy.getServiceCapabilitiesWMS).not.toHaveBeenCalled();
        expect(wmsWmtsSvcSpy.getServiceCapabilitiesWMTS).not.toHaveBeenCalled();
        expect(
          ogcApiSvcSpy.getServiceCapabilitiesOgcApi
        ).not.toHaveBeenCalled();
      }
    );
  });
});
