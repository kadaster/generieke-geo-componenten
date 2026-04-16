import { TestBed } from "@angular/core/testing";
import { CoreSelectionService } from "./core-selection.service";
import { SelectionModeTypes } from "./selection-type.enum";
import { GgcSelectionService } from "./ggc-selection.service";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";

describe("SelectService", () => {
  let selectionService: GgcSelectionService;
  let coreSelectionServiceSpy: jasmine.SpyObj<CoreSelectionService>;

  beforeEach(() => {
    const selectionSpyObj = jasmine.createSpyObj("CoreSelectionService", [
      "setSelectionModeFormapIndex",
      "clearSelectionForMap",
      "getObservableForMap"
    ]);
    TestBed.configureTestingModule({
      providers: [
        GgcSelectionService,
        { provide: CoreSelectionService, useValue: selectionSpyObj }
      ]
    });
    selectionService = TestBed.inject(GgcSelectionService);
    coreSelectionServiceSpy = TestBed.inject(
      CoreSelectionService
    ) as jasmine.SpyObj<CoreSelectionService>;
  });

  it("should be created", () => {
    expect(selectionService).toBeTruthy();
  });

  it("when setSingleselectMode is called, it should make a call to the CoreSelectionService with parameter singleselect", () => {
    selectionService.setSingleselectMode();

    expect(
      coreSelectionServiceSpy.setSelectionModeFormapIndex
    ).toHaveBeenCalledWith(SelectionModeTypes.SINGLE_SELECT, DEFAULT_MAPINDEX);
  });

  it("when setMultiselectMode is called, it should make a call to the CoreSelectionService with parameter multiselect", () => {
    const mapIndex = "mapIndex";
    selectionService.setMultiselectMode(mapIndex);

    expect(
      coreSelectionServiceSpy.setSelectionModeFormapIndex
    ).toHaveBeenCalledWith(SelectionModeTypes.MULTI_SELECT, mapIndex);
  });

  it("when clearSelectionFormapIndex is called, it should make a call to the CoreSelectionService", () => {
    selectionService.clearSelection();

    expect(coreSelectionServiceSpy.clearSelectionForMap).toHaveBeenCalledWith(
      DEFAULT_MAPINDEX
    );
  });

  it("when getObservableFormapIndex is called, it should make a call to the CoreSelectionService", () => {
    selectionService.getObservable();

    expect(coreSelectionServiceSpy.getObservableForMap).toHaveBeenCalledWith(
      DEFAULT_MAPINDEX
    );
  });
});
