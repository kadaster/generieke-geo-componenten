import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { DebugElement } from "@angular/core";

import OlMap from "ol/Map";
import Control from "ol/control/Control";

import { GgcScaleLineComponent } from "./ggc-scale-line.component";
import { CoreMapService } from "../map/service/core-map.service";
import { GgcCrsConfigService } from "../core/service/ggc-crs-config.service";
import { GgcMapDetailsContainerComponent } from "../map-details-container/ggc-map-details-container.component";

describe("ScaleLineComponent", () => {
  let component: GgcScaleLineComponent;
  let fixture: ComponentFixture<GgcScaleLineComponent>;
  let debugElement: DebugElement;
  let addedControl: Control | undefined;
  let removedControl: Control | undefined;
  const mapMock = {
    addControl(control: Control) {
      addedControl = control;
    },
    removeControl(control: Control) {
      removedControl = control;
    }
  } as OlMap;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GgcScaleLineComponent],
      providers: [CoreMapService, GgcCrsConfigService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GgcScaleLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    debugElement = fixture.debugElement;

    addedControl = undefined;
    removedControl = undefined;
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("ngOnInit should create scaleLineControl and add it to the map", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);
    const getMapSpy = spyOn(coreMapService, "getMap").and.returnValue(mapMock);
    const getScaleLineOptionsSpy = spyOn<any>(
      component,
      "createScaleLineOptions"
    );

    component.ngOnInit();

    expect(getMapSpy).toHaveBeenCalled();
    expect(getScaleLineOptionsSpy).toHaveBeenCalled();
    expect(addedControl).toBeDefined();
  });

  it("createScaleLineOptions() should not add target to options when mapDetailsContainer is not present", () => {
    const options = component["createScaleLineOptions"]();

    expect(options.target).not.toBeDefined();
  });

  it("createScaleLineOptions() should add target to options when mapDetailsContainer is present", () => {
    component.mapDetailsContainer = {} as GgcMapDetailsContainerComponent;
    const options = component["createScaleLineOptions"]();

    expect(options.target).toBeDefined();
  });

  it("when the component is destroyed, removeControl should be called on the map", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);
    const getMapSpy = spyOn(coreMapService, "getMap").and.returnValue(mapMock);
    component.ngOnInit();
    component.ngOnDestroy();

    expect(getMapSpy).toHaveBeenCalled();
    expect(removedControl).toBeDefined();
  });
});
