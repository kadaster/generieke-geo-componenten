import { ComponentFixture, TestBed } from "@angular/core/testing";

import { GgcControlsComponent } from "./ggc-controls.component";
import { CoreViewerService } from "../service/core-viewer.service";
import { Subject } from "rxjs";
import { Cartesian3, Matrix4, Ray, Transforms } from "@cesium/engine";
import { Viewer } from "@cesium/widgets";
import { createCesiumMock } from "../viewer/viewer-mock.spec";
import { By } from "@angular/platform-browser";
import { cameraUtils, DEFAULT_POSITIONSHIFT } from "../utils/camera-utils";
import { LookAtPosition } from "../model/interfaces";
import SpyObj = jasmine.SpyObj;
import Spy = jasmine.Spy;

describe("ControlsComponent", () => {
  let component: GgcControlsComponent;
  let fixture: ComponentFixture<GgcControlsComponent>;
  let coreViewerServiceSpy: SpyObj<CoreViewerService>;
  let cesiumMock: Partial<Viewer>;
  const viewerSubject: Subject<Viewer> = new Subject<Viewer>();

  beforeEach(async () => {
    coreViewerServiceSpy = jasmine.createSpyObj("CoreViewerService", [
      "getViewerObservable",
      "getViewer"
    ]);
    await TestBed.configureTestingModule({
      imports: [GgcControlsComponent],
      providers: [
        { provide: CoreViewerService, useValue: coreViewerServiceSpy }
      ]
    }).compileComponents();

    cesiumMock = createCesiumMock();
    coreViewerServiceSpy.getViewerObservable.and.returnValue(
      viewerSubject.asObservable()
    );

    fixture = TestBed.createComponent(GgcControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    viewerSubject.next(cesiumMock as Viewer);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should call camera.moveForward on zoomIn", () => {
    const zoomInButton = fixture.debugElement.query(
      By.css(".gc-controls-zoom > .cesium-control-top")
    );

    zoomInButton.nativeElement.click();

    expect(cesiumMock.camera?.moveForward).toHaveBeenCalled();
  });

  it("should call camera.moveBackward on zoomOut", () => {
    const zoomOutButton = fixture.debugElement.query(
      By.css(".gc-controls-zoom > .cesium-control-bottom")
    );

    zoomOutButton.nativeElement.click();

    expect(cesiumMock.camera?.moveBackward).toHaveBeenCalled();
  });

  it("should call setCameraPositionToDefault on defaultCameraPosition", () => {
    const defaultCameraPositionButton = fixture.debugElement.query(
      By.css(".gc-controls-nav .cesium-control-default-camera-position")
    );

    const setCameraPositionToDefaultSpy = spyOn(
      component,
      "setCameraPositionToDefault"
    ).and.callThrough();

    defaultCameraPositionButton.nativeElement.click();

    expect(setCameraPositionToDefaultSpy).toHaveBeenCalled();
  });

  it("should call flyToLookAtPosition when setCameraPositionToDefault() is called", () => {
    const methodSpy = spyOn<any>(cameraUtils, "flyToLookAtPosition");
    component.setCameraPositionToDefault();

    const currentLookAtPosition: LookAtPosition = {
      lookAtPosition: {
        lat: DEFAULT_POSITIONSHIFT.lat,
        lon: DEFAULT_POSITIONSHIFT.lon
      }
    };

    expect(methodSpy).toHaveBeenCalledWith(
      currentLookAtPosition,
      cesiumMock as Viewer
    );
  });

  it("should call lookAtTransform and rotateLeft when intersectionPoint can be calculated in setCameraFixed", () => {
    (cesiumMock.camera?.getPickRay as Spy).and.returnValue({} as Ray);
    (cesiumMock.scene?.globe.pick as Spy).and.returnValue({} as Cartesian3);
    const spyTransform = spyOn(
      Transforms,
      "eastNorthUpToFixedFrame"
    ).and.returnValue({} as Matrix4);

    component.rotateLeft();

    expect(cesiumMock.camera?.getPickRay).toHaveBeenCalled();
    expect(cesiumMock.scene?.globe.pick).toHaveBeenCalled();
    expect(spyTransform).toHaveBeenCalled();
    expect(cesiumMock.camera?.lookAtTransform).toHaveBeenCalledTimes(2);
    expect(cesiumMock.camera?.rotateLeft).toHaveBeenCalled();
  });

  it("should not call lookAtTransform and rotateLeft when intersectionPoint can be calculated in setCameraFixed", () => {
    (cesiumMock.camera?.getPickRay as Spy).and.returnValue({} as Ray);
    (cesiumMock.scene?.globe.pick as Spy).and.returnValue(undefined);

    component.rotateLeft();

    expect(cesiumMock.camera?.getPickRay).toHaveBeenCalled();
    expect(cesiumMock.scene?.globe.pick).toHaveBeenCalled();
    expect(cesiumMock.camera?.lookAtTransform).not.toHaveBeenCalled();
    expect(cesiumMock.camera?.rotateLeft).not.toHaveBeenCalled();
  });

  describe("rotate buttons", () => {
    let cameraFixedSpy: Spy;

    beforeEach(() => {
      cameraFixedSpy = spyOn<any>(component, "setCameraFixed").and.returnValue(
        true
      );
    });

    it("should call camera.rotateUp on rotateUp", () => {
      const rotateUpButton = fixture.debugElement.query(
        By.css(".gc-controls-nav > .cesium-control-top")
      );

      rotateUpButton.nativeElement.click();

      expect(cameraFixedSpy).toHaveBeenCalled();
      expect(cesiumMock.camera?.rotateDown).toHaveBeenCalled();
      expect(cesiumMock.camera?.lookAtTransform).toHaveBeenCalled();
    });

    it("should call camera.moveLeft on moveLeft", () => {
      const rotateLeftButton = fixture.debugElement.query(
        By.css(".gc-controls-nav .cesium-control-left")
      );

      rotateLeftButton.nativeElement.click();

      expect(cameraFixedSpy).toHaveBeenCalled();
      expect(cesiumMock.camera?.rotateLeft).toHaveBeenCalled();
      expect(cesiumMock.camera?.lookAtTransform).toHaveBeenCalled();
    });

    it("should call camera.moveRight on moveRight", () => {
      const rotateRightButton = fixture.debugElement.query(
        By.css(".gc-controls-nav .cesium-control-right")
      );

      rotateRightButton.nativeElement.click();

      expect(cameraFixedSpy).toHaveBeenCalled();
      expect(cesiumMock.camera?.rotateRight).toHaveBeenCalled();
      expect(cesiumMock.camera?.lookAtTransform).toHaveBeenCalled();
    });

    it("should call camera.moveDown on moveDown", () => {
      const cesiumCameraPitch = createCesiumMock({ cameraPitch: -1 }) as Viewer;
      viewerSubject.next(cesiumCameraPitch);

      const rotateDownButton = fixture.debugElement.query(
        By.css(".gc-controls-nav .cesium-control-bottom")
      );

      rotateDownButton.nativeElement.click();

      expect(cameraFixedSpy).toHaveBeenCalled();
      expect(cesiumCameraPitch.camera?.rotateUp).toHaveBeenCalled();
      expect(cesiumCameraPitch.camera?.lookAtTransform).toHaveBeenCalled();
    });

    it("should not call camera.moveDown on moveDown when camera pitch is smaller then rotate amount", () => {
      const cesiumCameraPitch = createCesiumMock({ cameraPitch: 1 }) as Viewer;
      viewerSubject.next(cesiumCameraPitch);

      const rotateDownButton = fixture.debugElement.query(
        By.css(".gc-controls-nav .cesium-control-bottom")
      );

      rotateDownButton.nativeElement.click();

      expect(cameraFixedSpy).not.toHaveBeenCalled();
      expect(cesiumCameraPitch.camera?.rotateUp).not.toHaveBeenCalled();
      expect(cesiumCameraPitch.camera?.lookAtTransform).not.toHaveBeenCalled();
    });
  });
});
