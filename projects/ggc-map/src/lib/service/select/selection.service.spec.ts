import type { MockedObject } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Observable, of } from "rxjs";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";

import { GgcSelectionService } from "./ggc-selection.service";
import { CoreSelectionService } from "./core-selection.service";
import { DEFAULT_MAPINDEX, MapComponentEvent } from "@kadaster/ggc-models";
import { SelectOptions } from "../../model/select-options";

describe("GgcSelectionService", () => {
  let selectionService: GgcSelectionService;
  let coreSelectionServiceSpy: MockedObject<CoreSelectionService>;

  beforeEach(() => {
    const selectionSpyObj = {
      setSelectionModeFormapIndex: vi
        .fn()
        .mockName("CoreSelectionService.setSelectionModeFormapIndex"),
      clearSelectionForMap: vi
        .fn()
        .mockName("CoreSelectionService.clearSelectionForMap"),
      getObservableForMap: vi
        .fn()
        .mockName("CoreSelectionService.getObservableForMap"),
      clearSelection: vi.fn().mockName("CoreSelectionService.clearSelection"),
      startSelect: vi.fn().mockName("CoreSelectionService.startSelect"),
      setSelection: vi.fn().mockName("CoreSelectionService.setSelection"),
      stopSelect: vi.fn().mockName("CoreSelectionService.stopSelect"),
      getCurrentSelection: vi
        .fn()
        .mockName("CoreSelectionService.getCurrentSelection")
    };
    TestBed.configureTestingModule({
      providers: [
        GgcSelectionService,
        { provide: CoreSelectionService, useValue: selectionSpyObj }
      ]
    });
    selectionService = TestBed.inject(GgcSelectionService);
    coreSelectionServiceSpy = TestBed.inject(
      CoreSelectionService
    ) as MockedObject<CoreSelectionService>;
  });

  it("should be created", () => {
    expect(selectionService).toBeTruthy();
  });

  describe("setSingleselectMode (deprecated)", () => {
    it("should call startSelect with single select mode and default mapIndex", () => {
      selectionService.setSingleselectMode();

      expect(coreSelectionServiceSpy.startSelect).toHaveBeenCalledWith(
        { selectMode: "single" },
        DEFAULT_MAPINDEX,
        undefined
      );
    });
  });

  describe("setMultiselectMode (deprecated)", () => {
    it("should call startSelect with multi select mode and default mapIndex", () => {
      selectionService.setMultiselectMode();

      expect(coreSelectionServiceSpy.startSelect).toHaveBeenCalledWith(
        { selectMode: "multi" },
        DEFAULT_MAPINDEX,
        undefined
      );
    });
  });

  describe("startSelect", () => {
    it("should delegate startSelect to CoreSelectionService", () => {
      const options: SelectOptions = { selectMode: "single" };

      selectionService.startSelect(options, "map-0", "select-0");

      expect(coreSelectionServiceSpy.startSelect).toHaveBeenCalledWith(
        options,
        "map-0",
        "select-0"
      );
    });
  });

  describe("stopSelect", () => {
    it("should call stopSelect with a custom mapIndex", () => {
      selectionService.stopSelect("map-1");

      expect(coreSelectionServiceSpy.stopSelect).toHaveBeenCalledWith("map-1");
    });
  });

  describe("clearSelection", () => {
    it("should call clearSelection with a custom mapIndex", () => {
      selectionService.clearSelection("map-2");

      expect(coreSelectionServiceSpy.clearSelection).toHaveBeenCalledWith(
        "map-2",
        undefined
      );
    });
  });

  describe("setSelectionForLayer (deprecated)", () => {
    it("should delegate to setSelection with a custom mapIndex", () => {
      const features: Feature<Geometry>[] = [new Feature<Geometry>()];

      selectionService.setSelectionForLayer(features, "test-layer", "map-3");

      expect(coreSelectionServiceSpy.setSelection).toHaveBeenCalledWith(
        features,
        "map-3",
        ""
      );
    });
  });

  describe("setSelection", () => {
    it("should call setSelection with a custom mapIndex", () => {
      const features: Feature<Geometry>[] = [new Feature<Geometry>()];

      selectionService.setSelection(features, "map-4");

      expect(coreSelectionServiceSpy.setSelection).toHaveBeenCalledWith(
        features,
        "map-4",
        ""
      );
    });
  });

  describe("getCurrentSelection", () => {
    it("should return the current selection for a custom mapIndex", () => {
      const features: Feature<Geometry>[] = [new Feature<Geometry>()];
      coreSelectionServiceSpy.getCurrentSelection.mockReturnValue(features);

      const result = selectionService.getCurrentSelection("map-5");

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
      coreSelectionServiceSpy.getObservableForMap.mockReturnValue(observable$);

      const result = selectionService.getObservable("map-6");

      expect(result).toBe(observable$);
      expect(coreSelectionServiceSpy.getObservableForMap).toHaveBeenCalledWith(
        "map-6",
        undefined
      );
    });
  });
});
