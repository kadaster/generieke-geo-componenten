import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import Control from "ol/control/Control";
import { toStringHDMS } from "ol/coordinate";

import OlMap from "ol/Map";
import { register } from "ol/proj/proj4";
import * as proj4x from "proj4";
import { GgcCrsConfigService } from "../core/service/ggc-crs-config.service";
import { GgcMapDetailsContainerComponent } from "../map-details-container/ggc-map-details-container.component";
import { CoreMapService } from "../map/service/core-map.service";
import { CoordinateFormatPipe } from "../pipes/coordinate-format.pipe";
import { defs } from "../utils/epsg28992";
import { GgcMousePositionComponent } from "./ggc-mouse-position.component";

const proj4 = (proj4x as any).default;

describe("ControlMousePositionComponent", () => {
  let component: GgcMousePositionComponent;
  let fixture: ComponentFixture<GgcMousePositionComponent>;
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
      imports: [CoordinateFormatPipe],
      providers: [CoreMapService, GgcCrsConfigService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GgcMousePositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    debugElement = fixture.debugElement;

    addedControl = undefined;
    removedControl = undefined;
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("ngOninit should call setCoordinateFormatOnMousePositionControl(), setMousePositionControlOnMap() and createMousePositionOptions()", () => {
    const setCoordinateFormatOnMousePositionControlSpy = spyOn<any>(
      component,
      "setCoordinateFormatOnMousePositionControl"
    );
    const setMousePositionControlOnMapSpy = spyOn<any>(
      component,
      "setMousePositionControlOnMap"
    );
    const getMousePositionOptionsSpy = spyOn<any>(
      component,
      "createMousePositionOptions"
    );

    component.ngOnInit();

    expect(setCoordinateFormatOnMousePositionControlSpy).toHaveBeenCalled();
    expect(setMousePositionControlOnMapSpy).toHaveBeenCalled();
    expect(getMousePositionOptionsSpy).toHaveBeenCalled();
  });

  it("setCoordinateFormatOnMousePositionControl should call setCoordinateFormat() on mousePositionControl", () => {
    component.ngOnInit();

    const setCoordinateFormatSpy = spyOn(
      component["mousePositionControl"],
      "setCoordinateFormat"
    );
    component["setCoordinateFormatOnMousePositionControl"]();

    expect(setCoordinateFormatSpy).toHaveBeenCalledWith(jasmine.any(Function));
  });

  it("setMousePositionControlOnMap() should add MousePositionControl to the map", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);
    const getMapSpy = spyOn(coreMapService, "getMap").and.returnValue(mapMock);

    component["setMousePositionControlOnMap"]();

    expect(getMapSpy).toHaveBeenCalled();
    expect(addedControl).toBeDefined();
  });

  it("createMousePositionOptions() should not add target to options when mapDetailsContainer is not present", () => {
    const options = component["createMousePositionOptions"]();

    expect(options.target).not.toBeDefined();
  });

  it("createMousePositionOptions() should add target to options when mapDetailsContainer is present", () => {
    component.mapDetailsContainer = {} as GgcMapDetailsContainerComponent;
    const options = component["createMousePositionOptions"]();

    expect(options.target).toBeDefined();
  });

  it("createCoordinateformat() should return an string based on projection, coordinate, template and decimalDigits in alternate format", () => {
    proj4.defs("EPSG:28992", defs);
    register(proj4);

    component.decimalDigits = 6;
    component.projection = "EPSG:4326";
    component.format = "Lat: {y}; Lng: {x}";
    const coordinateFormat = component["createCoordinateFormat"]([
      155000, 463000
    ]);

    expect(coordinateFormat).toEqual("Lat: 52,155172; Lng: 5,387204");
  });

  it("should call the callback function if the provided format is a function", () => {
    proj4.defs("EPSG:28992", defs);
    register(proj4);

    component.decimalDigits = 6;
    component.projection = "EPSG:4326";
    component.format = (coord: number[] | undefined) =>
      toStringHDMS(coord || [0, 0], 2);
    const coordinateFormat = component["createCoordinateFormat"]([
      155000, 463000
    ]);

    expect(coordinateFormat).toEqual("52° 09′ 18.62″ N 5° 23′ 13.93″ E");
  });

  it("createCoordinateformat() should throw an error when an unknown projection is used", () => {
    component.decimalDigits = 6;
    component.projection = "EPSG:1234";
    let error = "";
    try {
      component["createCoordinateFormat"]([155000, 463000]);
    } catch (e) {
      error = (e as Error).toString();
    }

    expect(error).toEqual("Error: Unknown projection 'EPSG:1234'");
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

  it("should return an empty string when the coordinate is undefined", () => {
    const res = component["createCoordinateFormat"](undefined);
    expect(res).toEqual("");
  });
});
