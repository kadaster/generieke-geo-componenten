import type { MockedObject } from "vitest";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { GgcViewerComponent } from "./ggc-viewer.component";
import { createCesiumMock } from "./viewer-mock";
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
import { vi } from "vitest";
describe("ViewerComponent", () => {
  let component: GgcViewerComponent;
  let fixture: ComponentFixture<GgcViewerComponent>;
  let cesiumMock: Partial<Viewer>;
  let coreSelectionServiceSpy: Pick<
    MockedObject<CoreSelectionService>,
    "initializeSelections" | "destroyAllSelections" | "getClickEventsObservable"
  >;
  let viewerService: GgcViewerService;

  beforeEach(async () => {
    coreSelectionServiceSpy = {
      initializeSelections: vi
        .fn()
        .mockName("CoreSelectionService.initializeSelections"),
      destroyAllSelections: vi
        .fn()
        .mockName("CoreSelectionService.destroyAllSelections"),
      getClickEventsObservable: vi
        .fn()
        .mockName("CoreSelectionService.getClickEventsObservable")
    };
    const cameraSpy = {
      setCameraValues: vi.fn().mockName("CoreCameraService.setCameraValues")
    };

    await TestBed.configureTestingModule({
      imports: [GgcViewerComponent],
      providers: [
        { provide: CoreSelectionService, useValue: coreSelectionServiceSpy },
        { provide: CoreCameraService, useValue: cameraSpy },
        provideZoneChangeDetection()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GgcViewerComponent);
    component = fixture.componentInstance;
    coreSelectionServiceSpy.getClickEventsObservable.mockReturnValue(
      new Observable<SelectionEvent>()
    );
    cesiumMock = createCesiumMock();
    viewerService = TestBed.inject(GgcViewerService);
    vi.spyOn(component as any, "createViewer").mockReturnValue(
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
    await Promise.resolve();
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
      await Promise.resolve();
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
      await Promise.resolve();
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

      vi.spyOn(viewerService, "getExtent");
      vi.spyOn(viewerService, "getCenter");
      vi.spyOn(viewerService, "calculateDistance");
      vi.spyOn(viewerService as any, "getExtentRecursive");

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
      vi.spyOn(cameraUtils, "getTerrainHeight").mockReturnValue(
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
        lookUp = vi.fn();
        lookDown = vi.fn();
        lookLeft = vi.fn();
        lookRight = vi.fn();
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

    describe("CCS show/hide logo", () => {
      it("default is block", () => {
        fixture.detectChanges();

        const host: HTMLElement = fixture.nativeElement;

        expect(host.style.getPropertyValue("--displayLogo")).toBe("block");
      });

      it("zet displayLogo op none als hideLogo true is", () => {
        component.hideLogo = true;
        fixture.detectChanges();

        const host: HTMLElement = fixture.nativeElement;

        expect(host.style.getPropertyValue("--displayLogo")).toBe("none");
      });

      it("zet displayLogo op block als hideLogo false is", () => {
        component.hideLogo = false;
        fixture.detectChanges();

        const host: HTMLElement = fixture.nativeElement;

        expect(host.style.getPropertyValue("--displayLogo")).toBe("block");
      });

      it("update CSS variabele wanneer hideLogo verandert", () => {
        component.hideLogo = false;
        fixture.detectChanges();

        component.hideLogo = true;
        fixture.detectChanges();

        const host: HTMLElement = fixture.nativeElement;

        expect(host.style.getPropertyValue("--displayLogo")).toBe("none");
      });
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
