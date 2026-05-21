import { TestBed } from "@angular/core/testing";
import { Observable, of } from "rxjs";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";

import { GgcSelectionService } from "./ggc-selection.service";
import { CoreSelectionService } from "./core-selection.service";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";
import { MapComponentEvent } from "../../model/map-component-event.model";
import { SelectOptions } from "../../model/select-options";

describe("GgcSelectionService", () => {
  let service: GgcSelectionService;
  let coreSelectionServiceSpy: jasmine.SpyObj<CoreSelectionService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj<CoreSelectionService>(
      "CoreSelectionService",
      [
        "startSelect",
        "stopSelect",
        "clearSelection",
        "setSelection",
        "getCurrentSelection",
        "getObservableForMap"
      ]
    );

    TestBed.configureTestingModule({
      providers: [
        GgcSelectionService,
        { provide: CoreSelectionService, useValue: spy }
      ]
    });

    service = TestBed.inject(GgcSelectionService);
    coreSelectionServiceSpy = TestBed.inject(
      CoreSelectionService
    ) as jasmine.SpyObj<CoreSelectionService>;
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("setSingleselectMode (deprecated)", () => {
    it("should call startSelect with single select mode and default mapIndex", () => {
      service.setSingleselectMode();

      expect(coreSelectionServiceSpy.startSelect).toHaveBeenCalledWith(
        { selectMode: "single" },
        DEFAULT_MAPINDEX
      );
    });
  });

  describe("setMultiselectMode (deprecated)", () => {
    it("should call startSelect with multi select mode and default mapIndex", () => {
      service.setMultiselectMode();

      expect(coreSelectionServiceSpy.startSelect).toHaveBeenCalledWith(
        { selectMode: "multi" },
        DEFAULT_MAPINDEX
      );
    });
  });

  describe("startSelect", () => {
    it("should delegate startSelect to CoreSelectionService", () => {
      const options: SelectOptions = { selectMode: "single" };

      service.startSelect(options, "map-0");

      expect(coreSelectionServiceSpy.startSelect).toHaveBeenCalledWith(
        options,
        "map-0"
      );
    });
  });

  describe("stopSelect", () => {
    it("should call stopSelect with a custom mapIndex", () => {
      service.stopSelect("map-1");

      expect(coreSelectionServiceSpy.stopSelect).toHaveBeenCalledWith("map-1");
    });
  });

  describe("clearSelection", () => {
    it("should call clearSelection with a custom mapIndex", () => {
      service.clearSelection("map-2");

      expect(coreSelectionServiceSpy.clearSelection).toHaveBeenCalledWith(
        "map-2"
      );
    });
  });

  describe("setSelectionForLayer (deprecated)", () => {
    it("should delegate to setSelection with a custom mapIndex", () => {
      const features: Feature<Geometry>[] = [new Feature<Geometry>()];

      service.setSelectionForLayer(features, "test-layer", "map-3");

      expect(coreSelectionServiceSpy.setSelection).toHaveBeenCalledWith(
        features,
        "map-3"
      );
    });
  });

  describe("setSelection", () => {
    it("should call setSelection with a custom mapIndex", () => {
      const features: Feature<Geometry>[] = [new Feature<Geometry>()];

      service.setSelection(features, "map-4");

      expect(coreSelectionServiceSpy.setSelection).toHaveBeenCalledWith(
        features,
        "map-4"
      );
    });
  });

  describe("getCurrentSelection", () => {
    it("should return the current selection for a custom mapIndex", () => {
      const features: Feature<Geometry>[] = [new Feature<Geometry>()];
      coreSelectionServiceSpy.getCurrentSelection.and.returnValue(features);

      const result = service.getCurrentSelection("map-5");

      expect(result).toBe(features);
      expect(coreSelectionServiceSpy.getCurrentSelection).toHaveBeenCalledWith(
        "map-5"
      );
    });
  });

  describe("getObservable", () => {
    it("should return the observable for a custom mapIndex", () => {
      const observable$: Observable<MapComponentEvent> = of(
        {} as MapComponentEvent
      );
      coreSelectionServiceSpy.getObservableForMap.and.returnValue(observable$);

      const result = service.getObservable("map-6");

      expect(result).toBe(observable$);
      expect(coreSelectionServiceSpy.getObservableForMap).toHaveBeenCalledWith(
        "map-6"
      );
    });
  });
});
