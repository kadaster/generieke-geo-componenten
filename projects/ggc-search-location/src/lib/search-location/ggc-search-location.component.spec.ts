import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
  tick
} from "@angular/core/testing";
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

  let pdokServiceSpy: jasmine.SpyObj<PdokLocationApiService>;
  let locationServiceSpy: jasmine.SpyObj<GgcSearchLocationService>;
  let connectServiceSpy: jasmine.SpyObj<GgcSearchLocationConnectService>;
  let mapServiceMock: any;

  const mockFeature = {
    id: "1",
    properties: { displayName: "Utrecht", href: "api/item/1" },
    geometry: { type: "Point", coordinates: [150000, 450000] }
  };

  beforeEach(async () => {
    pdokServiceSpy = jasmine.createSpyObj("PdokLocationApiService", [
      "setMinQueryLength",
      "setNumberOfSuggestions",
      "searchOnTermChange",
      "item"
    ]);
    locationServiceSpy = jasmine.createSpyObj("GgcSearchLocationService", [
      "getLocationEventsObservable",
      "getGeolocationPositionErrorSubject",
      "getLocation"
    ]);
    connectServiceSpy = jasmine.createSpyObj(
      "GgcSearchLocationConnectService",
      ["loadMapService", "getMapService"]
    );
    mapServiceMock = jasmine.createSpyObj("GgcMapService", [
      "zoomToGeometryWithZoomOptions",
      "markFeature",
      "zoomToExtent",
      "clearHighlightLayer"
    ]);

    pdokServiceSpy.searchOnTermChange.and.returnValue(of(null));
    connectServiceSpy.loadMapService.and.returnValue(Promise.resolve());
    connectServiceSpy.getMapService.and.returnValue(mapServiceMock);

    await TestBed.configureTestingModule({
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
        numberOfSuggestions: 15
      } as SearchLocationOptions;
      fixture.detectChanges();
      expect(pdokServiceSpy.setMinQueryLength).toHaveBeenCalledWith(4);
      expect(pdokServiceSpy.setNumberOfSuggestions).toHaveBeenCalledWith(15);
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
    it("moet de zoekterm wissen bij Escape", fakeAsync(() => {
      component["inputValue"] = "Utrecht";
      const event = new KeyboardEvent("keyup", { key: "Escape" });
      component.onInputUp(event);
      tick();
      expect(component["inputValue"]).toBe("");
    }));

    it("moet suggesties zoeken bij normale invoer", () => {
      const spy = spyOn(component["searchTerm$"], "next");
      const event = { target: { value: "Rotterdam" } } as any;
      component.onInputUp(event as KeyboardEvent);
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
      expect(component["showSuggestions"]).toBeTrue();
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
      expect(component["noSuggestionsFound"]).toBeTrue();
    });
  });

  describe("Kaart Interactie (Zoom & Mark)", () => {
    it("moet zoomToExtent aanroepen als een resultaat een bbox heeft", fakeAsync(() => {
      const featureWithBbox = { ...mockFeature, bbox: [1, 2, 3, 4] } as any;
      component.searchLocationOptions = {
        zoomToResult: true
      } as SearchLocationOptions;
      fixture.detectChanges();

      component["processZoomToResult"](featureWithBbox);
      tick();

      expect(mapServiceMock.zoomToExtent).toHaveBeenCalledWith(
        [1, 2, 3, 4],
        jasmine.any(Object)
      );
    }));

    it("moet de highlight layer wissen bij clearSearchTerm", fakeAsync(() => {
      component.searchLocationOptions = {
        markResult: true,
        mapIndex: "test-map"
      } as SearchLocationOptions;
      fixture.detectChanges();
      component.clearSearchTerm();
      flush();
      expect(connectServiceSpy.loadMapService).toHaveBeenCalled();
      expect(connectServiceSpy.getMapService).toHaveBeenCalled();
      expect(mapServiceMock.clearHighlightLayer).toHaveBeenCalledWith(
        "test-map"
      );
      expect(component["inputValue"]).toBe("");
    }));
  });

  describe("Foutafhandeling", () => {
    it("moet SEARCH_SUGGESTION_ERROR emitten bij een API fout", () => {
      spyOn(component.events, "emit");
      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: "Server Error"
      });

      component["processError"](
        errorResponse,
        SearchComponentEventTypes.SEARCH_SUGGESTION_ERROR
      );

      expect(component.events.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          type: SearchComponentEventTypes.SEARCH_SUGGESTION_ERROR,
          message: jasmine.stringMatching("500")
        })
      );
    });
  });

  describe("Huidige Locatie", () => {
    it("moet de locatie-indicator laden tonen tijdens het ophalen", () => {
      locationServiceSpy.getLocationEventsObservable.and.returnValue(
        new Subject()
      );
      locationServiceSpy.getGeolocationPositionErrorSubject.and.returnValue(
        new Subject()
      );

      component.processCurrentLocation();
      expect(component["loadCurrentLocation"]).toBeTrue();
    });
  });
});
