import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { GgcOgcApiCapabilitiesService } from "./ggc-ogc-api-capabilities.service";
import {
  CoreOgcApiCapabilitiesService,
  OGCAPILandingPageInfo,
  OGCAPIStyle,
  OGCAPITile,
  OGCAPITileset
} from "./core-ogc-api-capabilities.service";
import { provideZoneChangeDetection } from "@angular/core";

describe("GgcOgcApiCapabilitiesService", () => {
  let service: GgcOgcApiCapabilitiesService;
  let coreMock: jasmine.SpyObj<CoreOgcApiCapabilitiesService>;

  const BASE_URL = "https://example.org/ogcapi";

  beforeEach(() => {
    coreMock = jasmine.createSpyObj("CoreOgcApiCapabilitiesService", [
      "getLandingPageInfo",
      "getStyles",
      "getTiles"
    ]);

    TestBed.configureTestingModule({
      providers: [
        GgcOgcApiCapabilitiesService,
        { provide: CoreOgcApiCapabilitiesService, useValue: coreMock },
        provideZoneChangeDetection()
      ]
    });

    service = TestBed.inject(GgcOgcApiCapabilitiesService);
  });

  describe("getServiceCapabilitiesOgcApi", () => {
    it("bouwt ServiceCapabilities met gefilterde RD styles & tiles, correcte URL en resoluties", (done) => {
      const landingPage: OGCAPILandingPageInfo = {
        title: "OGC API Example",
        description: "Beschrijving",
        links: {}
      };

      const rdStyle: OGCAPIStyle = {
        id: "basic-netherlandsRDNewQuad",
        title: "RD Style",
        links: [
          {
            rel: "stylesheet",
            type: "application/vnd.mapbox.style+json",
            href: "https://styles.example/style.json"
          }
        ]
      };

      const nonRdStyle: OGCAPIStyle = {
        id: "webmercator-style",
        title: "WM Style",
        links: [
          {
            rel: "stylesheet",
            type: "application/vnd.mapbox.style+json",
            href: "https://styles.example/wm.json"
          }
        ]
      };

      const tilesetRD: OGCAPITileset = {
        dataType: "type",
        tileMatrixSetDefinition: "def",
        tileMatrixSetId: "id",
        crs: "https://www.opengis.net/def/crs/EPSG/0/28992",
        links: [
          {
            rel: "item",
            href: "https://tiles.example/tiles/{tileMatrix}/{tileRow}/{tileCol}?apiKey=abc"
          }
        ],
        tileMatrixSetURI: "https://tiles.example/tms/28992",
        tileMatrixSetLimits: [
          {
            tileMatrix: "12",
            minTileRow: 0,
            maxTileRow: 10,
            maxTileCol: 10,
            minTileCol: 0
          }
        ]
      };

      const tilesetNonRD: OGCAPITileset = {
        crs: "https://www.opengis.net/def/crs/EPSG/0/3857",
        links: [],
        tileMatrixSetURI: "https://tiles.example/tms/3857",
        dataType: "type",
        tileMatrixSetId: "id",
        tileMatrixSetDefinition: "def",
        tileMatrixSetLimits: []
      };

      const tiles: OGCAPITile = {
        title: "RD Tiles",
        tilesets: [tilesetRD, tilesetNonRD]
      };

      coreMock.getLandingPageInfo.and.returnValue(of(landingPage));
      coreMock.getStyles.and.returnValue(of([rdStyle, nonRdStyle]));
      coreMock.getTiles.and.returnValue(of(tiles));

      service.getServiceCapabilitiesOgcApi(BASE_URL).subscribe({
        next: (capabilities) => {
          // Assert
          expect(capabilities.title).toBe("OGC API Example");
          expect(capabilities.abstract).toBe("Beschrijving");
          expect(capabilities.url).toBe(BASE_URL);
          expect(capabilities.type).toBe("OGCAPI");

          // RD tiles filter: 1 layer (alleen RD tileset)
          expect(capabilities.layers.length).toBe(1);

          const layer = capabilities.layers[0];
          expect(layer.name).toBe("RD Tiles"); // name == tiles.title
          expect(layer.title).toBe("RD Tiles");

          // URL-transformatie van {tileMatrix}/{tileRow}/{tileCol} → {z}/{x}/{y}
          expect(layer.url).toContain("{z}/{x}/{y}");
          expect(layer.url).toContain("?apiKey=abc");

          // Styles: alleen RD style (gefilterd op id .includes('netherlandsrdnewquad'))
          expect(layer.styles.length).toBe(1);
          expect(layer.styles[0].name).toBe(rdStyle.id);
          expect(layer.styles[0].title).toBe("RD Style");
          expect(layer.styles[0].legendURL).toBe(
            "https://styles.example/style.json"
          );

          // Resoluties voor tileMatrix level 12
          // initialResolution = 3440.64; minlevel=12, maxlevel=12
          // minResolution = 3440.64 / 2^12 = 0.84
          // maxResolution = 3440.64 / 2^(12-1) = 1.68
          expect(parseFloat(layer.minResolution ?? "0")).toBeCloseTo(0.84, 6);
          expect(parseFloat(layer.maxResolution ?? "0")).toBeCloseTo(1.68, 6);

          done();
        }
      });
    });

    it('gebruikt fallback URL wanneer geen rel="item" link beschikbaar is', (done) => {
      const landingPage: OGCAPILandingPageInfo = {
        title: "OGC API Example",
        description: "Beschrijving",
        links: {}
      };

      const rdStyle: OGCAPIStyle = {
        id: "netherlandsrdnewquad-style",
        title: "RD Style",
        links: [
          {
            rel: "stylesheet",
            type: "application/vnd.mapbox.style+json",
            href: "https://styles.example/style.json"
          }
        ]
      };

      const tilesetRDNoItem: OGCAPITileset = {
        dataType: "type",
        tileMatrixSetId: "id",
        tileMatrixSetDefinition: "def",
        crs: "https://www.opengis.net/def/crs/EPSG/0/28992",
        links: [],
        tileMatrixSetURI: "https://tiles.example/tms/28992",
        tileMatrixSetLimits: [
          {
            tileMatrix: "12",
            minTileRow: 0,
            maxTileRow: 10,
            maxTileCol: 10,
            minTileCol: 0
          }
        ]
      };

      const tiles: OGCAPITile = {
        title: "RD Tiles",
        tilesets: [tilesetRDNoItem]
      };

      coreMock.getLandingPageInfo.and.returnValue(of(landingPage));
      coreMock.getStyles.and.returnValue(of([rdStyle]));
      coreMock.getTiles.and.returnValue(of(tiles));

      service.getServiceCapabilitiesOgcApi(BASE_URL).subscribe({
        next: (capabilities) => {
          expect(capabilities.layers.length).toBe(1);
          const layer = capabilities.layers[0];
          expect(layer.url).toBe(
            "https://tiles.example/tms/28992/{z}/{x}/{y}?f=mvt"
          );
          done();
        }
      });
    });

    it("levert lege layers als er geen RD tilesets zijn", (done) => {
      const landingPage: OGCAPILandingPageInfo = {
        title: "OGC API Example",
        links: {}
      };
      const styles: OGCAPIStyle[] = [
        {
          id: "some-netherlandsrdnewquad-style",
          title: "RD Style",
          links: [
            {
              rel: "stylesheet",
              type: "application/vnd.mapbox.style+json",
              href: "https://styles.example/style.json"
            }
          ]
        }
      ];

      const tiles: OGCAPITile = {
        title: "Mixed Tiles",
        tilesets: [
          {
            dataType: "type",
            tileMatrixSetId: "id",
            tileMatrixSetDefinition: "def",
            links: [],
            tileMatrixSetLimits: [],
            crs: "https://www.opengis.net/def/crs/EPSG/0/3857",
            tileMatrixSetURI: "https://tiles.example/tms/3857"
          }
        ]
      };

      coreMock.getLandingPageInfo.and.returnValue(of(landingPage));
      coreMock.getStyles.and.returnValue(of(styles));
      coreMock.getTiles.and.returnValue(of(tiles));

      service.getServiceCapabilitiesOgcApi(BASE_URL).subscribe({
        next: (capabilities) => {
          expect(capabilities.layers.length).toBe(0);
          done();
        }
      });
    });
  });
});
