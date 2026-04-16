import { TestBed } from "@angular/core/testing";

import { GgcSearchRdService } from "./ggc-search-rd.service";
import { AdditionalSuggestion } from "../model/additional-suggestion.model";

describe("SearchRdService", () => {
  let service: GgcSearchRdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GgcSearchRdService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("search invalid query", () => {
    service.search("test").subscribe((value) => {
      expect(value).toEqual([]);
    });
  });

  it("search invalid query", () => {
    service.search("test").subscribe((value) => {
      expect(value).toEqual([]);
    });
    service.search("123456").subscribe((value) => {
      expect(value).toEqual([]);
    });
  });

  it("zou verschillende formaten correct moeten normaliseren", () => {
    const testCases = [
      {
        input: "  194190    465880  ",
        expectedId: "194190, 465880"
      },
      {
        input: "194190,1, 465880,1",
        expectedId: "194190.1, 465880.1"
      },
      {
        input: "194190,1,465880,1",
        expectedId: "194190.1, 465880.1"
      },
      {
        input: "194190.123 465880.123",
        expectedId: "194190.123, 465880.123"
      }
    ];

    testCases.forEach((tc) => {
      service.search(tc.input).subscribe((value) => {
        expect(value.length).toBe(1);
        expect(value[0].id).toBe(tc.expectedId);
      });
    });
  });

  it("search query valid rd", () => {
    const searchQueries = {
      searchQuery: [
        "194190 465880",
        "194190, 465880",
        "194190,465880",
        "194190;465880",
        "194190; 465880"
      ],
      suggestionId: "194190, 465880",
      weergavenaam: "194190 465880"
    };
    const searchQueriesDecimal1 = {
      searchQuery: [
        "194190,1 465880,1",
        "194190,1, 465880,1",
        "194190,1,465880,1",
        "194190,1;465880,1",
        "194190,1; 465880,1",
        "194190,1 465880,1",
        "194190,1, 465880,1",
        "194190,1,465880,1",
        "194190,1;465880,1",
        "194190,1; 465880,1"
      ],
      suggestionId: "194190.1, 465880.1",
      weergavenaam: "194190.1 465880.1"
    };
    const searchQueriesDecimal2 = {
      searchQuery: [
        "194190.00 465880.00",
        "194190.00, 465880.00",
        "194190.00,465880.00",
        "194190.00;465880.00",
        "194190.00; 465880.00",
        "194190,00 465880,00",
        "194190,00, 465880,00",
        "194190,00,465880,00",
        "194190,00;465880,00",
        "194190,00; 465880,00"
      ],
      suggestionId: "194190.00, 465880.00",
      weergavenaam: "194190.00 465880.00"
    };
    const searchQueriesDecimal3 = {
      searchQuery: [
        "194190.123 465880.123",
        "194190.123, 465880.123",
        "194190.123,465880.123",
        "194190.123;465880.123",
        "194190.123; 465880.123",
        "194190,123 465880,123",
        "194190,123, 465880,123",
        "194190,123,465880,123",
        "194190,123;465880,123",
        "194190,123; 465880,123"
      ],
      suggestionId: "194190.123, 465880.123",
      weergavenaam: "194190.123 465880.123"
    };
    const searchQueriesExtra1 = {
      searchQuery: ["0 300000"],
      suggestionId: "0, 300000",
      weergavenaam: "0 300000"
    };
    const searchQueriesExtra2 = {
      searchQuery: ["299999 600000"],
      suggestionId: "299999, 600000",
      weergavenaam: "299999 600000"
    };

    [
      searchQueries,
      searchQueriesDecimal1,
      searchQueriesDecimal2,
      searchQueriesDecimal3,
      searchQueriesExtra1,
      searchQueriesExtra2
    ].forEach((group) =>
      group.searchQuery.forEach((searchQuery) => {
        const suggestion: AdditionalSuggestion = {
          id: group.suggestionId,
          display_name: `RD-coördinaten: ${group.weergavenaam}`,
          type: "rd",
          collection: "coordinate"
        };

        service.search(searchQuery).subscribe((value) => {
          expect(value).toEqual([suggestion]);
        });

        service.search("RD-coördinaten: " + searchQuery).subscribe((value) => {
          expect(value).toEqual([suggestion]);
        });
      })
    );
  });
});
