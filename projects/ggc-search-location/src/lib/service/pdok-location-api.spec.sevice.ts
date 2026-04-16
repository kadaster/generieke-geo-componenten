import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting
} from "@angular/common/http/testing";
import { PdokLocationApiService } from "./pdok-location-api.service";
import { of } from "rxjs";
import { PdokLocationApiCollectionModel } from "../model/pdok-location-api-collection.model";

describe("PdokLocationApiService", () => {
  let service: PdokLocationApiService;
  let httpMock: HttpTestingController;

  const mockPdokLocationApiResult = {
    collections: [
      {
        id: "address",
        title: "address",
        version: 1,
        displayTemplate: "address",
        links: []
      },
      {
        id: "woonplaats",
        title: "woonplaats",
        version: 1,
        displayTemplate: "woonplaats",
        links: []
      }
    ] as PdokLocationApiCollectionModel[],
    links: [],
    numberReturned: 2
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PdokLocationApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);

    // De service wordt geïnjecteerd, wat de constructor triggert (get collections call)
    service = TestBed.inject(PdokLocationApiService);

    // Handel de initiële call in de constructor af
    const req = httpMock.expectOne((r) => r.url.endsWith("collections?f=json"));
    req.flush(mockPdokLocationApiResult);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("moet de service correct initialiseren en default collecties instellen", () => {
    expect(service).toBeTruthy();
    const collections = service.getCollections();
    expect(collections).toEqual(mockPdokLocationApiResult);
  });

  describe("search", () => {
    it("moet de search API aanroepen met de juiste parameters", () => {
      const term = "utrecht";
      service.search(term).subscribe();

      const req = httpMock.expectOne((r) => r.url.includes(`search?q=${term}`));
      expect(req.request.method).toBe("GET");
      expect(req.request.url).toContain("limit=10");
      expect(req.request.url).toContain(
        "crs=http://www.opengis.net/def/crs/EPSG/0/28992"
      );
      req.flush({ response: { docs: [] } });
    });

    it("moet 3 keer opnieuw proberen bij een HTTP fout (retry logic)", fakeAsync(() => {
      const term = "fout";
      let errorOccurred = false;

      service.search(term).subscribe({
        error: () => (errorOccurred = true)
      });

      // 1e poging (initiële call)
      httpMock
        .expectOne((r) => r.url.includes("search?q=fout"))
        .error(new ProgressEvent("error"));

      // Poging 2 t/m 4 (de 3 retries met 500ms delay)
      for (let i = 0; i < 3; i++) {
        tick(500);
        httpMock
          .expectOne((r) => r.url.includes("search?q=fout"))
          .error(new ProgressEvent("error"));
      }

      expect(errorOccurred).toBeTrue();
    }));
  });

  describe("searchOnTermChange", () => {
    it("moet debouncen en alleen zoeken bij voldoende lengte", fakeAsync(() => {
      const searchTerms = ["u", "ut", "utr"];
      const terms$ = of(...searchTerms);

      service.searchOnTermChange(terms$).subscribe();

      // Wacht op de debounceTime van 400ms
      tick(400);

      // 'u' is te kort (minQueryLength = 2), 'ut' wordt overruled door 'utr' (debounce)
      const req = httpMock.expectOne((r) => r.url.includes("q=utr"));
      req.flush({ response: {} });
    }));
  });

  describe("item", () => {
    it("moet een item ophalen via de href eigenschap", () => {
      const mockFeature = {
        properties: { href: "https://api.pdok.nl/item/123" }
      };

      service.item(mockFeature as any).subscribe();

      const req = httpMock.expectOne("https://api.pdok.nl/item/123");
      expect(req.request.method).toBe("GET");
      req.flush({});
    });

    it("moet null teruggeven als de href ontbreekt", () => {
      service.item({} as any).subscribe((result) => {
        expect(result).toBeNull();
      });
      httpMock.expectNone(() => true);
    });
  });

  describe("configuratie", () => {
    it("moet de minimale query lengte correct bijwerken", fakeAsync(() => {
      service.setMinQueryLength(5);

      service.searchOnTermChange(of("abc")).subscribe();
      tick(400);

      // 'abc' heeft lengte 3, wat nu kleiner is dan de nieuwe minQueryLength van 5
      httpMock.expectNone((r) => r.url.includes("q=abc"));
    }));

    it("moet het aantal suggesties correct bijwerken", () => {
      service.setNumberOfSuggestions(25);
      service.search("test").subscribe();

      const req = httpMock.expectOne((r) => r.url.includes("limit=25"));
      req.flush({ response: {} });
    });
  });
});
