import { fakeAsync, TestBed, tick } from "@angular/core/testing";
import { GgcSearchLocationService } from "./ggc-location.service";
import { GgcSearchLocationConnectService } from "./connect.service";
import { take } from "rxjs/operators";
import { Coordinate } from "ol/coordinate";

describe("GgcSearchLocationService", () => {
  let service: GgcSearchLocationService;
  let connectServiceSpy: jasmine.SpyObj<GgcSearchLocationConnectService>;
  let mapServiceMock: any;

  const mockCoords = {
    latitude: 52.0907,
    longitude: 5.1214
  };

  beforeEach(() => {
    mapServiceMock = jasmine.createSpyObj("GgcMapService", [
      "getMap",
      "getExtraLayer"
    ]);
    connectServiceSpy = jasmine.createSpyObj(
      "GgcSearchLocationConnectService",
      ["loadMapService", "getMapService"]
    );

    connectServiceSpy.loadMapService.and.returnValue(Promise.resolve());
    connectServiceSpy.getMapService.and.returnValue(mapServiceMock);

    TestBed.configureTestingModule({
      providers: [
        GgcSearchLocationService,
        {
          provide: GgcSearchLocationConnectService,
          useValue: connectServiceSpy
        }
      ]
    });

    service = TestBed.inject(GgcSearchLocationService);
  });

  it("moet correct geïnitialiseerd worden", () => {
    expect(service).toBeTruthy();
  });

  describe("getLocation", () => {
    beforeEach(() => {
      spyOn(navigator.geolocation, "getCurrentPosition").and.callFake(
        (success) => {
          success({
            coords: mockCoords,
            timestamp: Date.now()
          } as GeolocationPosition);
        }
      );

      spyOn(navigator.geolocation, "watchPosition").and.callFake((success) => {
        success({
          coords: mockCoords,
          timestamp: Date.now()
        } as GeolocationPosition);
        return 123;
      });

      spyOn(navigator.geolocation, "clearWatch").and.stub();
    });

    it("moet de huidige locatie ophalen (track: false)", fakeAsync(() => {
      const mapMock = {};
      const layerMock = jasmine.createSpyObj("VectorLayer", ["setStyle"]);
      mapServiceMock.getMap.and.returnValue(mapMock);
      mapServiceMock.getExtraLayer.and.returnValue(layerMock);

      let result: Coordinate | undefined;
      service
        .getLocationEventsObservable()
        .pipe(take(1))
        .subscribe((c) => (result = c));

      service.getLocation(false);
      tick();

      expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
      expect(result).toBeDefined();
      // Controleer of RD coördinaten kloppen na transformatie van Utrecht LonLat
      expect(result![0]).toBeGreaterThan(100000);
    }));

    it("moet tracking starten (track: true)", fakeAsync(() => {
      const mapMock = {};
      mapServiceMock.getMap.and.returnValue(mapMock);

      service.getLocation(true, "default");
      tick();

      expect(navigator.geolocation.watchPosition).toHaveBeenCalled();
      expect(service["geolocations"].has("default")).toBeTrue();
    }));

    it("moet een foutmelding sturen via de Subject bij een geolocatie fout", fakeAsync(() => {
      const errorMock = { code: 1, message: "User denied Geolocation" };
      (navigator.geolocation.getCurrentPosition as jasmine.Spy).and.callFake(
        (success, error) => {
          error(errorMock);
        }
      );

      mapServiceMock.getMap.and.returnValue({});

      let errorResult: any;
      service
        .getGeolocationPositionErrorSubject()
        .pipe(take(1))
        .subscribe((e) => (errorResult = e));

      service.getLocation(false);
      tick();

      expect(errorResult).toEqual(errorMock);
    }));
  });

  describe("stopTrackLocation", () => {
    it("moet de watch stoppen en de administratie opschonen", () => {
      const clearWatchSpy = spyOn(navigator.geolocation, "clearWatch");
      service["geolocations"].set("default", 123);

      service.stopTrackLocation("default");

      expect(clearWatchSpy).toHaveBeenCalledWith(123);
      expect(service["geolocations"].has("default")).toBeFalse();
    });
  });
});
