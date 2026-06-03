import { PiwikScriptLoaderService } from "./piwik-script-loader.service";
import { TestBed, waitForAsync } from "@angular/core/testing";

describe("PiwikScriptLoaderService", () => {
  let piwikScriptLoaderService: PiwikScriptLoaderService;
  let mockPiwikScriptElement: HTMLScriptElement;

  beforeEach(waitForAsync(() => TestBed.configureTestingModule({})));

  beforeEach(() => {
    mockPiwikScriptElement = document.createElement("script");
    mockPiwikScriptElement.id = "piwik-script";

    piwikScriptLoaderService = TestBed.inject(PiwikScriptLoaderService);

    vi.spyOn(document, "getElementById").mockReturnValue(
      mockPiwikScriptElement
    );
  });

  it("should be created", () => {
    expect(piwikScriptLoaderService).toBeTruthy();
  });

  it("should get the source of the correct piwik-script", () => {
    piwikScriptLoaderService.loadPiwikScript();

    expect(mockPiwikScriptElement.src).toContain(
      "/assets/piwik-script/piwik-script-test.js"
    );
  });
});
