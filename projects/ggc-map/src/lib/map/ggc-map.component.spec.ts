import { HttpClient } from "@angular/common/http";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { filter } from "rxjs/operators";
import { GgcCrsConfigService } from "../core/service/ggc-crs-config.service";
import {
  MapComponentEvent,
  MapComponentEventTypes
} from "../model/map-component-event.model";
import { CoreSelectionService } from "../service/select/core-selection.service";
import { GgcSelectionService } from "../service/select/ggc-selection.service";
import { GgcMapComponent } from "./ggc-map.component";
import { CoreLoadingService } from "./service/core-loading.service";
import { CoreMapEventsService } from "./service/core-map-events.service";
import { CoreMapService } from "./service/core-map.service";
import OlMap from "ol/Map";
import View from "ol/View";
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;
import { provideZoneChangeDetection } from "@angular/core";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";

describe("MapComponent, ngAfterViewInit", () => {
  let component: GgcMapComponent;
  let fixture: ComponentFixture<GgcMapComponent>;
  let coreMapService: CoreMapService;

  const httpClientSpy: jasmine.SpyObj<HttpClient> = jasmine.createSpyObj(
    "HttpClient",
    ["get"]
  );
  let mapSpy: SpyObj<OlMap>;
  let viewSpy: SpyObj<View>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GgcMapComponent],
      providers: [
        CoreMapService,
        CoreLoadingService,
        GgcCrsConfigService,
        CoreMapEventsService,
        CoreSelectionService,
        GgcSelectionService,
        { provide: HttpClient, useValue: httpClientSpy },
        provideZoneChangeDetection()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GgcMapComponent);
    coreMapService = TestBed.inject(CoreMapService);
    component = fixture.componentInstance;
    mapSpy = createSpyObj("Map", ["setTarget", "on", "getView"]);
    viewSpy = createSpyObj("View", ["on", "setZoom"]);
    spyOn(coreMapService, "createAndGetMap").and.returnValue(mapSpy);
    mapSpy.getView.and.returnValue(viewSpy);
  });

  it("Events should be set", (done) => {
    component.events
      .pipe(
        filter((event) => event.type === MapComponentEventTypes.MAPINITIALIZED)
      )
      .subscribe((mapComponentInitEvent: MapComponentEvent) => {
        expect(mapComponentInitEvent.type).toBe(
          MapComponentEventTypes.MAPINITIALIZED
        );
        done();
      });
    fixture.detectChanges();
    expect(mapSpy.setTarget).toHaveBeenCalled();
    expect(mapSpy.on).toHaveBeenCalledTimes(4);
    expect(mapSpy.on.calls).toBeDefined();
    expect(mapSpy.on.calls.argsFor(0)[0] as unknown as string).toEqual(
      "precompose"
    );
    expect(mapSpy.on.calls.argsFor(1)[0] as unknown as string).toEqual(
      "rendercomplete"
    );
    expect(mapSpy.on.calls.argsFor(2)[0] as unknown as string).toEqual(
      "singleclick"
    );
    expect(mapSpy.on.calls.argsFor(3)[0] as unknown as string).toEqual(
      "moveend"
    );
    expect(mapSpy.getView).toHaveBeenCalled();
    expect(viewSpy.on).toHaveBeenCalled();
    expect(viewSpy.setZoom).toHaveBeenCalledWith(3);
  });

  it("Events should be unset", () => {
    // setUp
    fixture.detectChanges();
    // cleanUp
    fixture.destroy();

    expect(component["eventsMap"].length).toEqual(0);
  });
  it("minZoomlevel cannot be below 0 and maxZoomlevel cannot be below 1", (done) => {
    component.events
      .pipe(
        filter((event) => event.type === MapComponentEventTypes.MAPINITIALIZED)
      )
      .subscribe((mapComponentInitEvent: MapComponentEvent) => {
        expect(coreMapService.createAndGetMap).toHaveBeenCalledWith(
          DEFAULT_MAPINDEX,
          0,
          1
        );
        expect(mapComponentInitEvent.type).toBe(
          MapComponentEventTypes.MAPINITIALIZED
        );
        done();
      });

    component.minZoomlevel = -1;
    component.maxZoomlevel = 0;
    fixture.detectChanges();
  });

  it("minZoomlevel and maxZoomlevel cannot above than 25", (done) => {
    component.events
      .pipe(
        filter((event) => event.type === MapComponentEventTypes.MAPINITIALIZED)
      )
      .subscribe((mapComponentInitEvent: MapComponentEvent) => {
        expect(coreMapService.createAndGetMap).toHaveBeenCalledWith(
          DEFAULT_MAPINDEX,
          25,
          25
        );
        expect(mapComponentInitEvent.type).toBe(
          MapComponentEventTypes.MAPINITIALIZED
        );
        done();
      });

    component.minZoomlevel = 26;
    component.maxZoomlevel = 26;
    fixture.detectChanges();
  });

  it("maxZoomlevel must be set within valid range", () => {
    // valid zoomlevel
    component.maxZoomlevel = 5;
    expect(component.maxZoomlevel).toBe(5);
    // minimum zoomlevel = 1
    component.maxZoomlevel = 0;
    expect(component.maxZoomlevel).toBe(1);
    component.maxZoomlevel = 1;
    expect(component.maxZoomlevel).toBe(1);
    // maximum zoomlevel = 25
    component.maxZoomlevel = 25;
    expect(component.maxZoomlevel).toBe(25);
    component.maxZoomlevel = 26;
    expect(component.maxZoomlevel).toBe(25);
  });

  it("minZoomlevel must be set within valid range", () => {
    // valid zoomlevel
    component.minZoomlevel = 5;
    expect(component.minZoomlevel).toBe(5);
    // minimum zoomlevel = 0
    component.minZoomlevel = 0;
    expect(component.minZoomlevel).toBe(0);
    component.minZoomlevel = -1;
    expect(component.minZoomlevel).toBe(0);
    // maximum zoomlevel = 25
    component.minZoomlevel = 25;
    expect(component.minZoomlevel).toBe(25);
    component.minZoomlevel = 26;
    expect(component.minZoomlevel).toBe(25);
  });

  it("when minZoomLevel is greater than maxZoomLevel, an event should be thrown informing the user about this", (done) => {
    component.minZoomlevel = 5;
    component.maxZoomlevel = 2;

    component.events.subscribe(
      (mapComponentUnsuccesfulEvent: MapComponentEvent) => {
        expect(mapComponentUnsuccesfulEvent.type).toBe(
          MapComponentEventTypes.UNSUCCESSFUL
        );
        expect(mapComponentUnsuccesfulEvent.message).toBe(
          "Kaart kon niet worden geladen omdat de waarde van minZoomLevel (5)" +
            " hoger is dan die van maxZoomLevel (2)."
        );
        done();
      }
    );

    fixture.detectChanges();
  });

  it("when a mapTabIndex is provided it should be set on the map", () => {
    component.mapTabIndex = 0;
    component.mapIndex = "tabIndexMap";

    fixture.detectChanges();

    const mapElement = fixture.debugElement.query(By.css("#tabIndexMap"));

    expect(mapElement.attributes.tabindex).toBe("0");
  });

  it("when no mapTabIndex is provided it should not be set on the map", () => {
    component.mapIndex = "noTabIndexMap";
    fixture.detectChanges();

    const mapElement = fixture.debugElement.query(By.css("#noTabIndexMap"));

    // According to typings, this is either a string or null.
    expect(mapElement.attributes.tabindex).toBe(undefined as unknown as string);
  });
});
