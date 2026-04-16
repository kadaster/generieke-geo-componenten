import { TestBed } from "@angular/core/testing";
import {
  HttpTestingController,
  provideHttpClientTesting
} from "@angular/common/http/testing";
import { of } from "rxjs";
import {
  CoreOgcApiCapabilitiesService,
  OGCAPIStyle,
  OGCAPITile
} from "./core-ogc-api-capabilities.service";
import { provideHttpClient } from "@angular/common/http";
import { provideZoneChangeDetection } from "@angular/core";

describe("CoreOgcApiCapabilitiesService", () => {
  let service: CoreOgcApiCapabilitiesService;
  let httpMock: HttpTestingController;

  const baseUrlNoSlash = "https://example.test/ogcapi";
  const urlExpectedNoSlash = `${baseUrlNoSlash}/?f=json`;

  const landingResponse = (overrides?: Partial<any>) => ({
    title: "OGC API — Demo",
    description: "Een demo landing page",
    links: [
      {
        rel: "service-desc",
        href: "apiDefUrl"
      },
      {
        rel: "service-doc",
        href: "apiDocUrl"
      },
      {
        rel: "conformance",
        href: "conformanceUrl"
      },
      {
        rel: "http://www.opengis.net/def/rel/ogc/1.0/data",
        href: "https://example.test/collections?f=json"
      },
      {
        rel: "http://www.opengis.net/def/rel/ogc/1.0/tilesets-vector",
        href: "https://example.test/tilesets?f=json"
      },
      {
        rel: "http://www.opengis.net/def/rel/ogc/1.0/styles",
        href: "https://example.test/styles?f=json"
      }
    ],
    ...overrides
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        CoreOgcApiCapabilitiesService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZoneChangeDetection()
      ]
    });

    service = TestBed.inject(CoreOgcApiCapabilitiesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe("getLandingPageInfo", () => {
    it("gebruikt de cache van de landingPage", () => {
      const baseUrl = "http://baseUrl";
      const mockObservable = of({ title: "test", links: {} });
      (service as any).landingPagesMap.set(baseUrl, mockObservable);

      const result = service.getLandingPageInfo(baseUrl);
      expect(result).toEqual(mockObservable);
    });

    ["https://example.test/another", "https://example.test/another/"].forEach(
      (base) => {
        it(`triggered een HTTP‑call voor baseUrl ${base} en werkt de cache bij`, (done) => {
          const result = service.getLandingPageInfo(base);

          result.subscribe((info) => {
            expect(info.title).toBe("OGC API — Demo");
            expect(info.description).toBe("Een demo landing page");

            expect(info.links.apiDef?.href).toBe("apiDefUrl");
            expect(info.links.apiDoc?.href).toBe("apiDocUrl");
            expect(info.links.conformance?.href).toBe("conformanceUrl");
            expect(info.links.collections?.href).toBe(
              "https://example.test/collections?f=json"
            );
            expect(info.links.tilesetsVector?.href).toBe(
              "https://example.test/tilesets?f=json"
            );
            expect(info.links.styles?.href).toBe(
              "https://example.test/styles?f=json"
            );

            expect((service as any).landingPagesMap.get(base)).toEqual(result);
            done();
          });

          const req = httpMock.expectOne(
            "https://example.test/another/?f=json"
          );
          expect(req.request.method).toBe("GET");
          expect(req.request.headers.get("Accept")).toBe("application/json");
          req.flush(landingResponse());
        });
      }
    );

    it("gebruikt defaults als title/description ontbreken", (done) => {
      service.getLandingPageInfo(baseUrlNoSlash).subscribe((info) => {
        expect(info.title).toBe("(zonder titel)"); // default
        expect(info.description).toBe(""); // default
        done();
      });

      const req = httpMock.expectOne(urlExpectedNoSlash);
      expect(req.request.method).toBe("GET");

      req.flush(landingResponse({ title: undefined, description: undefined }));
    });

    it("zet link-properties op undefined wanneer links geen array is", (done) => {
      service.getLandingPageInfo(baseUrlNoSlash).subscribe((info) => {
        expect(info.links.apiDef).toBeUndefined();
        expect(info.links.apiDoc).toBeUndefined();
        expect(info.links.conformance).toBeUndefined();
        expect(info.links.collections).toBeUndefined();
        expect(info.links.tilesetsVector).toBeUndefined();
        expect(info.links.styles).toBeUndefined();
        done();
      });

      const req = httpMock.expectOne(urlExpectedNoSlash);
      expect(req.request.method).toBe("GET");
      req.flush(landingResponse({ links: undefined }));
    });
  });

  describe("getTiles", () => {
    it("zou een error terug moeten geven als href undefined is", (done) => {
      const baseUrl = "http://baseUrl";
      const mockObservable = of({
        title: "test",
        links: { tilesetsVector: { href: undefined, rel: "rel" } }
      });
      (service as any).landingPagesMap.set(baseUrl, mockObservable);

      service.getTiles(baseUrl).subscribe({
        next: (_) => {
          fail("Zou geen resultaat op moeten leveren");
        },
        error: (err: Error) => {
          expect(err.message).toEqual(
            "Tiles-link niet gevonden in landing page."
          );
          done();
        }
      });
    });

    it("zou gecached resultaat terug moeten geven", (done) => {
      const baseUrl = "http://baseUrl";
      const mockObservable = of({
        title: "test",
        links: { tilesetsVector: { href: "tilesUrl", rel: "rel" } }
      });
      (service as any).landingPagesMap.set(baseUrl, mockObservable);
      const ogcApiTile: OGCAPITile = {
        title: "tile",
        tilesets: []
      };
      const tilesMap = of(ogcApiTile);
      (service as any).tilesMap.set("tilesUrl", tilesMap);

      service.getTiles(baseUrl).subscribe({
        next: (tile) => {
          expect(tile).toEqual(ogcApiTile);
          done();
        }
      });
    });

    it("zou tiles resultaat moeten parsen en teruggeven", (done) => {
      const baseUrl = "http://baseUrl";
      const mockObservable = of({
        title: "test",
        links: { tilesetsVector: { href: "tilesUrl", rel: "rel" } }
      });
      (service as any).landingPagesMap.set(baseUrl, mockObservable);
      const response = {
        title: "title",
        description: "description",
        tilesets: []
      };

      service.getTiles(baseUrl).subscribe({
        next: (tile) => {
          expect(tile).toEqual(response);
          done();
        }
      });

      const req = httpMock.expectOne("tilesUrl");
      expect(req.request.method).toBe("GET");
      expect(req.request.headers.get("Accept")).toBe("application/json");

      req.flush(response);
    });

    it("zou foutmelding moeten geven bij een foutief resultaat", (done) => {
      const baseUrl = "http://baseUrl";
      const mockObservable = of({
        title: "test",
        links: { tilesetsVector: { href: "tilesUrl", rel: "rel" } }
      });
      (service as any).landingPagesMap.set(baseUrl, mockObservable);

      service.getTiles(baseUrl).subscribe({
        next: (_) => {
          fail("Zou juist een foutmelding moeten geven");
        },
        error: (error: Error) => {
          expect(error.message).toEqual(
            "Http failure response for tilesUrl: 500 Internal Server Error"
          );
          done();
        }
      });

      const req = httpMock.expectOne("tilesUrl");
      expect(req.request.method).toBe("GET");
      expect(req.request.headers.get("Accept")).toBe("application/json");
      req.flush(null, { status: 500, statusText: "Internal Server Error" });
    });
  });

  describe("getStyles", () => {
    it("zou een error terug moeten geven als href undefined is", (done) => {
      const baseUrl = "http://baseUrl";
      const mockObservable = of({
        title: "test",
        links: { styles: { href: undefined, rel: "rel" } }
      });
      (service as any).landingPagesMap.set(baseUrl, mockObservable);

      service.getStyles(baseUrl).subscribe({
        next: (_) => {
          fail("Zou geen resultaat op moeten leveren");
        },
        error: (err: Error) => {
          expect(err.message).toEqual(
            "Styles-link niet gevonden in landing page."
          );
          done();
        }
      });
    });

    it("zou gecached resultaat terug moeten geven", (done) => {
      const baseUrl = "http://baseUrl";
      const mockObservable = of({
        title: "test",
        links: { styles: { href: "stylesUrl", rel: "rel" } }
      });
      (service as any).landingPagesMap.set(baseUrl, mockObservable);
      const ogcApiStyles: OGCAPIStyle[] = [
        {
          id: "style"
        }
      ];
      const ogcApiStyles$ = of(ogcApiStyles);
      (service as any).stylesMap.set("stylesUrl", ogcApiStyles$);

      service.getStyles(baseUrl).subscribe({
        next: (styles) => {
          expect(styles).toEqual(ogcApiStyles);
          done();
        }
      });
    });

    it("zou styles resultaat moeten parsen en teruggeven", (done) => {
      const baseUrl = "http://baseUrl";
      const mockObservable = of({
        title: "test",
        links: { styles: { href: "stylesUrl", rel: "rel" } }
      });
      (service as any).landingPagesMap.set(baseUrl, mockObservable);
      const response = {
        styles: [
          {
            id: "12",
            title: "title",
            description: "description",
            links: [
              {
                href: "styleUrl1",
                rel: "rel"
              }
            ]
          }
        ]
      };

      service.getStyles(baseUrl).subscribe({
        next: (tile) => {
          expect(tile).toEqual(response.styles);
          done();
        }
      });

      const req = httpMock.expectOne("stylesUrl");
      expect(req.request.method).toBe("GET");
      expect(req.request.headers.get("Accept")).toBe("application/json");

      req.flush(response);
    });

    it("zou foutmelding moeten geven bij een foutief resultaat", (done) => {
      const baseUrl = "http://baseUrl";
      const mockObservable = of({
        title: "test",
        links: { styles: { href: "stylesUrl", rel: "rel" } }
      });
      (service as any).landingPagesMap.set(baseUrl, mockObservable);

      service.getStyles(baseUrl).subscribe({
        next: (_) => {
          fail("Zou juist een foutmelding moeten geven");
        },
        error: (error: Error) => {
          expect(error.message).toEqual(
            "Http failure response for stylesUrl: 500 Internal Server Error"
          );
          done();
        }
      });

      const req = httpMock.expectOne("stylesUrl");
      expect(req.request.method).toBe("GET");
      expect(req.request.headers.get("Accept")).toBe("application/json");
      req.flush(null, { status: 500, statusText: "Internal Server Error" });
    });
  });
});
