import { TestBed } from "@angular/core/testing";
import MapBrowserEvent from "ol/MapBrowserEvent";
import MapEvent from "ol/MapEvent";
import { CoreMapEventsService } from "./core-map-events.service";
import { provideZoneChangeDetection } from "@angular/core";

describe("MapEventsService", () => {
  let service: CoreMapEventsService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoreMapEventsService, provideZoneChangeDetection()]
    });

    service = TestBed.inject(CoreMapEventsService);
  });

  describe("Singleclick", () => {
    it("getSingleclickObservableForMap should create subject and observable if not existing", () => {
      const mapIndex = "singleclick-map";

      // size of subject and observable map should be 0
      expect(service["singleclickMap"].size).toEqual(0);

      const observable = service.getSingleclickObservableForMap(mapIndex);

      // subject and observable should be created
      expect(observable).toBeDefined();
      expect(service["singleclickMap"].size).toBe(1);
      expect(service["singleclickMap"].get(mapIndex)).toBeDefined();
    });

    it("emitSingleclickEventForMap should create subject and observable and call next", () => {
      const mapIndex = "singleclick-map";

      // size of subject and observable map should be 0
      expect(service["singleclickMap"].size).toEqual(0);

      service.emitSingleclickEventForMap({} as MapBrowserEvent, mapIndex);

      // subject and observable should be created
      expect(service["singleclickMap"].size).toBe(1);
      expect(service["singleclickMap"].get(mapIndex)).toBeDefined();
    });

    it("emitSingleclickEventForMap should emit event", (done) => {
      const mapIndex = "mapIndex";

      service.getSingleclickObservableForMap(mapIndex).subscribe((evt) => {
        expect(evt.type).toEqual("singleclickTest");
        done();
      });

      service.emitSingleclickEventForMap(
        { type: "singleclickTest" } as MapBrowserEvent,
        mapIndex
      );

      expect(service["singleclickMap"].get(mapIndex)).toBeDefined();
    });

    it("destroySingleclickForMap should destroy subject and observable", () => {
      const mapIndex = "mapGgc";

      // create subject and observable for mapIndex
      service.getSingleclickObservableForMap(mapIndex);

      expect(service["singleclickMap"].get(mapIndex)).toBeDefined();

      service.destroySingleclickForMap(mapIndex);

      expect(service["singleclickMap"].size).toBe(0);
    });
  });

  describe("Zoomend", () => {
    it("getZoomendObservableForMap should create subject and observable if not existing", () => {
      const mapIndex = "zoomend-map";

      // size of subject and observable map should be 0
      expect(service["zoomendMap"].size).toEqual(0);

      const observable = service.getZoomendObservableForMap(mapIndex);

      // subject and observable should be created
      expect(observable).toBeDefined();
      expect(service["zoomendMap"].size).toBe(1);
      expect(service["zoomendMap"].get(mapIndex)).toBeDefined();
    });

    it("emitZoomendEventForMap should create subject and observable and call next", () => {
      const mapIndex = "zoomend-map";

      // size of subject and observable map should be 0
      expect(service["zoomendMap"].size).toEqual(0);

      service.emitZoomendEventForMap({} as MapEvent, mapIndex);

      // subject and observable should be created
      expect(service["zoomendMap"].size).toBe(1);
      expect(service["zoomendMap"].get(mapIndex)).toBeDefined();
    });

    it("emitZoomendEventForMap should emit event", (done) => {
      const mapIndex = "mapIndex";

      service.getZoomendObservableForMap(mapIndex).subscribe((evt) => {
        expect(evt.type).toEqual("zoomEndTest");
        done();
      });

      service.emitZoomendEventForMap(
        { type: "zoomEndTest" } as MapEvent,
        mapIndex
      );

      expect(service["zoomendMap"].get(mapIndex)).toBeDefined();
    });

    it("destroyZoomendForMap should destroy subject and observable", () => {
      const mapIndex = "mapGgc";

      // create subject and observable for mapIndex
      service.getZoomendObservableForMap(mapIndex);

      expect(service["zoomendMap"].get(mapIndex)).toBeDefined();

      service.destroyZoomendForMap(mapIndex);

      expect(service["zoomendMap"].size).toBe(0);
    });
  });
});
