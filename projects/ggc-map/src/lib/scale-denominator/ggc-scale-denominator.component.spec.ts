import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import OlMap from "ol/Map";
import { Subscription } from "rxjs";
import { GgcCrsConfigService } from "../core/service/ggc-crs-config.service";
import { CoreMapEventsService } from "../map/service/core-map-events.service";
import { CoreMapService } from "../map/service/core-map.service";
import { provideZoneChangeDetection } from "@angular/core";

import { GgcScaleDenominatorComponent } from "./ggc-scale-denominator.component";

describe("ScaleDenominatorComponent", () => {
  let component: GgcScaleDenominatorComponent;
  let fixture: ComponentFixture<GgcScaleDenominatorComponent>;
  let nativeElement: HTMLElement;
  let debugElement: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GgcScaleDenominatorComponent],
      providers: [
        CoreMapService,
        GgcCrsConfigService,
        CoreMapEventsService,
        provideZoneChangeDetection()
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GgcScaleDenominatorComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    nativeElement = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("calculate scale denominator for zoomlevel 3 should return expected number", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);
    const crsConfigService: GgcCrsConfigService =
      debugElement.injector.get(GgcCrsConfigService);
    const mapMock = getMapMock(
      crsConfigService.getRdNewCrsConfig().resolutions[3]
    );
    const getMapSpy = vi
      .spyOn(coreMapService, "getMap")
      .mockReturnValue(mapMock as OlMap);

    component.ngOnInit();
    component["calculateScaleDenominator"]();

    expect(component["currentScaleDenominator"]).toEqual(1536000);
    expect(getMapSpy).toHaveBeenCalled();
  });

  it("calculate scale denominator for zoomlevel 13 should return expected number", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);
    const crsConfigService: GgcCrsConfigService =
      debugElement.injector.get(GgcCrsConfigService);
    const mapMock = getMapMock(
      crsConfigService.getRdNewCrsConfig().resolutions[13]
    );
    const getMapSpy = vi
      .spyOn(coreMapService, "getMap")
      .mockReturnValue(mapMock as OlMap);

    component.ngOnInit();
    component["calculateScaleDenominator"]();

    expect(component["currentScaleDenominator"]).toEqual(1500);
    expect(getMapSpy).toHaveBeenCalled();
  });

  it("HTML should be updated when currentScaleDenominator is set", () => {
    fixture.detectChanges();

    let scaleDenominatorElement = nativeElement.querySelector(
      ".ggc-scale-denominator"
    );
    expect(scaleDenominatorElement).toBeNull();

    component["currentScaleDenominator"] = 123456;
    fixture.detectChanges();

    scaleDenominatorElement = nativeElement.querySelector(
      ".ggc-scale-denominator"
    );
    expect(scaleDenominatorElement).not.toBeNull();
    expect(
      (scaleDenominatorElement as HTMLElement).textContent?.trim()
    ).toEqual("1:123456");
  });

  it("should unsubscribe when ngDestroy is called, ", () => {
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

function getMapMock(resolution: number): object {
  return {
    getView() {
      return {
        on() {
          //
        },
        getResolution() {
          return resolution;
        }
      };
    }
  };
}
