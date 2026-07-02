import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import View from "ol/View";
import { Observable, of, Subscription } from "rxjs";
import { GgcCrsConfigService } from "../core/service/ggc-crs-config.service";
import { CoreMapEventsService } from "../map/service/core-map-events.service";
import { CoreMapService } from "../map/service/core-map.service";
import { GgcZoomLevelComponent } from "./ggc-zoom-level.component";
import { provideZoneChangeDetection } from "@angular/core";
import OlMap from "ol/Map";

describe("ZoomLevelComponent", () => {
  let component: GgcZoomLevelComponent;
  let fixture: ComponentFixture<GgcZoomLevelComponent>;
  let nativeElement: HTMLElement;
  let debugElement: DebugElement;
  let mapEventsService: CoreMapEventsService;

  beforeEach(() => {
    class MapEventsServiceMock {
      getZoomendObservableForMap() {
        return new Observable();
      }
    }

    TestBed.configureTestingModule({
      providers: [
        CoreMapService,
        { provide: CoreMapEventsService, useClass: MapEventsServiceMock },
        GgcCrsConfigService,
        provideZoneChangeDetection()
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GgcZoomLevelComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    nativeElement = fixture.nativeElement;
    // NOTE when detectChanges(0 is called, onNgInit() is also called.
    fixture.detectChanges();
    mapEventsService = TestBed.inject(CoreMapEventsService);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("when onInit() is called, subscribe should be executed, ", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);
    const coreMapServiceSpy = vi
      .spyOn(coreMapService, "getMap")
      .mockReturnValue({} as unknown as OlMap);

    vi.spyOn(mapEventsService, "getZoomendObservableForMap").mockReturnValue(
      of()
    );

    component.ngOnInit();

    expect(coreMapServiceSpy).toHaveBeenCalledTimes(1);
  });

  // it("when zoom level is 9 getZoomLlevel() should return 9", () => {
  //   const viewMock = {
  //     getZoom(): number {
  //       return 9;
  //     }
  //   } as View;
  //
  //   vi.spyOn(component["map"], "getView").mockReturnValue(viewMock);
  //
  //   component["getZoomLevel"]();
  //   fixture.detectChanges();
  //
  //   expect(component["zoomLevel"]).toEqual(9);
  //
  //   const zoomLevelElement = nativeElement.querySelector(".ggc-zoom-level");
  //
  //   expect(zoomLevelElement).not.toBeNull();
  //   expect((zoomLevelElement as HTMLElement).textContent?.trim()).toEqual("9");
  // });

  // it("when zoom level is a decimal number getZoomLlevel() should return it rounded to 2 decimals ", () => {
  //   const viewMock = {
  //     getZoom(): number {
  //       return 3.14159265359;
  //     }
  //   } as View;
  //
  //   vi.spyOn(component["map"], "getView").mockReturnValue(viewMock);
  //
  //   component["getZoomLevel"]();
  //   fixture.detectChanges();
  //
  //   expect(component["zoomLevel"]).toEqual(3.14);
  //
  //   const zoomLevelElement = nativeElement.querySelector(".ggc-zoom-level");
  //
  //   expect(zoomLevelElement).not.toBeNull();
  //   expect((zoomLevelElement as HTMLElement).textContent?.trim()).toEqual(
  //     "3.14"
  //   );
  // });

  it("when ngDestroy is called, unsubscribe should be executed, ", () => {
    component["zoomendSubscription"] = new Subscription();

    const subscriptionSpy = vi
      .spyOn(component["zoomendSubscription"], "unsubscribe")
      .mockImplementation(() => {
        /* empty */
      });

    component.ngOnDestroy();

    expect(subscriptionSpy).toHaveBeenCalledTimes(1);
  });
});
