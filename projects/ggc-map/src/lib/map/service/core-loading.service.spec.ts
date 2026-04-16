import { TestBed } from "@angular/core/testing";
import { first } from "rxjs/operators";
import { CoreLoadingService } from "./core-loading.service";
import { provideZoneChangeDetection } from "@angular/core";

describe("CoreLoadingServiceService", () => {
  let service: CoreLoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZoneChangeDetection()]
    });
    service = TestBed.inject(CoreLoadingService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should switch to loading === true", (done) => {
    service["loadStatesMap"].getOrCreateSubject("testMap").next(true);
    service
      .isLoading("testMap")
      .pipe(first())
      .subscribe((val) => {
        expect(val).toBeTruthy();
        done();
      });
  });

  it('should emit only 1 "true" event while loading', (done) => {
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
      done();
    }, 2000);
  });

  afterEach(() => {
    service.destroyLoadersForMap("testMap");
  });
});
