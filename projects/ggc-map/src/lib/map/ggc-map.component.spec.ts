import type { Mocked, MockedObject } from "vitest";
import { HttpClient } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { GgcCrsConfigService } from "../core/service/ggc-crs-config.service";
import { CoreSelectionService } from "../service/select/core-selection.service";
import { GgcSelectionService } from "../service/select/ggc-selection.service";
import { GgcMapComponent } from "./ggc-map.component";
import { CoreLoadingService } from "./service/core-loading.service";
import { CoreMapEventsService } from "./service/core-map-events.service";
import { CoreMapService } from "./service/core-map.service";
import OlMap from "ol/Map";
import View from "ol/View";
import {
  DEFAULT_MAPINDEX,
  MapComponentEvent,
  MapComponentEventTypes
} from "@kadaster/ggc-models";
import { of } from "rxjs";
import { provideZonelessChangeDetection } from "@angular/core";

describe("MapComponent, ngAfterViewInit", () => {
  let component: GgcMapComponent;
  let fixture: ComponentFixture<GgcMapComponent>;
  let coreMapService: Mocked<CoreMapService>;

  const httpClientSpy = {
    get: vi.fn().mockName("HttpClient.get")
  };
  let mapMock: MockedObject<OlMap>;
  let viewMock: MockedObject<View>;

  beforeEach(() => {
    viewMock = {
      on: vi.fn(),
      setZoom: vi.fn()
    } as unknown as MockedObject<View>;

    mapMock = {
      setTarget: vi.fn(),
      on: vi.fn(),
      getView: vi.fn().mockReturnValue(viewMock)
    } as unknown as MockedObject<OlMap>;

    coreMapService = {
      createAndGetMap: vi.fn().mockReturnValue(mapMock as unknown as OlMap),
      getLayerChangedObservable: vi.fn().mockReturnValue(of()),
      destroyMap: vi.fn().mockReturnValue(of())
    } as MockedObject<CoreMapService>;

    TestBed.configureTestingModule({
      imports: [GgcMapComponent],
      providers: [
        CoreMapService,
        CoreLoadingService,
        GgcCrsConfigService,
        { provide: CoreMapService, useValue: coreMapService as CoreMapService },
        CoreMapEventsService,
        CoreSelectionService,
        GgcSelectionService,
        { provide: HttpClient, useValue: httpClientSpy },
        provideZonelessChangeDetection()
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(GgcMapComponent);
    component = fixture.componentInstance;
  });

  it("Events should be set", async () => {
    component.events.subscribe((mapComponentInitEvent: MapComponentEvent) => {
      expect(mapComponentInitEvent.type).toBe(
        MapComponentEventTypes.MAPINITIALIZED
      );
    });
    fixture.detectChanges();
    expect(mapMock.setTarget).toHaveBeenCalled();
    expect(mapMock.on).toHaveBeenCalledTimes(4);
    expect(vi.mocked(mapMock.on).mock.calls[0][0] as unknown as string).toEqual(
      "precompose"
    );
    expect(vi.mocked(mapMock.on).mock.calls[1][0] as unknown as string).toEqual(
      "rendercomplete"
    );
    expect(vi.mocked(mapMock.on).mock.calls[2][0] as unknown as string).toEqual(
      "singleclick"
    );
    expect(vi.mocked(mapMock.on).mock.calls[3][0] as unknown as string).toEqual(
      "moveend"
    );
    expect(mapMock.getView).toHaveBeenCalled();
    expect(viewMock.on).toHaveBeenCalled();
    expect(viewMock.setZoom).toHaveBeenCalledWith(3);
  });

  it("Events should be unset", () => {
    // setUp
    fixture.detectChanges();
    // cleanUp
    fixture.destroy();

    expect(component["eventsMap"].length).toEqual(0);
  });
  it("minZoomlevel cannot be below 0 and maxZoomlevel cannot be below 1", () => {
    fixture.componentRef.setInput("minZoomlevel", -1);
    fixture.componentRef.setInput("maxZoomlevel", 0);
    fixture.detectChanges();
    expect(coreMapService.createAndGetMap).toHaveBeenCalledWith(
      DEFAULT_MAPINDEX,
      0,
      1
    );
  });

  it("minZoomlevel and maxZoomlevel cannot be higher than 25", () => {
    /*    component.events
      .pipe(
        filter((event) => event.type === MapComponentEventTypes.MAPINITIALIZED)
      )
      .subscribe((mapComponentInitEvent: MapComponentEvent) => {

        expect(mapComponentInitEvent.type).toBe(
          MapComponentEventTypes.MAPINITIALIZED
        );
      });*/

    fixture.componentRef.setInput("minZoomlevel", 26);
    fixture.componentRef.setInput("maxZoomlevel", 26);
    fixture.detectChanges();
    expect(coreMapService.createAndGetMap).toHaveBeenCalledWith(
      DEFAULT_MAPINDEX,
      25,
      25
    );
  });

  it("maxZoomlevel must be set within valid range", () => {
    // valid zoomlevel
    fixture.componentRef.setInput("maxZoomlevel", 5);
    expect(component.maxZoomlevel()).toBe(5);
    // minimum zoomlevel = 1
    fixture.componentRef.setInput("maxZoomlevel", 0);
    expect(component.maxZoomlevel()).toBe(1);
    fixture.componentRef.setInput("maxZoomlevel", 1);
    expect(component.maxZoomlevel()).toBe(1);
    // maximum zoomlevel = 25
    fixture.componentRef.setInput("maxZoomlevel", 25);
    expect(component.maxZoomlevel()).toBe(25);
    fixture.componentRef.setInput("maxZoomlevel", 26);
    expect(component.maxZoomlevel()).toBe(25);
  });

  it("minZoomlevel must be set within valid range", () => {
    // valid zoomlevel
    fixture.componentRef.setInput("minZoomlevel", 5);
    expect(component.minZoomlevel()).toBe(5);
    // minimum zoomlevel = 0
    fixture.componentRef.setInput("minZoomlevel", 0);
    expect(component.minZoomlevel()).toBe(0);
    fixture.componentRef.setInput("minZoomlevel", -1);
    expect(component.minZoomlevel()).toBe(0);
    // maximum zoomlevel = 25
    fixture.componentRef.setInput("minZoomlevel", 25);
    expect(component.minZoomlevel()).toBe(25);
    fixture.componentRef.setInput("minZoomlevel", 26);
    expect(component.minZoomlevel()).toBe(25);
  });

  it("when minZoomLevel is greater than maxZoomLevel, an event should be thrown informing the user about this", async () => {
    fixture.componentRef.setInput("minZoomlevel", 5);
    fixture.componentRef.setInput("maxZoomlevel", 2);

    component.events.subscribe(
      (mapComponentUnsuccesfulEvent: MapComponentEvent) => {
        expect(mapComponentUnsuccesfulEvent.type).toBe(
          MapComponentEventTypes.UNSUCCESSFUL
        );
        expect(mapComponentUnsuccesfulEvent.message).toBe(
          "Kaart kon niet worden geladen omdat de waarde van minZoomLevel (5)" +
            " hoger is dan die van maxZoomLevel (2)."
        );
      }
    );

    fixture.detectChanges();
  });

  it("when a mapTabIndex is provided it should be set on the map", () => {
    fixture.componentRef.setInput("mapTabIndex", 0);
    fixture.componentRef.setInput("mapIndex", "tabIndexMap");

    fixture.detectChanges();

    const mapElement = fixture.debugElement.query(By.css("#tabIndexMap"));

    expect(mapElement.attributes.tabindex).toBe("0");
  });

  it("when no mapTabIndex is provided it should not be set on the map", () => {
    fixture.componentRef.setInput("mapIndex", "noTabIndexMap");
    fixture.detectChanges();

    const mapElement = fixture.debugElement.query(By.css("#noTabIndexMap"));

    // According to typings, this is either a string or null.
    expect(mapElement.attributes.tabindex).toBe(undefined as unknown as string);
  });
});
