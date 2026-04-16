import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting
} from "@angular/common/http/testing";
import { PdokLocationApiService } from "./pdok-location-api.service";
import { of } from "rxjs";
import {
  PdokLocationApiCollectionModel,
  SearchCollection
} from "../model/pdok-location-api-collection.model";
import { GgcAdditionalSuggestionSourceService } from "./ggc-additional-suggestion-source.service";

describe("PdokLocationApiService", () => {
  let service: PdokLocationApiService;
  let httpMock: HttpTestingController;
  let additionalSourceSpy: jasmine.SpyObj<GgcAdditionalSuggestionSourceService>;

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
    const spy = jasmine.createSpyObj("GgcAdditionalSuggestionSourceService", [
      "search"
    ]);
    spy.search.and.returnValue(of([]));

    TestBed.configureTestingModule({
      providers: [
        PdokLocationApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: GgcAdditionalSuggestionSourceService, useValue: spy }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    additionalSourceSpy = TestBed.inject(
      GgcAdditionalSuggestionSourceService
    ) as jasmine.SpyObj<GgcAdditionalSuggestionSourceService>;
    service = TestBed.inject(PdokLocationApiService);

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
      req.flush({
        features: [],
        numberReturned: 0,
        type: "FeatureCollection"
      });
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

    it("moet extra suggesties van de GgcAdditionalSuggestionSourceService toevoegen", (done) => {
      const term = "test";
      const mockAltSuggestions = [
        {
          id: "alt-1",
          type: "custom",
          display_name: "Extra Locatie",
          collection: "custom"
        }
      ];
      additionalSourceSpy.search.and.returnValue(of(mockAltSuggestions as any));

      service.search(term).subscribe((response) => {
        expect(response.features.length).toBe(1);
        expect(response.features[0].properties.display_name).toBe(
          "Extra Locatie"
        );
        expect(response.numberReturned).toBe(1);
        done();
      });

      const req = httpMock.expectOne((r) => r.url.includes("search?q=test"));
      req.flush({ features: [], numberReturned: 0 });
    });

    it("moet extra suggesties vooraan plaatsen als alternativeSuggestionsFirst true is", (done) => {
      const term = "test";
      additionalSourceSpy.search.and.returnValue(
        of([{ id: "alt", display_name: "Alt" }] as any)
      );

      service.search(term, true).subscribe((response) => {
        expect(response.features[0].id).toBe("alt");
        expect(response.features[1].id).toBe("pdok-1");
        done();
      });

      const req = httpMock.expectOne((r) => r.url.includes("search?q=test"));
      req.flush({
        features: [{ id: "pdok-1", properties: {} }],
        numberReturned: 1
      });
    });

    it("moet correcte URL parameters bouwen voor de gebruikte collecties", () => {
      service.search("test").subscribe();
      const req = httpMock.expectOne((r) =>
        r.url.includes("address[version]=1")
      );
      expect(req.request.url).toContain("address[relevance]=0.5");
      req.flush({ features: [] });
    });
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

    it("moet aangepaste collecties kunnen instellen", () => {
      const custom: SearchCollection[] = [
        { id: "perc", version: 2, relevance: 0.8 }
      ];
      service.setCustomCollections(custom);

      service.search("test").subscribe();
      const req = httpMock.expectOne((r) => r.url.includes("perc[version]=2"));
      expect(req.request.url).toContain("perc[relevance]=0.8");
      req.flush({ features: [] });
    });

    it("moet ongeldige collecties negeren bij setCustomCollections", () => {
      const invalid = [{ id: "test" }] as any;
      service.setCustomCollections(invalid);
      service.search("test").subscribe();
      httpMock
        .expectOne((r) => r.url.includes("address[version]=1"))
        .flush({ features: [] });
    });
  });
});
