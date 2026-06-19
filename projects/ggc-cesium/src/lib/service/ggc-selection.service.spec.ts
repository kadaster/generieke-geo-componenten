import type { MockedObject } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Color, ScreenSpaceEventType } from "@cesium/engine";
import { SelectionConfig, SelectionEvent } from "../model/interfaces";
import { CoreSelectionService } from "./core-selection.service";
import { GgcSelectionService } from "./ggc-selection.service";
import { Subject } from "rxjs";
import { vi } from "vitest";
import { MapComponentEvent } from "@kadaster/ggc-models/src/lib/models/map-component-event.model";
describe("GgcSelectionService", () => {
  let service: GgcSelectionService;
  let coreService: MockedObject<CoreSelectionService>;
  let selection: SelectionConfig;
  let selections: SelectionConfig[];

  beforeEach(() => {
    const spy = {
      initializeSelections: vi
        .fn()
        .mockName("CoreSelectionService.initializeSelections"),
      addSelection: vi.fn().mockName("CoreSelectionService.addSelection"),
      clearSelection: vi.fn().mockName("CoreSelectionService.clearSelection"),
      clearAllSelections: vi
        .fn()
        .mockName("CoreSelectionService.clearAllSelections"),
      destroySelection: vi
        .fn()
        .mockName("CoreSelectionService.destroySelection"),
      destroyAllSelections: vi
        .fn()
        .mockName("CoreSelectionService.destroyAllSelections"),
      getClickEventsObservable: vi
        .fn()
        .mockName("CoreSelectionService.getClickEventsObservable"),
      getFeatureCollectionForCoordinateObservable: vi.fn(),
      currentSupportedEvents: [ScreenSpaceEventType.LEFT_DOWN],
      clickEvent: new Subject<SelectionEvent>()
    };

    TestBed.configureTestingModule({
      providers: [
        GgcSelectionService,
        { provide: CoreSelectionService, useValue: spy }
      ]
    });
    service = TestBed.inject(GgcSelectionService);
    coreService = TestBed.inject(
      CoreSelectionService
    ) as MockedObject<CoreSelectionService>;

    selection = {
      eventType: ScreenSpaceEventType.LEFT_CLICK,
      highlightColor: Color.BLACK
    };
    selections = [selection];
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should call updateSelections() on the CoreSelectionService", () => {
    service.initializeSelections(selections);
    expect(coreService.initializeSelections).toHaveBeenCalledWith(selections);
  });

  it("should call addSelection() on the CoreSelectionService", () => {
    service.addSelection(selection);
    expect(coreService.addSelection).toHaveBeenCalledWith(selection);
  });

  it("should call clearSelection() on the CoreSelectionService", () => {
    service.clearSelection(selection.eventType);
    expect(coreService.clearSelection).toHaveBeenCalledWith(
      selection.eventType
    );
  });

  it("should call clearSelections() on the CoreSelectionService", () => {
    service.clearAllSelections();
    expect(coreService.clearAllSelections).toHaveBeenCalled();
  });

  it("should call destroySelection() on the CoreSelectionService", () => {
    service.destroySelection(selection.eventType);
    expect(coreService.destroySelection).toHaveBeenCalledWith(
      selection.eventType
    );
  });

  it("should call destroySelections() on the CoreSelectionService", () => {
    service.destroyAllSelections();
    expect(coreService.destroyAllSelections).toHaveBeenCalled();
  });

  it("should return an Observable from the CoreSelectionService when getSelectionEventsObservable() is called", () => {
    const observable = new Subject<SelectionEvent>().asObservable();
    coreService.getClickEventsObservable.mockReturnValue(observable);
    const selectionEventsObservable = service.getSelectionEventsObservable();
    expect(selectionEventsObservable).toEqual(observable);
  });

  it("should return an Observable from the CoreSelectionService when getFeatureCollectionForCoordinateObservable() is called", () => {
    const observable = new Subject<MapComponentEvent>().asObservable();
    coreService.getFeatureCollectionForCoordinateObservable.mockReturnValue(
      observable
    );
    const selectionEventsObservable =
      service.getFeatureCollectionForCoordinateObservable();
    expect(selectionEventsObservable).toEqual(observable);
  });
});
