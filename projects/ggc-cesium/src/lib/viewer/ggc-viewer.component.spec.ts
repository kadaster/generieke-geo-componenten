import { ComponentFixture, TestBed } from "@angular/core/testing";
import { GgcViewerComponent } from "./ggc-viewer.component";
import { createCesiumMock } from "./viewer-mock.spec";
import {
  Camera,
  Cartesian3,
  DirectionalLight,
  HeadingPitchRange,
  Transforms
} from "@cesium/engine";
import { Viewer } from "@cesium/widgets";
import { CameraOptionsType } from "../model/enums";
import {
  CameraPosition,
  LookAtObject,
  LookAtPosition,
  SelectionEvent
} from "../model/interfaces";
import { cameraUtils, createFlyToOptions } from "../utils/camera-utils";
import { CoreCameraService } from "../service/core-camera.service";
import { GgcViewerService } from "../service/ggc-viewer.service";
import { CoreSelectionService } from "../service/core-selection.service";
import { Observable } from "rxjs";
import { provideZoneChangeDetection } from "@angular/core";

describe("ViewerComponent", () => {
  let component: GgcViewerComponent;
  let fixture: ComponentFixture<GgcViewerComponent>;
  let cesiumMock: Partial<Viewer>;
  let coreSelectionServiceSpy: jasmine.SpyObj<CoreSelectionService>;
  let viewerService: GgcViewerService;

  beforeEach(async () => {
    coreSelectionServiceSpy = jasmine.createSpyObj("CoreSelectionService", [
      "setOptions",
      "initializeSelections",
      "destroyAllSelections",
      "getClickEventsObservable"
    ]);
    const cameraSpy = jasmine.createSpyObj("CoreCameraService", [
      "setCameraValues"
    ]);

    await TestBed.configureTestingModule({
      imports: [GgcViewerComponent],
      providers: [
        { provide: CoreSelectionService, useValue: coreSelectionServiceSpy },
        { provide: CoreCameraService, useValue: cameraSpy },
        { provide: CoreCameraService, useValue: cameraSpy },
        provideZoneChangeDetection()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GgcViewerComponent);
    component = fixture.componentInstance;
    coreSelectionServiceSpy.getClickEventsObservable.and.returnValue(
      new Observable<SelectionEvent>()
    );
    cesiumMock = createCesiumMock();
    viewerService = TestBed.inject(GgcViewerService);
    spyOn<any>(component, "createViewer").and.returnValue(
      new Promise((resolve) => {
        resolve(cesiumMock);
      })
    );
    await fixture.whenStable();
  });

  it("should create", async () => {
    let ready = false;
    component.ready.subscribe(() => {
      ready = true;
    });
    expect(component).toBeTruthy();

    fixture.detectChanges();
    await fixture.whenStable();
    expect(ready).toBe(true);
    expect(cesiumMock.camera!.flyTo).not.toHaveBeenCalled();
  });

  it("should not call flyTo when cameraOptions is set before cesium is ready", async () => {
    component.cameraOptions = { cameraPosition: { lon: 10, lat: 10 } };

    fixture.detectChanges();

    expect(cesiumMock.camera!.flyTo).not.toHaveBeenCalled();
  });

  describe("directionalLightOptions", () => {
    it("should set directionalLightOptions if present in input viewerOptions", async () => {
      const cartesian3 = new Cartesian3(0.1, 0.1, 0.1);
      component.viewerOptions = {
        directionalLightOptions: {
          direction: cartesian3,
          intensity: 10
        }
      };
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component["viewer"].scene!.light).toBeInstanceOf(DirectionalLight);
      expect(component["viewer"].scene!.light.intensity).toBe(10);
      expect(
        (component["viewer"].scene!.light as DirectionalLight).direction
      ).toEqual(cartesian3);
    });

    it("should set directionalLightOptions with cameraDirection and get direction from camera.directionWC", async () => {
      component.viewerOptions = {
        directionalLightOptions: {
          direction: "cameraDirection"
        }
      };

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component["viewer"].scene!.light).toBeInstanceOf(DirectionalLight);
      const light = component["viewer"].scene!.light as DirectionalLight;
      expect(light.direction).toEqual(new Cartesian3(0.4, 0.5, 0.6));
      expect(
        component["viewer"].scene!.preRender.addEventListener
      ).toHaveBeenCalled();
    });
  });

  describe("cameraOptions", () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it("flyTo should use camera.lookatTransform when cameraOptions is LookAtObject", async () => {
      const json = getJson();
      const cameraOptions = { geojson: json } as LookAtObject;

      spyOn<any>(viewerService, "getExtent").and.callThrough();
      spyOn<any>(viewerService, "getCenter").and.callThrough();
      spyOn<any>(viewerService, "calculateDistance").and.callThrough();
      spyOn<any>(viewerService, "getExtentRecursive").and.callThrough();

      const extent = viewerService["getExtent"](json);
      const center = viewerService["getCenter"](extent);
      const distance = viewerService["calculateDistance"](extent);

      component.cameraOptions = cameraOptions;
      expect(cesiumMock.camera!.lookAtTransform).toHaveBeenCalledTimes(2);
      expect(cesiumMock.camera!.lookAtTransform).toHaveBeenCalledWith(
        Transforms.eastNorthUpToFixedFrame(center),
        new HeadingPitchRange(0, -Math.PI / 8, distance)
      );
    });

    it("flyTo should use camera.flyTo when cameraOptions is CameraPosition", async () => {
      const cameraOptions = {
        cameraPosition: { lon: 10, lat: 10 }
      } as CameraPosition;
      const flyToOptions = createFlyToOptions(cameraOptions as CameraPosition);

      component.cameraOptions = cameraOptions;
      expect(cesiumMock.camera!.flyTo).toHaveBeenCalledWith(flyToOptions);
    });

    it("flyTo should use camera.lookat when cameraOptions is LookatPosition", async () => {
      spyOn<any>(cameraUtils, "getTerrainHeight").and.returnValue(
        new Promise((resolve) => {
          resolve(100);
        })
      );

      component.cameraOptions = {
        lookAtPosition: { lon: 10, lat: 10 }
      } as LookAtPosition;

      await fixture.whenStable();

      expect(cesiumMock.camera?.lookAt).toHaveBeenCalled();
    });

    describe("getOptionsType", () => {
      it("should return LookatObject when cameraOptions contains geojson", () => {
        const cameraOptions = { geojson: "" } as LookAtObject;
        const optionsType = component["getOptionsType"](cameraOptions);
        expect(optionsType).toBe(CameraOptionsType.LookAtObject);
      });
      it("should return CameraPosition when cameraOptions contains cameraPosition", () => {
        const cameraOptions = {
          cameraPosition: { lon: 10, lat: 10 }
        } as CameraPosition;
        const optionsType = component["getOptionsType"](cameraOptions);
        expect(optionsType).toBe(CameraOptionsType.CameraPosition);
      });
      it("should return LookatPosition when cameraOptions contains lookatPosition", () => {
        const cameraOptions = {
          lookAtPosition: { lon: 10, lat: 10 }
        } as LookAtPosition;
        const optionsType = component["getOptionsType"](cameraOptions);
        expect(optionsType).toBe(CameraOptionsType.LookAtPosition);
      });
    });

    describe("onKeyDown", () => {
      class MockCamera {
        lookUp = jasmine.createSpy("lookUp");
        lookDown = jasmine.createSpy("lookDown");
        lookLeft = jasmine.createSpy("lookLeft");
        lookRight = jasmine.createSpy("lookRight");
      }

      beforeEach(() => {
        component["camera"] = new MockCamera() as any;
      });

      for (const direction of ["Up", "Down", "Left", "Right"]) {
        it(`should perform the correct actions for the arrow ${direction}`, () => {
          const cameraSpy =
            component["camera"]![`look${direction}` as keyof Camera];
          const event = new KeyboardEvent("keydown", {
            key: `Arrow${direction}`
          });

          component.onKeyDown(event);
          expect(cameraSpy).toHaveBeenCalled();
        });
      }
    });

    function getJson(): string {
      return `{
        "type": "Polygon",
        "coordinates": [
          [[10,10],[10,20],[20,20],[20,10],[10,10]]
        ]
      }`;
    }
  });
});
