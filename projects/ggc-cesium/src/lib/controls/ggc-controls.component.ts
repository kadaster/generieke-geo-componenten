import { Component, inject, Input } from "@angular/core";
import { Camera, Ellipsoid, Matrix4, Transforms } from "@cesium/engine";
import { CoreViewerService } from "../service/core-viewer.service";
import { LookAtPosition } from "../model/interfaces";
import {
  cameraUtils,
  DEFAULT_POSITIONSHIFT,
  getLookAtCartesian
} from "../utils/camera-utils";
import { Viewer } from "@cesium/widgets";
import { GgcViewerService } from "../service/ggc-viewer.service";
import { NgClass } from "@angular/common";

@Component({
  selector: "ggc-cesium-controls",
  templateUrl: "./ggc-controls.component.html",
  styleUrls: ["./ggc-controls.component.scss"],
  imports: [NgClass]
})
export class GgcControlsComponent {
  @Input() upIcon = "fa-sharp fa-light fa-arrow-up-to-line";
  @Input() leftIcon = "fa-sharp fa-light fa-rotate-left";
  @Input() rightIcon = "fa-sharp fa-light fa-rotate-right";
  @Input() downIcon = "fa-sharp fa-light fa-arrow-down-to-line";
  @Input() plusIcon = "fal fa-plus";
  @Input() minusIcon = "fal fa-minus";
  @Input() defaultCameraPosition = "fal fa-eye";

  private coreViewerService = inject(CoreViewerService);
  private viewerService = inject(GgcViewerService);
  private viewer: Viewer | undefined;
  private camera: Camera | undefined;
  private ellipsoid: Ellipsoid | undefined;
  private rotateAngle = 0.05;

  constructor() {
    this.coreViewerService.getViewerObservable().subscribe((viewer) => {
      this.viewer = viewer;
      this.camera = viewer?.camera;
      this.ellipsoid = viewer?.scene?.globe?.ellipsoid;
    });
  }

  moveForward() {
    if (this.camera) {
      this.camera.moveForward(this.getMoveRate());
    }
  }

  moveBackward() {
    if (this.camera) {
      this.camera.moveBackward(this.getMoveRate());
    }
  }

  rotateUp() {
    if (this.camera && this.viewer) {
      if (this.setCameraFixed()) {
        this.camera?.rotateDown(this.rotateAngle);
        this.camera.lookAtTransform(Matrix4.IDENTITY);
      }
    }
  }

  rotateLeft() {
    if (this.camera && this.viewer) {
      if (this.setCameraFixed()) {
        this.camera?.rotateLeft(this.rotateAngle);
        this.camera.lookAtTransform(Matrix4.IDENTITY);
      }
    }
  }

  rotateRight() {
    if (this.camera && this.viewer) {
      if (this.setCameraFixed()) {
        this.camera.rotateRight(this.rotateAngle);
        this.camera.lookAtTransform(Matrix4.IDENTITY);
      }
    }
  }

  rotateDown() {
    if (this.camera && this.viewer) {
      if (this.camera.pitch < -this.rotateAngle) {
        if (this.setCameraFixed()) {
          this.camera?.rotateUp(this.rotateAngle);
          this.camera.lookAtTransform(Matrix4.IDENTITY);
        }
      }
    }
  }

  private getMoveRate(): number | undefined {
    let moveRate: number | undefined;
    if (this.camera && this.ellipsoid) {
      const cameraHeight = this.ellipsoid.cartesianToCartographic(
        this.camera.position
      ).height;
      moveRate = cameraHeight / 4;
    }
    return moveRate;
  }

  private setCameraFixed(): boolean {
    let isCameraFixed = false;
    if (this.camera && this.viewer) {
      const intersectionPoint = getLookAtCartesian(this.camera, this.viewer);
      if (intersectionPoint) {
        const transform = Transforms.eastNorthUpToFixedFrame(intersectionPoint);
        this.viewer.camera.lookAtTransform(transform);
        isCameraFixed = true;
      }
    }
    return isCameraFixed;
  }

  async setCameraPositionToDefault() {
    if (this.camera && this.viewer) {
      const position =
        this.viewerService.getCurrentCameraValues()?.lookAtPosition;
      const cameraOptions: LookAtPosition = {
        lookAtPosition: {
          lat: position?.lat ?? DEFAULT_POSITIONSHIFT.lat,
          lon: position?.lon ?? DEFAULT_POSITIONSHIFT.lon
        }
      };
      await cameraUtils.flyToLookAtPosition(cameraOptions, this.viewer);
    }
  }
}
