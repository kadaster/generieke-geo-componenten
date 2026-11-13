import type { MockedObject } from "vitest";
import { TestBed } from "@angular/core/testing";
import { firstValueFrom, of } from "rxjs";
import { GgcOgcApiCapabilitiesService } from "./ggc-ogc-api-capabilities.service";
import {
  CoreOgcApiCapabilitiesService,
  OGCAPILandingPageInfo,
  OGCAPIStyle,
  OGCAPITile,
  OGCAPITileset
} from "./core-ogc-api-capabilities.service";
import { provideZonelessChangeDetection } from "@angular/core";

describe("GgcOgcApiCapabilitiesService", () => {
  let service: GgcOgcApiCapabilitiesService;
  let coreMock: MockedObject<CoreOgcApiCapabilitiesService>;

  const BASE_URL = "https://example.org/ogcapi";

  const LANDING_PAGE: OGCAPILandingPageInfo = {
    title: "OGC API Example",
    links: {}
  };

  const RD_STYLE: OGCAPIStyle = {
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

  const createRDTileset = (tileLevels: string[]): OGCAPITileset => ({
    dataType: "type",
    tileMatrixSetId: "id",
    tileMatrixSetDefinition: "def",
    crs: "https://www.opengis.net/def/crs/EPSG/0/28992",
    links: [],
    tileMatrixSetURI: "https://tiles.example/tms/28992",
    tileMatrixSetLimits: tileLevels.map((tileLevel) => ({
      tileMatrix: tileLevel,
      minTileRow: 0,
      maxTileRow: 10,
      minTileCol: 0,
      maxTileCol: 10
    }))
  });

  beforeEach(() => {
    coreMock = {
      getLandingPageInfo: vi
        .fn()
        .mockName("CoreOgcApiCapabilitiesService.getLandingPageInfo"),
      getStyles: vi.fn().mockName("CoreOgcApiCapabilitiesService.getStyles"),
      getTiles: vi.fn().mockName("CoreOgcApiCapabilitiesService.getTiles")
    } as MockedObject<CoreOgcApiCapabilitiesService>;

    TestBed.configureTestingModule({
      providers: [
        GgcOgcApiCapabilitiesService,
        { provide: CoreOgcApiCapabilitiesService, useValue: coreMock },
        provideZonelessChangeDetection()
      ]
    });

    service = TestBed.inject(GgcOgcApiCapabilitiesService);
  });

  describe("getServiceCapabilitiesOgcApi", () => {
    it("bouwt ServiceCapabilities met gefilterde RD styles & tiles, correcte URL en resoluties", async () => {
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

      coreMock.getLandingPageInfo.mockReturnValue(of(landingPage));
      coreMock.getStyles.mockReturnValue(of([rdStyle, nonRdStyle]));
      coreMock.getTiles.mockReturnValue(of(tiles));

      const capabilities = await firstValueFrom(
        service.getServiceCapabilitiesOgcApi(BASE_URL)
      );

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
    });

    it.each([
      {
        omschrijving: "uit één tilelevel",
        tileLevels: ["12"],
        expectedMinResolution: 0.42,
        expectedMaxResolution: 0.84
      },
      {
        omschrijving: "uit het laagste en hoogste van meerdere tilelevels",
        tileLevels: ["10", "11", "12"],
        expectedMinResolution: 0.42,
        expectedMaxResolution: 3.36
      },
      {
        omschrijving: "zonder de onbruikbare tilelevels mee te tellen",
        tileLevels: ["10", "onbruikbaar", "12"],
        expectedMinResolution: 0.42,
        expectedMaxResolution: 3.36
      },
      {
        omschrijving: "met tilelevels geklemd op het bereik 0..16",
        tileLevels: ["-5", "99"],
        expectedMinResolution: 0.02625,
        expectedMaxResolution: 3440.64
      },
      {
        omschrijving: "als volledig bereik wanneer geen tilelevel bruikbaar is",
        tileLevels: ["onbruikbaar"],
        expectedMinResolution: 0.02625,
        expectedMaxResolution: 3440.64
      },
      {
        omschrijving: "als volledig bereik wanneer er geen tilelevels zijn",
        tileLevels: [],
        expectedMinResolution: 0.02625,
        expectedMaxResolution: 3440.64
      }
    ])(
      // Het hoogste tilelevel bepaalt de minResolution (één level hoger, zodat
      // de laag van...tot zichtbaar is), het laagste bepaalt de maxResolution.
      "leidt de resoluties af $omschrijving",
      async ({ tileLevels, expectedMinResolution, expectedMaxResolution }) => {
        coreMock.getLandingPageInfo.mockReturnValue(of(LANDING_PAGE));
        coreMock.getStyles.mockReturnValue(of([RD_STYLE]));
        coreMock.getTiles.mockReturnValue(
          of({
            title: "RD Tiles",
            tilesets: [createRDTileset(tileLevels)]
          } as OGCAPITile)
        );

        const capabilities = await firstValueFrom(
          service.getServiceCapabilitiesOgcApi(BASE_URL)
        );

        const layer = capabilities.layers[0];
        expect(parseFloat(layer.minResolution ?? "0")).toBeCloseTo(
          expectedMinResolution,
          6
        );
        expect(parseFloat(layer.maxResolution ?? "0")).toBeCloseTo(
          expectedMaxResolution,
          6
        );
      }
    );

    it('gebruikt fallback URL wanneer geen rel="item" link beschikbaar is', async () => {
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

      coreMock.getLandingPageInfo.mockReturnValue(of(landingPage));
      coreMock.getStyles.mockReturnValue(of([rdStyle]));
      coreMock.getTiles.mockReturnValue(of(tiles));

      const capabilities = await firstValueFrom(
        service.getServiceCapabilitiesOgcApi(BASE_URL)
      );

      expect(capabilities.layers.length).toBe(1);
      const layer = capabilities.layers[0];
      expect(layer.url).toBe(
        "https://tiles.example/tms/28992/{z}/{x}/{y}?f=mvt"
      );
    });

    it("levert lege layers als er geen RD tilesets zijn", async () => {
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

      coreMock.getLandingPageInfo.mockReturnValue(of(landingPage));
      coreMock.getStyles.mockReturnValue(of(styles));
      coreMock.getTiles.mockReturnValue(of(tiles));

      const capabilities = await firstValueFrom(
        service.getServiceCapabilitiesOgcApi(BASE_URL)
      );

      expect(capabilities.layers.length).toBe(0);
    });
  });
});
