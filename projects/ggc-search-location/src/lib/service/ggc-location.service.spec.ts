import type { Mock, MockedObject } from "vitest";
import { fakeAsync, TestBed, tick } from "@angular/core/testing";
import { GgcSearchLocationService } from "./ggc-location.service";
import { GgcSearchLocationConnectService } from "./connect.service";
import { take } from "rxjs/operators";

describe("GgcSearchLocationService", () => {
  let service: GgcSearchLocationService;
  let connectServiceSpy: MockedObject<GgcSearchLocationConnectService>;
  let mapServiceMock: any;

  const mockCoords = {
    latitude: 52.0907,
    longitude: 5.1214
  };

  beforeEach(() => {
    mapServiceMock = {
      getMap: vi.fn().mockName("GgcMapService.getMap"),
      getExtraLayer: vi.fn().mockName("GgcMapService.getExtraLayer")
    };
    connectServiceSpy = {
      loadMapService: vi
        .fn()
        .mockName("GgcSearchLocationConnectService.loadMapService"),
      getMapService: vi
        .fn()
        .mockName("GgcSearchLocationConnectService.getMapService")
    };

    connectServiceSpy.getMapService.mockReturnValue(mapServiceMock);

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
      vi.spyOn(navigator.geolocation, "getCurrentPosition").mockImplementation(
        (success) => {
          success({
            coords: mockCoords,
            timestamp: Date.now()
          } as GeolocationPosition);
        }
      );

      vi.spyOn(navigator.geolocation, "watchPosition").mockImplementation(
        (success) => {
          success({
            coords: mockCoords,
            timestamp: Date.now()
          } as GeolocationPosition);
          return 123;
        }
      );

      vi.spyOn(navigator.geolocation, "clearWatch").mockImplementation(() => {
        /* empty */
      });
    });

    it("moet de huidige locatie ophalen (track: false)", fakeAsync(() => {
      const mapMock = {};
      const layerMock = {
        setStyle: vi.fn().mockName("VectorLayer.setStyle")
      };
      mapServiceMock.getMap.mockReturnValue(mapMock);
      mapServiceMock.getExtraLayer.mockReturnValue(layerMock);

      let result: Array<number> | undefined;
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
      mapServiceMock.getMap.mockReturnValue(mapMock);

      service.getLocation(true, "default");
      tick();

      expect(navigator.geolocation.watchPosition).toHaveBeenCalled();
      expect(service["geolocations"].has("default")).toBe(true);
    }));

    it("moet een foutmelding sturen via de Subject bij een geolocatie fout", fakeAsync(() => {
      const errorMock = { code: 1, message: "User denied Geolocation" };
      (navigator.geolocation.getCurrentPosition as Mock).mockImplementation(
        (success, error) => {
          error(errorMock);
        }
      );

      mapServiceMock.getMap.mockReturnValue({});

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
      const clearWatchSpy = vi.spyOn(navigator.geolocation, "clearWatch");
      service["geolocations"].set("default", 123);

      service.stopTrackLocation("default");

      expect(clearWatchSpy).toHaveBeenCalledWith(123);
      expect(service["geolocations"].has("default")).toBe(false);
    });
  });
});
