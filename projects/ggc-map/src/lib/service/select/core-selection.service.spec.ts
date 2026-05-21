import { TestBed } from "@angular/core/testing";
import { CoreSelectionService } from "./core-selection.service";

describe("CoreSelectionService", () => {
  let coreSelectionService: CoreSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoreSelectionService]
    });
    coreSelectionService = TestBed.inject(CoreSelectionService);
  });

  it("should be created", () => {
    expect(coreSelectionService).toBeTruthy();
  });
});
