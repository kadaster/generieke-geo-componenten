import { TestBed } from "@angular/core/testing";
import { Color, ScreenSpaceEventType } from "@cesium/engine";
import { SelectionConfig, SelectionEvent } from "../model/interfaces";
import { CoreSelectionService } from "./core-selection.service";
import { GgcSelectionService } from "./ggc-selection.service";
import { Subject } from "rxjs";

describe("SelectionService", () => {
  let service: GgcSelectionService;
  let coreService: jasmine.SpyObj<CoreSelectionService>;
  let selection: SelectionConfig;
  let selections: SelectionConfig[];

  beforeEach(() => {
    const spy = jasmine.createSpyObj(
      "CoreSelectionService",
      [
        "initializeSelections",
        "addSelection",
        "clearSelection",
        "clearAllSelections",
        "destroySelection",
        "destroyAllSelections",
        "getClickEventsObservable"
      ],
      {
        currentSupportedEvents: [ScreenSpaceEventType.LEFT_DOWN],
        clickEvent: new Subject<SelectionEvent>()
      }
    );

    TestBed.configureTestingModule({
      providers: [
        GgcSelectionService,
        { provide: CoreSelectionService, useValue: spy }
      ]
    });
    service = TestBed.inject(GgcSelectionService);
    coreService = TestBed.inject(
      CoreSelectionService
    ) as jasmine.SpyObj<CoreSelectionService>;

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
    coreService.getClickEventsObservable.and.returnValue(observable);
    const selectionEventsObservable = service.getSelectionEventsObservable();
    expect(selectionEventsObservable).toEqual(observable);
  });
});
