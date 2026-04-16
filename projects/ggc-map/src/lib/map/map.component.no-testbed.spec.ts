import OlMap from "ol/Map";
import MapEvent from "ol/MapEvent";
import { ObjectEvent } from "ol/Object";
import View from "ol/View";
import { CoreDrawService } from "../drawing/service/core-draw.service";
import {
  MapComponentEvent,
  MapComponentEventTypes,
  MapViewState
} from "../model/map-component-event.model";
import { CoreSelectionService } from "../service/select/core-selection.service";

import { GgcMapComponent } from "./ggc-map.component";
import { CoreLoadingService } from "./service/core-loading.service";
import { CoreMapEventsService } from "./service/core-map-events.service";
import { CoreMapService } from "./service/core-map.service";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import createSpyObj = jasmine.createSpyObj;
import { provideZoneChangeDetection } from "@angular/core";
import { of } from "rxjs";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";

describe("MapComponent(no-testbed), processEvent", () => {
  let mapComponent: GgcMapComponent;
  let fixture: ComponentFixture<GgcMapComponent>;
  let coreMapServiceSpy: jasmine.SpyObj<CoreMapService>;
  let coreDrawServiceSpy: jasmine.SpyObj<CoreDrawService>;
  let coreLoadingServiceService: jasmine.SpyObj<CoreLoadingService>;
  let mapEventsServiceSpy: jasmine.SpyObj<CoreMapEventsService>;
  let coreSelectionServiceSpy: jasmine.SpyObj<CoreSelectionService>;

  const mapEventOne: ObjectEvent = {
    type: "change:resolution",
    map: {} as OlMap
  } as unknown as ObjectEvent;

  const mapEventTwo: ObjectEvent = {
    type: "change:resolution",
    map: {} as OlMap
  } as unknown as ObjectEvent;

  beforeEach(() => {
    coreMapServiceSpy = createSpyObj("CoreMapService", [
      "getMap",
      "getLayerChangedObservable"
    ]);
    coreMapServiceSpy.getLayerChangedObservable.and.returnValue(of());
    coreDrawServiceSpy = createSpyObj("CoreDrawService", ["addFeatureToLayer"]);
    coreLoadingServiceService = createSpyObj("CoreLoadingService", [
      "addMapLoaders"
    ]);
    mapEventsServiceSpy = createSpyObj("MapEventsService", [
      "emitSingleclickEventForMap",
      "emitZoomendEventForMap"
    ]);
    coreSelectionServiceSpy = createSpyObj("CoreSelectionService", [
      "handleSingleclickEventForMap"
    ]);
    TestBed.configureTestingModule({
      providers: [
        { provide: CoreMapService, useValue: coreMapServiceSpy },
        { provide: CoreDrawService, useValue: coreDrawServiceSpy },
        { provide: CoreLoadingService, useValue: coreLoadingServiceService },
        { provide: CoreMapEventsService, useValue: mapEventsServiceSpy },
        { provide: CoreSelectionService, useValue: coreSelectionServiceSpy },
        provideZoneChangeDetection()
      ]
    });
    fixture = TestBed.createComponent(GgcMapComponent);
    mapComponent = fixture.componentInstance;
  });

  it("should not receive an event when a resolution:change event is processed", () => {
    mapComponent.processEvent(mapEventOne);

    expect(mapComponent["lastChangeResolutionEvent"]).toBe(mapEventOne);
  });

  it("should not receive an event when 2 resolution:change event are processed", () => {
    const mapEventThree: ObjectEvent = {
      type: "change:resolution",
      map: {} as OlMap
    } as unknown as ObjectEvent;

    mapComponent.processEvent(mapEventOne);
    mapComponent.processEvent(mapEventThree);

    expect(mapComponent["lastChangeResolutionEvent"]).toBe(mapEventThree);
  });

  it('should receive an event when "resolution:change" and "moveeend" event are processed', () => {
    spyOn(mapComponent, "getLocationFromMapEvent").and.returnValue(
      {} as MapViewState
    );
    const events: MapComponentEvent[] = [];

    const moveEndEvent: MapEvent = {
      type: "moveend",
      map: {} as OlMap
    } as MapEvent;

    mapComponent.events.subscribe((result: MapComponentEvent) => {
      events.push(result);
    });

    mapComponent.processEvent(mapEventOne);
    mapComponent.processEvent(mapEventTwo);
    mapComponent.processEvent(moveEndEvent);

    expect(mapComponent["lastChangeResolutionEvent"]).toBeUndefined();
    expect(events.length).toBe(2);
    expect(events[0].message).toEqual(
      "Het zoomen is beeindigd, dit event bevat X en Y en zoomlevel."
    );
    expect(events[0].type).toBe(MapComponentEventTypes.ZOOMENDLOCATION);
    expect(events[0].mapIndex).toEqual(DEFAULT_MAPINDEX);
    expect(events[1].type).toBe(MapComponentEventTypes.ZOOMEND);
    expect(events[1].mapIndex).toEqual(DEFAULT_MAPINDEX);
    expect(events[1].message).toEqual(
      "Het zoomen is beeindigd, dit is het laatste ol.MapEvent."
    );
    expect(events[1].value as MapEvent).toBe(moveEndEvent);
    expect(events[1].value).toBeDefined();
    expect(
      mapEventsServiceSpy.emitSingleclickEventForMap
    ).not.toHaveBeenCalled();
    expect(mapEventsServiceSpy.emitZoomendEventForMap).toHaveBeenCalled();
  });

  it("getLocationFromMapEvent, should return a MapViewState object", () => {
    const moveEndEvent: MapEvent = {
      type: "moveend",
      map: {
        getView() {
          return {
            getCenter() {
              return [1, 2];
            },
            getZoom() {
              return 3;
            }
          } as View;
        }
      } as OlMap
    } as MapEvent;

    const mapViewState = mapComponent.getLocationFromMapEvent(moveEndEvent);

    expect(mapViewState).toBeDefined();
    expect(mapViewState.zoom).toBe(3);
    expect(mapViewState.center[0]).toBe(1);
    expect(mapViewState.center[1]).toBe(2);
  });

  it('should receive an event when "singleclick" event is given', () => {
    const singleClick = {
      type: "singleclick",
      map: {} as OlMap
    } as MapEvent;

    mapComponent.events.subscribe((result: MapComponentEvent) => {
      expect(result.type).toBe(MapComponentEventTypes.SINGLECLICK);
      expect(result.mapIndex).toBe(DEFAULT_MAPINDEX);
      expect(result.message).toEqual("Er is een singleClick gegenereerd.");
      expect(result.value as MapEvent).toBe(singleClick);
    });

    mapComponent.processEvent(mapEventOne);
    mapComponent.processEvent(mapEventTwo);
    mapComponent.processEvent(singleClick);

    expect(mapComponent["lastChangeResolutionEvent"]).toBe(mapEventTwo);
    expect(mapEventsServiceSpy.emitSingleclickEventForMap).toHaveBeenCalled();
    expect(mapEventsServiceSpy.emitZoomendEventForMap).not.toHaveBeenCalled();
  });
});
