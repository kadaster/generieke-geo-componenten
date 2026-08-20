import type { MockedObject } from "vitest";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { GgcSearchLocationComponent } from "./ggc-search-location.component";
import { PdokLocationApiService } from "../service/pdok-location-api.service";
import { GgcSearchLocationService } from "../service/ggc-location.service";
import { GgcSearchLocationConnectService } from "../service/connect.service";
import { of, Subject } from "rxjs";
import { SearchComponentEventTypes } from "../model/search-component-event.model";
import { HttpErrorResponse, provideHttpClient } from "@angular/common/http";
import { SearchLocationOptions } from "../model/search-location-options.model";
import { PdokLocationApiSearchResponse } from "../model/pdok-location-api-collection.model";
import { provideHttpClientTesting } from "@angular/common/http/testing";

describe("GgcSearchLocationComponent", () => {
  let component: GgcSearchLocationComponent;
  let fixture: ComponentFixture<GgcSearchLocationComponent>;

  let pdokServiceSpy: MockedObject<PdokLocationApiService>;
  let locationServiceSpy: MockedObject<GgcSearchLocationService>;
  let connectServiceSpy: MockedObject<GgcSearchLocationConnectService>;
  let mapServiceMock: any;

  const mockFeature = {
    id: "1",
    properties: { displayName: "Utrecht", href: "api/item/1" },
    geometry: { type: "Point", coordinates: [150000, 450000] }
  };

  beforeEach(() => {
    pdokServiceSpy = {
      setMinQueryLength: vi
        .fn()
        .mockName("PdokLocationApiService.setMinQueryLength"),
      setNumberOfSuggestions: vi
        .fn()
        .mockName("PdokLocationApiService.setNumberOfSuggestions"),
      searchOnTermChange: vi
        .fn()
        .mockName("PdokLocationApiService.searchOnTermChange"),
      item: vi.fn().mockName("PdokLocationApiService.item")
    } as MockedObject<PdokLocationApiService>;
    locationServiceSpy = {
      getLocationEventsObservable: vi
        .fn()
        .mockName("GgcSearchLocationService.getLocationEventsObservable"),
      getGeolocationPositionErrorSubject: vi
        .fn()
        .mockName(
          "GgcSearchLocationService.getGeolocationPositionErrorSubject"
        ),
      getLocation: vi.fn().mockName("GgcSearchLocationService.getLocation")
    } as MockedObject<GgcSearchLocationService>;
    connectServiceSpy = {
      getMapService: vi
        .fn()
        .mockName("GgcSearchLocationConnectService.getMapService")
    } as MockedObject<GgcSearchLocationConnectService>;
    mapServiceMock = {
      zoomToGeometryWithZoomOptions: vi
        .fn()
        .mockName("GgcMapService.zoomToGeometryWithZoomOptions"),
      markFeature: vi.fn().mockName("GgcMapService.markFeature"),
      zoomToExtent: vi.fn().mockName("GgcMapService.zoomToExtent"),
      clearHighlightLayer: vi.fn().mockName("GgcMapService.clearHighlightLayer")
    };

    pdokServiceSpy.searchOnTermChange.mockReturnValue(of(null));
    connectServiceSpy.getMapService.mockReturnValue(mapServiceMock);

    TestBed.configureTestingModule({
      imports: [GgcSearchLocationComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
      .overrideComponent(GgcSearchLocationComponent, {
        set: {
          providers: [
            { provide: PdokLocationApiService, useValue: pdokServiceSpy },
            { provide: GgcSearchLocationService, useValue: locationServiceSpy },
            {
              provide: GgcSearchLocationConnectService,
              useValue: connectServiceSpy
            }
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(GgcSearchLocationComponent);
    component = fixture.componentInstance;
  });

  describe("Initialisatie", () => {
    it("moet de pdok service configureren op basis van searchLocationOptions", () => {
      component.searchLocationOptions = {
        minQueryLength: 4,
        numberOfSuggestions: 15,
        customCollections: [{ id: "a", version: 1, relevance: 1 }]
      } as SearchLocationOptions;
      fixture.detectChanges();
      expect(pdokServiceSpy.setMinQueryLength).toHaveBeenCalledWith(4);
      expect(pdokServiceSpy.setNumberOfSuggestions).toHaveBeenCalledWith(15);
      expect(pdokServiceSpy.setCustomCollections).toHaveBeenCalledWith([
        { id: "a", version: 1, relevance: 1 }
      ]);
    });

    it("moet een initiële zoekterm verwerken", () => {
      component.searchLocationOptions = {
        initialSearchTerm: "Amsterdam"
      } as SearchLocationOptions;
      fixture.detectChanges();
      expect(component["inputValue"]).toBe("Amsterdam");
    });
  });

  describe("Toetsenbord en Input", () => {
    beforeEach(() => {
      (component as any).input = {
        nativeElement: document.createElement("input")
      };
    });
    it("moet de zoekterm wissen bij Escape", async () => {
      component["inputValue"] = "Utrecht";
      const event = new KeyboardEvent("keyup", { key: "Escape" });
      component.onInputUp(event);
      await Promise.resolve();
      expect(component["inputValue"]).toBe("");
    });

    it("moet suggesties zoeken bij normale invoer", async () => {
      const spy = vi.spyOn(component["searchTerm$"], "next");
      const event = { target: { value: "Rotterdam" } } as any;
      component.onInputUp(event as KeyboardEvent);

      await Promise.resolve();

      expect(spy).toHaveBeenCalledWith("Rotterdam");
    });
  });

  describe("Suggesties verwerken", () => {
    it("moet showSuggestions op true zetten als er resultaten zijn", () => {
      const mockResponse = {
        numberReturned: 1,
        features: [mockFeature as any],
        links: [],
        timestamp: Date.now().toString(),
        type: "FeatureCollection"
      } as PdokLocationApiSearchResponse;
      component.processSuggestionsResult(mockResponse);
      expect(component["showSuggestions"]).toBe(true);
      expect(component["suggestions"].length).toBe(1);
    });

    it("moet noSuggestionsFound op true zetten als er 0 resultaten zijn", () => {
      const mockResponse = {
        numberReturned: 0,
        features: [],
        links: [],
        timestamp: Date.now().toString(),
        type: "FeatureCollection"
      };
      component.processSuggestionsResult(mockResponse);
      expect(component["noSuggestionsFound"]).toBe(true);
    });
  });

  describe("Kaart Interactie (Zoom & Mark)", () => {
    it("moet zoomToExtent aanroepen als een resultaat een bbox heeft", async () => {
      const featureWithBbox = { ...mockFeature, bbox: [1, 2, 3, 4] } as any;
      component.searchLocationOptions = {
        zoomToResult: true
      } as SearchLocationOptions;
      fixture.detectChanges();

      component["loadFormatType"] = vi.fn().mockResolvedValue({
        GEOJSON: "GEOJSON"
      });

      await component["processZoomToResult"](featureWithBbox);

      expect(mapServiceMock.zoomToExtent).toHaveBeenCalledWith(
        [1, 2, 3, 4],
        expect.any(Object)
      );
    });

    it("moet de highlight layer wissen bij clearSearchTerm", async () => {
      component.searchLocationOptions = {
        markResult: true,
        mapIndex: "test-map"
      } as SearchLocationOptions;
      fixture.detectChanges();
      component.clearSearchTerm();
      await Promise.resolve();
      expect(connectServiceSpy.getMapService).toHaveBeenCalled();
      expect(mapServiceMock.clearHighlightLayer).toHaveBeenCalledWith(
        "test-map"
      );
      expect(component["inputValue"]).toBe("");
    });
  });

  describe("Foutafhandeling", () => {
    it("moet SEARCH_SUGGESTION_ERROR emitten bij een API fout", () => {
      vi.spyOn(component.events, "emit");
      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: "Server Error"
      });

      component["processError"](
        errorResponse,
        SearchComponentEventTypes.SEARCH_SUGGESTION_ERROR
      );

      expect(component.events.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: SearchComponentEventTypes.SEARCH_SUGGESTION_ERROR,
          message: expect.stringMatching("500")
        })
      );
    });
  });

  describe("Huidige Locatie", () => {
    it("moet de locatie-indicator laden tonen tijdens het ophalen", () => {
      locationServiceSpy.getLocationEventsObservable.mockReturnValue(
        new Subject()
      );
      locationServiceSpy.getGeolocationPositionErrorSubject.mockReturnValue(
        new Subject()
      );

      component.processCurrentLocation();
      expect(component["loadCurrentLocation"]).toBe(true);
    });
  });
});
