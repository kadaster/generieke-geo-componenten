import { PiwikScriptLoaderService } from "./piwik-script-loader.service";
import { TestBed } from "@angular/core/testing";
import { vi } from "vitest";

describe("PiwikScriptLoaderService", () => {
  let piwikScriptLoaderService: PiwikScriptLoaderService;
  let mockPiwikScriptElement: HTMLScriptElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PiwikScriptLoaderService]
    });
    mockPiwikScriptElement = document.createElement("script");
    mockPiwikScriptElement.id = "piwik-script";
    vi.spyOn(document, "getElementById").mockReturnValue(
      mockPiwikScriptElement
    );
    piwikScriptLoaderService = TestBed.inject(PiwikScriptLoaderService);
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
