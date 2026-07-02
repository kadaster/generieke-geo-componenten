import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ChangeDetectionStrategy
} from "@angular/core";
import {
  Camera,
  Cartesian3,
  CesiumTerrainProvider,
  DirectionalLight,
  HeadingPitchRange,
  Matrix4,
  TerrainProvider,
  Transforms
} from "@cesium/engine";
import { Viewer } from "@cesium/widgets";
import { Tiles3dLayerService } from "../layers/tiles3d-layer.service";
import { WmtsLayerService } from "../layers/wmts-layer.service";
import {
  cameraUtils,
  createFlyToOptions,
  getCameraValues
} from "../utils/camera-utils";
import { BehaviorSubject } from "rxjs";
import {
  CameraOptions,
  CameraPosition,
  CameraValues,
  GeoJsonConfig,
  LookAtObject,
  TilesetConfig,
  ViewerOptions,
  Webservice
} from "../model/interfaces";
import { CameraOptionsType } from "../model/enums";
import { CoreViewerService } from "../service/core-viewer.service";
import { CoreCameraService } from "../service/core-camera.service";
import { GeoJsonLayerService } from "../layers/geojson-layer.service";
import { GgcViewerService } from "../service/ggc-viewer.service";
import { CoreSelectionService } from "../service/core-selection.service";
import { GgcSharedLayerService } from "../layers/ggc-shared-layer.service";

//@ts-ignore
globalThis.CESIUM_BASE_URL = "/assets/cesium/";

/**
 * 3D viewer component op basis van Cesium.
 *
 * Dit component is de 3D kaartviewer binnen GGC en is verantwoordelijk voor:
 * - Initialiseren en configureren van de Cesium {@link Viewer};
 * - Laden en beheren van verschillende laagtypes (3D tiles, WMTS, GeoJSON, webservices);
 * - Afhandelen van camerabewegingen en emitten van {@link CameraValues};
 * - Ondersteunen van externe camera-aansturing via {@link CameraOptions};
 * - Instellen van licht, terrain en viewer opties;
 * - Keyboard-interactie (arrow keys voor camera rotatie).
 */
@Component({
  selector: "ggc-map-3d-viewer",
  templateUrl: "./ggc-viewer.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ["./ggc-viewer.component.scss"]
})
export class GgcViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  /**
   * Referentie naar het DOM element waarin de Cesium viewer wordt gerenderd.
   */
  @ViewChild("cesiumViewer") cesiumViewer!: ElementRef;

  /**
   * Event dat wordt geëmit zodra de viewer volledig geïnitialiseerd is.
   */
  @Output() ready: EventEmitter<null> = new EventEmitter<null>();

  /**
   * Event dat camerawaarden emit bij veranderingen.
   */
  @Output() cameraEvent: EventEmitter<CameraValues> =
    new EventEmitter<CameraValues>();

  /**
   * Event dat wordt geëmit bij een WebGL context fout.
   */
  @Output() webglErrorEvent: EventEmitter<Event> = new EventEmitter<Event>();

  /**
   * Configuratie voor de viewer, zoals terrain, UI instellingen en animatie.
   */
  @Input() viewerOptions: ViewerOptions;

  /**
   * ARIA rol voor toegankelijkheid (default: "application").
   */
  @Input() ariaRole = "application";

  /**
   * ARIA label voor toegankelijkheid (default: "viewer").
   */
  @Input() ariaLabel = "viewer";

  protected cesiumElementId = "CesiumContainerId";
  private readonly tiles3DService = inject(Tiles3dLayerService);
  private readonly wmtsService = inject(WmtsLayerService);
  private readonly coreViewerService = inject(CoreViewerService);
  private readonly viewerService = inject(GgcViewerService);
  private readonly coreSelectionService = inject(CoreSelectionService);
  private readonly coreCameraService = inject(CoreCameraService);
  private readonly geoJsonLayerService = inject(GeoJsonLayerService);
  private readonly ggcSharedLayerService = inject(GgcSharedLayerService);
  private viewer!: Viewer;
  private terrainProvider: TerrainProvider;
  private camera: Camera | undefined;
  private readonly previousCameraValues = new BehaviorSubject<CameraValues>(
    {} as CameraValues
  );

  private pHideLogo = false;
  private _webServices: Webservice[];
  private isInitialized = false;

  /**
   * CSS display waarde voor het tonen/verbergen van het logo.
   */
  @HostBinding("style.--displayLogo")
  get displayLogo(): string {
    return this.pHideLogo ? "none" : "block";
  }

  /**
   * Lijst met webservices die geladen moeten worden.
   *
   * @param webservices Array van {@link Webservice}
   */
  @Input()
  set webServices(webservices: Webservice[]) {
    this._webServices = webservices;
    if (this.isInitialized) {
      this.loadWebservices();
    }
  }

  /**
   * Verbergt het logo indien `true`.
   *
   * @param hideLogo Flag om logo te tonen/verbergen
   */
  @Input()
  set hideLogo(hideLogo: boolean) {
    this.pHideLogo = hideLogo;
  }

  /**
   * Camera configuratie voor het positioneren van de camera.
   *
   * @param cameraOptions {@link CameraOptions}
   */
  @Input()
  set cameraOptions(cameraOptions: CameraOptions) {
    this.flyTo(cameraOptions);
  }

  /**
   * Configuraties voor GeoJSON lagen.
   * Dit is aanvullend naast de opgegeven webServices.
   *
   * @param geojsonConfigs Array van {@link GeoJsonConfig}
   */
  @Input()
  set geoJsonConfigs(geojsonConfigs: GeoJsonConfig[]) {
    this.geoJsonLayerService.setConfigs(geojsonConfigs);
  }

  /**
   * Configuraties voor 3D tilesets.
   * Dit is aanvullend naast de opgegeven webServices.
   *
   * @param tilesetConfigs Array van {@link TilesetConfig}
   */
  @Input()
  set tilesetConfigs(tilesetConfigs: TilesetConfig[]) {
    this.tiles3DService.setConfigs(tilesetConfigs);
  }

  constructor() {
    this.previousCameraValues.subscribe((cameraValues: CameraValues) => {
      this.cameraEvent.emit(cameraValues);
      this.coreCameraService.setCameraValues(cameraValues);
    });
    this.coreViewerService.getViewerObservable().subscribe((viewer) => {
      this.camera = viewer?.camera;
    });
  }

  ngOnInit() {
    if (this.viewerOptions?.elementId) {
      this.cesiumElementId = this.viewerOptions.elementId;
    }
    this.loadWebservices();
  }

  ngAfterViewInit(): void {
    this.initViewer().then(() => {
      this.init();
      this.flyTo(this.cameraOptions);
      this.setCameraLogger();
      this.loadWebservices();
      this.isInitialized = true;
    });
  }

  ngOnDestroy(): void {
    this.tiles3DService.destroyLayers();
    this.wmtsService.destroyLayers();
    this.geoJsonLayerService.destroyLayers();
    this.coreViewerService.setViewer(undefined);
    this.coreSelectionService.destroyAllSelections();
  }

  private loadWebservices() {
    if (this._webServices) {
      this.ggcSharedLayerService.loadWebservices(this._webServices);
    }
  }

  private setCameraLogger() {
    this.viewer.camera.percentageChanged = 0.1;
    this.viewer.camera.changed.addEventListener(() =>
      this.updateCameraValues()
    );
    this.viewer.camera.moveEnd.addEventListener(() =>
      this.updateCameraValues()
    );
  }

  private updateCameraValues() {
    const cameraValues = getCameraValues(this.viewer.camera, this.viewer);
    if (
      JSON.stringify(this.previousCameraValues.getValue()) !==
      JSON.stringify(cameraValues)
    ) {
      this.previousCameraValues.next(cameraValues);
    }
  }

  private async initViewer() {
    this.viewer = await this.createViewer();
    this.addWebGLEventListener();
  }

  private addWebGLEventListener() {
    const canvas = document.querySelector(`#${this.cesiumElementId} canvas`);
    if (canvas) {
      canvas.addEventListener(
        "webglcontextlost",
        (event: Event) => {
          this.webglErrorEvent.emit(event);
          event.preventDefault();
        },
        false
      );
    } else {
      console.error("Canvas element not found.");
    }
  }

  private init() {
    this.initLight();
    this.tiles3DService.setLayers(this.viewer.scene.primitives);
    this.wmtsService.setLayers(this.viewer.scene.imageryLayers);
    this.geoJsonLayerService.setLayers(this.viewer.dataSources);
    this.coreViewerService.setViewer(this.viewer);
    this.ready.emit();
    this.requestRender();
  }

  private requestRender() {
    this.viewer.scene.requestRender();
  }

  private async createViewer(): Promise<Viewer> {
    let terrainUrl;

    if (this.viewerOptions?.terrainModelUrl) {
      terrainUrl = this.viewerOptions.terrainModelUrl;
    } else {
      terrainUrl = undefined;
    }
    if (terrainUrl) {
      try {
        this.terrainProvider = await CesiumTerrainProvider.fromUrl(terrainUrl);
      } catch (error) {
        console.log(
          "Fout bij het laden van de TerrainProvider met terrainModelurl: " +
            terrainUrl +
            ". Error: " +
            error
        );
      }
    }
    return new Viewer(this.cesiumElementId, {
      terrainProvider: this.terrainProvider,
      baseLayer: false,
      animation: this.viewerOptions?.animation ?? false,
      baseLayerPicker: false,
      fullscreenButton: false,
      vrButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: this.viewerOptions?.timeline ?? false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      requestRenderMode: false
    } as Viewer.ConstructorOptions);
  }

  private initLight() {
    if (this.viewerOptions?.directionalLightOptions) {
      const { direction, ...rest } = this.viewerOptions.directionalLightOptions;

      const options = {
        direction:
          direction === "cameraDirection"
            ? this.viewer.scene.camera.directionWC
            : direction,
        ...rest
      };

      if (direction === "cameraDirection") {
        // add eventListener to update the direction of the light
        this.viewer.scene.preRender.addEventListener((scene) => {
          scene.light.direction = Cartesian3.clone(
            scene.camera.directionWC,
            scene.light.direction
          );
        });
      }

      this.viewer.scene.light = new DirectionalLight(options);
    }
  }

  private async flyTo(cameraOptions: CameraOptions) {
    if (!this.viewer?.camera || cameraOptions === undefined) {
      return;
    }
    const optionsType: CameraOptionsType = this.getOptionsType(cameraOptions);
    switch (optionsType) {
      case CameraOptionsType.LookAtObject: {
        const extent = this.viewerService.getExtent(
          (cameraOptions as LookAtObject).geojson
        );
        const center = this.viewerService.getCenter(extent);
        const distance = this.viewerService.calculateDistance(extent);
        this.viewer.camera.lookAtTransform(
          Transforms.eastNorthUpToFixedFrame(center),
          new HeadingPitchRange(0, -Math.PI / 8, distance)
        );
        this.viewer.camera.lookAtTransform(Matrix4.IDENTITY);
        break;
      }
      case CameraOptionsType.CameraPosition: {
        this.viewer.camera.flyTo(
          createFlyToOptions(cameraOptions as CameraPosition)
        );
        this.viewer.camera.lookAtTransform(Matrix4.IDENTITY);
        break;
      }
      case CameraOptionsType.LookAtPosition: {
        await cameraUtils.flyToLookAtPosition(cameraOptions, this.viewer);
        break;
      }
      case CameraOptionsType.None:
      default:
        break;
    }
  }

  /**
   * Bepaalt het type camera opties.
   *
   * @param cameraOptions {@link CameraOptions}
   * @returns {@link CameraOptionsType}
   */
  public getOptionsType(cameraOptions: CameraOptions): CameraOptionsType {
    let type = CameraOptionsType.None;
    if (Object.hasOwn(cameraOptions, "geojson")) {
      type = CameraOptionsType.LookAtObject;
    } else if (Object.hasOwn(cameraOptions, "cameraPosition")) {
      type = CameraOptionsType.CameraPosition;
    } else if (Object.hasOwn(cameraOptions, "lookAtPosition")) {
      type = CameraOptionsType.LookAtPosition;
    }
    return type;
  }

  /**
   * Zet de focus op het viewer element.
   */
  getFocus() {
    this.cesiumViewer.nativeElement.focus();
  }

  /**
   * Keyboard handler voor camera interactie met arrow keys.
   *
   * @param event Keyboard event
   */
  onKeyDown(event: KeyboardEvent) {
    const key = event.key;

    if (!this.camera || !this.isArrowKey(key)) {
      return;
    }

    event.preventDefault();

    switch (key) {
      case "ArrowUp":
        this.camera.lookUp();
        return;
      case "ArrowRight":
        this.camera.lookRight();
        return;
      case "ArrowDown":
        this.camera.lookDown();
        return;
      case "ArrowLeft":
        this.camera.lookLeft();
        return;
    }
  }

  private isArrowKey(key: string): boolean {
    return (
      key === "ArrowUp" ||
      key === "ArrowDown" ||
      key === "ArrowLeft" ||
      key === "ArrowRight"
    );
  }
}
