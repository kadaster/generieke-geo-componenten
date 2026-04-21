import { TestBed } from "@angular/core/testing";
import { HttpTestingController } from "@angular/common/http/testing";
import { MapboxStyleService } from "./mapbox-style.service";
import {
  MapboxStyle,
  LayerType,
  Layer,
  StopsPattern,
  MatchPattern
} from "../model/legend-mapbox.model";

import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";

TestBed.configureTestingModule({
  providers: [
    provideHttpClient(), // Required for HttpClient itself
    provideHttpClientTesting() // Replaces HttpClientTestingModule
  ]
});

describe("MapboxStyleService", () => {
  let service: MapboxStyleService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MapboxStyleService
      ]
    });

    service = TestBed.inject(MapboxStyleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("getMapboxStyle", () => {
    it("should fetch mapbox style from URL", () => {
      const mockStyle = testStyle;

      service.getMapboxStyle("assets/mapbox/testStyle").subscribe((style) => {
        // @ts-ignore
        expect(style).toEqual(mockStyle);
      });

      const req = httpMock.expectOne("assets/mapbox/testStyle");
      expect(req.request.method).toBe("GET");
      req.flush(mockStyle);
    });
  });

  describe("getLayersids", () => {
    it("should return layer ids from style", () => {
      // @ts-ignore
      const style: MapboxStyle = testStyle;
      const ids = service.getLayersids(style);
      expect(ids).toEqual(["Onderlegger Nederland"]);
    });
  });

  describe("removeRasterLayers", () => {
    it("should remove raster layers from style", () => {
      // @ts-ignore
      const style: MapboxStyle = {
        version: 8,
        name: "Test Style",
        layers: [
          { id: "rasterLayer", type: LayerType.Raster } as Layer,
          { id: "fillLayer", type: LayerType.Fill } as Layer
        ],
        sources: {}
      };
      const result = service.removeRasterLayers(style);
      expect(result.layers.length).toBe(1);
      expect(result.layers[0].id).toBe("fillLayer");
    });
  });

  describe("isPatternWithStops", () => {
    it("should detect StopsPattern correctly", () => {
      const pattern = {
        stops: [[1, "#fff"]],
        property: "type"
      } as StopsPattern;

      expect(service.isPatternWithStops(pattern)).toBeTrue();
    });

    it("should return false for non-stops pattern", () => {
      expect(service.isPatternWithStops("string")).toBeFalse();
    });
  });

  describe("isPatternWithMatch", () => {
    it("should detect MatchPattern correctly", () => {
      const pattern = [
        "match",
        ["get", "type"],
        "A",
        "#fff",
        "B",
        "#000",
        "#ccc"
      ] as MatchPattern;
      expect(service.isPatternWithMatch(pattern)).toBeTrue();
    });

    it("should return false for invalid pattern", () => {
      expect(service.isPatternWithMatch("string")).toBeFalse();
    });
  });

  describe("getItems", () => {
    it("should return legend items with text labels", () => {
      // @ts-ignore
      const style: MapboxStyle = {
        version: 8,
        name: "",
        layers: [
          {
            id: "layer1",
            type: LayerType.Fill,
            layout: {
              "text-field": "{label}"
            },
            paint: {},
            filter: ["==", "type", "water"],
            "source-layer": "source1"
          } as Layer
        ],
        sources: {}
      };

      const items = service.getItems(style, true);

      expect(items.length).toBe(1);
      expect(items[0].title).toContain("source1");
      expect(items[0].properties["label"]).toBe("label".substring(0, 6));
    });

    it("should return legend items with fill-color stops", () => {
      // @ts-ignore
      const style: MapboxStyle = {
        version: 8,
        name: "",
        layers: [
          {
            id: "layer2",
            type: LayerType.Fill,
            layout: {},
            paint: {
              "fill-color": {
                stops: [
                  ["l1", "#fff"],
                  ["l2", "#000"]
                ],
                property: "type"
              }
            },
            filter: ["==", "type", "land"],
            "source-layer": "source2"
          } as Layer
        ],
        sources: {}
      };

      const items = service.getItems(style, false);
      expect(items.length).toBe(2);
      expect(items[0].title).toBe("l1");
      expect(items[1].title).toBe("l2");
      expect(items[0].properties["type"]).toBe("l1");
      expect(items[1].properties["type"]).toBe("l2");
    });

    it("should handle match pattern in fill-color", () => {
      // @ts-ignore
      const style: MapboxStyle = {
        version: 8,
        name: "",
        layers: [
          // @ts-ignore
          {
            id: "layer3",
            type: LayerType.Fill,
            layout: {},
            paint: {
              "fill-color": [
                "match",
                ["get", "type"],
                "A",
                "#fff",
                "B",
                "#000",
                "#ccc"
              ]
            },
            filter: ["==", "type", "land"],
            "source-layer": "source3"
          } as Layer
        ],
        sources: {}
      };

      const items = service.getItems(style, false);

      expect(items.length).toBeGreaterThan(0);
      expect(items.some((item) => item.title === "A")).toBeTrue();
      expect(items.some((item) => item.title === "B")).toBeTrue();
    });

    it("should skip invalid paint patterns", () => {
      // @ts-ignore
      const style: MapboxStyle = {
        version: 8,
        name: "",
        layers: [
          {
            id: "layer4",
            type: LayerType.Fill,
            layout: {},
            paint: {
              "fill-color": "invalid"
            },
            filter: ["==", "type", "unknown"],
            "source-layer": "source4"
          } as Layer
        ],
        sources: {}
      };

      const items = service.getItems(style, false);

      expect(items.length).toBe(0);
    });
  });

  const testStyle = {
    version: 8,
    metadata: {
      "ol:webfonts":
        "https://api.pdok.nl/kadaster/brt-achtergrondkaart/ogc/v1/resources/fonts/{font-family}/{fontweight}{-fontstyle}.css",
      "gokoala:title-items": "id"
    },
    name: "",
    sprite: "",
    id: "achtergrondkaart_standaard",
    pitch: 0,
    center: [5.3878, 52.1561],
    glyphs:
      "https://api.pdok.nl/kadaster/brt-achtergrondkaart/ogc/v1/resources/fonts/{fontstack}/{range}.pbf",
    layers: [
      {
        id: "Onderlegger Nederland",
        type: LayerType.Fill,
        paint: {
          "fill-color": [
            "match",
            ["get", "vistext"],
            "(zee)water",
            "#80BDE3",
            "transparent"
          ]
        },
        filter: [],
        filterCopy: [],
        source: "brt",
        "source-layer": "nederland"
      }
    ],
    sources: {
      brt: {
        type: "vector",
        tiles: [
          "https://api.pdok.nl/kadaster/brt-achtergrondkaart/ogc/v1/tiles/NetherlandsRDNewQuad/{z}/{y}/{x}?f=mvt"
        ],
        minzoom: 0,
        maxzoom: 12
      }
    }
  };
});
