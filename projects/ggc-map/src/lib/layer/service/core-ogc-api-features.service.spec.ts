import { TestBed } from "@angular/core/testing";
import {
  HttpTestingController,
  provideHttpClientTesting
} from "@angular/common/http/testing";
import { CoreOgcApiFeaturesService } from "./core-ogc-api-features.service";
import { Feature } from "ol";
import {
  provideHttpClient,
  withInterceptorsFromDi
} from "@angular/common/http";
import { provideZoneChangeDetection } from "@angular/core";

describe("CoreOgcApiFeaturesService", () => {
  let service: CoreOgcApiFeaturesService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        CoreOgcApiFeaturesService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        provideZoneChangeDetection()
      ]
    });

    service = TestBed.inject(CoreOgcApiFeaturesService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should fetch features from one page and stop when no next link", async () => {
    const url = "https://api.test/collections/items";
    const response = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [4, 52] },
          properties: { id: 1 }
        }
      ]
    };

    const promise = service.fetchAllOgcApiFeatures(url, 10, 100);

    const request = httpTestingController.expectOne(
      (r) => r.url.startsWith(url) && r.url.includes("limit=10")
    );
    request.flush(response);

    const result = await promise;
    expect(result.length).toBe(1);
    expect(result[0]).toBeInstanceOf(Feature);
  });

  it("should stop fetching when maxFeatures is reached", async () => {
    const url = "https://api.test/collections/items";
    const nextUrl = "https://api.test/collections/items?page=2";

    const firstResponse = {
      type: "FeatureCollection",
      features: new Array(10).fill(null).map((_, i) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [i, i] },
        properties: { id: i }
      })),
      links: [{ rel: "next", href: nextUrl }]
    };

    const secondResponse = {
      type: "FeatureCollection",
      features: new Array(10).fill(null).map((_, i) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [i + 10, i + 10] },
        properties: { id: i + 10 }
      }))
    };

    const promise = service.fetchAllOgcApiFeatures(url, 10, 16);

    const request1 = httpTestingController.expectOne(
      (r) => r.url.startsWith(url) && r.url.includes("limit=10")
    );
    request1.flush(firstResponse);

    // Wacht op volgende async stap
    await Promise.resolve();

    const request2 = httpTestingController.expectOne((r) =>
      r.url.startsWith(nextUrl)
    );
    request2.flush(secondResponse);

    const result = await promise;

    expect(result.length).toBe(16);
  });

  it("should stop when no next link is present", async () => {
    const url = "https://api.test/collections/items";
    const response = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [5, 52] },
          properties: { id: 42 }
        }
      ],
      links: [] // geen next
    };

    const promise = service.fetchAllOgcApiFeatures(url, 10, 100);
    const request = httpTestingController.expectOne(
      (r) => r.url.startsWith(url) && r.url.includes("limit=10")
    );
    request.flush(response);

    const result = await promise;
    expect(result.length).toBe(1);
    expect(result[0].getGeometry()).toBeTruthy();
  });

  it("should handle an empty response", async () => {
    const url = "https://api.test/collections/items";
    const response = null;

    const promise = service.fetchAllOgcApiFeatures(url, 10, 100);
    const request = httpTestingController.expectOne(
      (r) => r.url.startsWith(url) && r.url.includes("limit=10")
    );
    request.flush(response);

    const result = await promise;
    expect(result).toEqual([]);
  });

  it("should follow 'next' link until maxFeatures is reached", async () => {
    const url = "https://api.test/collections/items";
    const nextUrl = "https://api.test/collections/items?page=2";

    const firstResponse = {
      type: "FeatureCollection",
      features: new Array(10).fill(null).map((_, i) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [i, i] },
        properties: {}
      })),
      links: [{ rel: "next", href: nextUrl }]
    };

    const secondResponse = {
      type: "FeatureCollection",
      features: new Array(10).fill(null).map((_, i) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [i + 10, i + 10] },
        properties: {}
      }))
    };

    const promise = service.fetchAllOgcApiFeatures(url, 10, 11);

    const request1 = httpTestingController.expectOne(
      (r) => r.url.startsWith(url) && r.url.includes("limit=10")
    );
    request1.flush(firstResponse);

    await Promise.resolve();

    const request2 = httpTestingController.expectOne((r) =>
      r.url.startsWith(nextUrl)
    );
    request2.flush(secondResponse);

    const result = await promise;

    expect(result.length).toBe(11);
  });
});
