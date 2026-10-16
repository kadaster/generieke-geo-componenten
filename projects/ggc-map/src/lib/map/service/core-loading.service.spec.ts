import { TestBed } from "@angular/core/testing";
import { first } from "rxjs/operators";
import { CoreLoadingService } from "./core-loading.service";
import { provideZonelessChangeDetection } from "@angular/core";
import OlMap from "ol/Map";

describe("CoreLoadingServiceService", () => {
  let service: CoreLoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    service = TestBed.inject(CoreLoadingService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should switch to loading === true", async () => {
    service["loadStatesMap"].getOrCreateSubject("testMap").next(true);
    service
      .isLoading("testMap")
      .pipe(first())
      .subscribe((val) => {
        expect(val).toBeTruthy();
      });
  });

  it('should emit only 1 "true" event while loading', async () => {
    let calls = 0;
    service.isLoading("testMap").subscribe((loading) => {
      if (loading) {
        calls++;
      }
    });

    service["loadStatesMap"].getOrCreateSubject("testMap").next(true);
    service["loadStatesMap"].getOrCreateSubject("testMap").next(true);
    service["loadStatesMap"].getOrCreateSubject("testMap").next(true);
    service["loadStatesMap"].getOrCreateSubject("testMap").next(true);

    setTimeout(function () {
      expect(calls).toEqual(1);
    }, 2000);
  });

  it("should remove map listener references when map loaders are removed", () => {
    const map = new OlMap();

    service.addMapLoaders("testMap", map);
    expect(service["eventsMap"].has("testMap")).toBe(true);

    service.removeMapLoaders("testMap");

    expect(service["eventsMap"].has("testMap")).toBe(false);
  });

  afterEach(() => {
    service.destroyLoadersForMap("testMap");
  });
});
