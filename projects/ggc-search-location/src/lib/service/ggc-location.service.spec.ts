import { Mock, MockedObject, vi } from "vitest";
import { TestBed } from "@angular/core/testing";
import { GgcSearchLocationService } from "./ggc-location.service";
import { GgcSearchLocationConnectService } from "./connect.service";
import { take } from "rxjs/operators";
import { Subject } from "rxjs";

describe("GgcSearchLocationService", () => {
  Object.defineProperty(globalThis.navigator, "geolocation", {
    value: {
      getCurrentPosition: vi.fn(),
      clearWatch: vi.fn(),
      watchPosition: vi.fn()
    },
    configurable: true
  });

  let service: GgcSearchLocationService;
  let connectServiceSpy: MockedObject<GgcSearchLocationConnectService>;
  let mapServiceMock: any;
  let mapDestroyedSubject: Subject<string>;

  const mockCoords = {
    latitude: 52.0907,
    longitude: 5.1214
  };

  beforeEach(() => {
    mapDestroyedSubject = new Subject<string>();
    mapServiceMock = {
      getMap: vi.fn().mockName("GgcMapService.getMap"),
      getExtraLayer: vi.fn().mockName("GgcMapService.getExtraLayer"),
      getMapDestroyedObservable: vi
        .fn()
        .mockReturnValue(mapDestroyedSubject.asObservable())
    };
    connectServiceSpy = {
      getMapService: vi
        .fn()
        .mockName("GgcSearchLocationConnectService.getMapService")
    } as MockedObject<GgcSearchLocationConnectService>;

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

    it("moet de huidige locatie ophalen (track: false)", async () => {
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

      await service.getLocation(false);

      expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
      expect(result).toBeDefined();
      // Controleer of RD coördinaten kloppen na transformatie van Utrecht LonLat
      expect(result![0]).toBeGreaterThan(100000);
    });

    it("moet tracking starten (track: true)", async () => {
      const mapMock = {};
      mapServiceMock.getMap.mockReturnValue(mapMock);

      await service.getLocation(true, "default");

      expect(navigator.geolocation.watchPosition).toHaveBeenCalled();
      expect(service["geolocations"].has("default")).toBe(true);
    });

    it("stopt de browser-watch when its map is destroyed", async () => {
      mapServiceMock.getMap.mockReturnValue({});
      const watchPositionSpy = vi.spyOn(navigator.geolocation, "watchPosition");
      watchPositionSpy.mockClear();
      const clearWatchSpy = vi.spyOn(navigator.geolocation, "clearWatch");

      await service.getLocation(true, "trackedMap");
      expect(service["geolocations"].has("trackedMap")).toBe(true);

      mapDestroyedSubject.next("otherMap");
      expect(service["geolocations"].has("trackedMap")).toBe(true);

      mapDestroyedSubject.next("trackedMap");

      expect(clearWatchSpy).toHaveBeenCalledWith(123);
      expect(service["geolocations"].has("trackedMap")).toBe(false);
      expect(service["subscriptions"].has("trackedMap")).toBe(false);

      await service.getLocation(true, "trackedMap");

      expect(watchPositionSpy).toHaveBeenCalledTimes(2);
      expect(service["geolocations"].has("trackedMap")).toBe(true);
    });

    it("moet een foutmelding sturen via de Subject bij een geolocatie fout", async () => {
      const errorMock = { code: 1, message: "User denied Geolocation" };
      (navigator.geolocation.getCurrentPosition as Mock).mockImplementation(
        (success, error) => {
          error(errorMock);
        }
      );

      mapServiceMock.getMap.mockReturnValue({});

      let errorResult: any;
      service
        .getGeolocationPositionErrorObservable()
        .pipe(take(1))
        .subscribe((e) => (errorResult = e));

      await service.getLocation(false);

      expect(errorResult).toEqual(errorMock);
    });
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
