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

/**
 * Component dat standaard camerabedieningsknoppen aanbiedt voor de Cesium viewer.
 *
 * Met dit component kan de gebruiker:
 * - vooruit en achteruit bewegen;
 * - de camera roteren (links, rechts, omhoog, omlaag);
 * - de camera terugzetten naar een standaard "look at" positie.
 */
@Component({
  selector: "ggc-cesium-controls",
  templateUrl: "./ggc-controls.component.html",
  styleUrls: ["./ggc-controls.component.scss"],
  imports: [NgClass]
})
export class GgcControlsComponent {
  /**
   * CSS class voor het icoon dat gebruikt wordt voor "omhoog bewegen".
   */
  @Input() upIcon = "fa-sharp fa-light fa-arrow-up-to-line";
  /**
   * CSS class voor het icoon dat gebruikt wordt voor "links roteren".
   */
  @Input() leftIcon = "fa-sharp fa-light fa-rotate-left";
  /**
   * CSS class voor het icoon dat gebruikt wordt voor "rechts roteren".
   */
  @Input() rightIcon = "fa-sharp fa-light fa-rotate-right";
  /**
   * CSS class voor het icoon dat gebruikt wordt voor "omlaag bewegen".
   */
  @Input() downIcon = "fa-sharp fa-light fa-arrow-down-to-line";
  /**
   * CSS class voor het icoon dat gebruikt wordt voor "inzoomen".
   */
  @Input() plusIcon = "fal fa-plus";
  /**
   * CSS class voor het icoon dat gebruikt wordt voor "uitzoomen".
   */
  @Input() minusIcon = "fal fa-minus";
  /**
   * CSS class voor het icoon dat gebruikt wordt voor het resetten naar de standaard camerastand.
   */
  @Input() defaultCameraPosition = "fal fa-eye";

  private readonly coreViewerService = inject(CoreViewerService);
  private readonly viewerService = inject(GgcViewerService);
  private viewer: Viewer | undefined;
  private camera: Camera | undefined;
  private ellipsoid: Ellipsoid | undefined;
  private readonly rotateAngle = 0.05;

  constructor() {
    this.coreViewerService.getViewerObservable().subscribe((viewer) => {
      this.viewer = viewer;
      this.camera = viewer?.camera;
      this.ellipsoid = viewer?.scene?.globe?.ellipsoid;
    });
  }

  /**
   * Beweegt de camera voorwaarts op basis van de huidige hoogte.
   */
  moveForward() {
    if (this.camera) {
      this.camera.moveForward(this.getMoveRate());
    }
  }

  /**
   * Beweegt de camera achterwaarts op basis van de huidige hoogte.
   */
  moveBackward() {
    if (this.camera) {
      this.camera.moveBackward(this.getMoveRate());
    }
  }

  /**
   * Roteert de camera omhoog rondom het huidige look-at punt.
   */
  rotateUp() {
    if (this.camera && this.viewer) {
      if (this.setCameraFixed()) {
        this.camera?.rotateDown(this.rotateAngle);
        this.camera.lookAtTransform(Matrix4.IDENTITY);
      }
    }
  }

  /**
   * Roteert de camera naar links rondom het huidige look-at punt.
   */
  rotateLeft() {
    if (this.camera && this.viewer) {
      if (this.setCameraFixed()) {
        this.camera?.rotateLeft(this.rotateAngle);
        this.camera.lookAtTransform(Matrix4.IDENTITY);
      }
    }
  }

  /**
   * Roteert de camera naar rechts rondom het huidige look-at punt.
   */
  rotateRight() {
    if (this.camera && this.viewer) {
      if (this.setCameraFixed()) {
        this.camera.rotateRight(this.rotateAngle);
        this.camera.lookAtTransform(Matrix4.IDENTITY);
      }
    }
  }

  /**
   * Roteert de camera omlaag rondom het huidige look-at punt.
   *
   * De rotatie wordt beperkt zodat de camera niet onder de horizon komt.
   */
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

  /**
   * Berekent de bewegingssnelheid van de camera op basis van de hoogte.
   * @returns De move rate (afstand per beweging), of `undefined` wanneer niet beschikbaar
   */
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

  /**
   * Zet de camera tijdelijk vast op het punt waar de camera naar kijkt,
   * zodat rotaties plaatsvinden rondom dit punt.
   * @returns `true` wanneer het fixeren gelukt is, anders `false`
   */
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

  /**
   * Zet de camera terug naar de standaard "look at" positie.
   *
   * Indien er geen huidige positie beschikbaar is via {@link GgcViewerService},
   * wordt de {@link DEFAULT_POSITIONSHIFT} gebruikt.
   *
   * @returns Promise die voltooid wanneer de camera animatie klaar is
   */
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
