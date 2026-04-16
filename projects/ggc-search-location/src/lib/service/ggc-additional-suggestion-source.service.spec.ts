import { TestBed } from "@angular/core/testing";
import { GgcAdditionalSuggestionSourceService } from "./ggc-additional-suggestion-source.service";
import { AdditionalSuggestion } from "../model/additional-suggestion.model";

describe("GgcAdditionalSuggestionSourceService", () => {
  let service: GgcAdditionalSuggestionSourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GgcAdditionalSuggestionSourceService]
    });
    service = TestBed.inject(GgcAdditionalSuggestionSourceService);
  });

  it("zou aangemaakt moeten worden", () => {
    expect(service).toBeTruthy();
  });

  it("zou een lege array moeten teruggeven bij het zoeken", (done: DoneFn) => {
    service
      .search("test query")
      .subscribe((suggestions: AdditionalSuggestion[]) => {
        expect(suggestions).toEqual([]);
        expect(suggestions.length).toBe(0);
        done();
      });
  });
});
