import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  HostBinding,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
  viewChild
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
 *
 * @example
 * kaartConfig = [
 *     {
 *       "url": "https://api.pdok.nl/kadaster/3d-basisvoorziening/ogc/v1_0/collections/terreinen/3dtiles",
 *       "type": "3Dtiles",
 *       "layers": [
 *         {
 *           "title": "3D terrein",
 *           "layerId": "3d-terrain",
 *           "legendUrl": ""
 *         }
 *       ]
 *     }
 * ];
 *
 * <div style="height: 500px">
 *   <ggc-map-3d-viewer
 *      [viewerOptions]="viewerOptions"
 *      [cameraOptions]="cameraOptions"
 *      (ready)="onCesiumReady()"
 *      [webServices]="webService"
 *   ></ggc-map-3d-viewer>
 * </div>
 */
@Component({
  selector: "ggc-map-3d-viewer",
  templateUrl: "./ggc-viewer.component.html",
  styleUrls: ["./ggc-viewer.component.scss"]
})
export class GgcViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  /**
   * Referentie naar het DOM element waarin de Cesium viewer wordt gerenderd.
   */
  cesiumViewer = viewChild.required<ElementRef>("cesiumViewer");

  /**
   * Event dat wordt geëmit zodra de viewer volledig geïnitialiseerd is.
   */
  ready = output<void>();

  /**
   * Event dat camerawaarden emit bij veranderingen.
   */
  cameraEvent = output<CameraValues>();

  /**
   * Event dat wordt geëmit bij een WebGL context fout.
   */
  webglErrorEvent = output<Event>();

  /**
   * Configuratie voor de viewer, zoals terrain, UI instellingen en animatie.
   */
  viewerOptions = input<ViewerOptions>();

  /**
   * ARIA rol voor toegankelijkheid (default: "application").
   */
  ariaRole = input("application");

  /**
   * ARIA label voor toegankelijkheid (default: "viewer").
   */
  ariaLabel = input("viewer");

  /**
   * Verbergt het logo indien `true`.
   */
  hideLogo = input(false);

  /**
   * Lijst met webservices die geladen moeten worden.
   */
  webServices = input<Webservice[]>();

  /**
   * Camera configuratie voor het positioneren van de camera.
   */
  cameraOptions = input<CameraOptions>();

  /**
   * Configuraties voor GeoJSON lagen.
   * Dit is aanvullend naast de opgegeven webServices.
   */
  geoJsonConfigs = input<GeoJsonConfig[]>();

  /**
   * Configuraties voor 3D tilesets.
   * Dit is aanvullend naast de opgegeven webServices.
   */
  tilesetConfigs = input<TilesetConfig[]>();

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

  /**
   * Geeft aan of de viewer volledig geïnitialiseerd is. Wordt gebruikt om
   * side effects die afhankelijk zijn van de viewer (webservices laden,
   * camera aansturen) pas uit te voeren nadat de viewer klaar is.
   */
  private readonly isInitialized = signal(false);

  /**
   * CSS display waarde voor het tonen/verbergen van het logo.
   */
  @HostBinding("style.--displayLogo")
  get displayLogo(): string {
    return this.hideLogo() ? "none" : "block";
  }

  constructor() {
    this.previousCameraValues.subscribe((cameraValues: CameraValues) => {
      this.cameraEvent.emit(cameraValues);
      this.coreCameraService.setCameraValues(cameraValues);
    });
    this.coreViewerService.getViewerObservable().subscribe((viewer) => {
      this.camera = viewer?.camera;
    });

    // Webservices pas laden zodra de viewer geïnitialiseerd is, en opnieuw
    // laden bij elke wijziging van de input.
    effect(() => {
      const webServices = this.webServices();
      if (this.isInitialized() && webServices) {
        this.ggcSharedLayerService.loadWebservices(webServices);
      }
    });

    // Camera pas aansturen zodra de viewer geïnitialiseerd is, en opnieuw
    // bij elke wijziging van de input.
    effect(() => {
      const cameraOptions = this.cameraOptions();
      if (this.isInitialized() && cameraOptions) {
        this.flyTo(cameraOptions);
      }
    });

    effect(() => {
      const geoJsonConfigs = this.geoJsonConfigs();
      if (geoJsonConfigs) {
        this.geoJsonLayerService.setConfigs(geoJsonConfigs);
      }
    });

    effect(() => {
      const tilesetConfigs = this.tilesetConfigs();
      if (tilesetConfigs) {
        this.tiles3DService.setConfigs(tilesetConfigs);
      }
    });
  }

  ngOnInit() {
    const options = this.viewerOptions();
    if (options?.elementId) {
      this.cesiumElementId = options.elementId;
    }
  }

  ngAfterViewInit(): void {
    this.initViewer().then(() => {
      this.init();
      this.setCameraLogger();
      // Triggert de webServices/cameraOptions effects met de huidige
      // input-waarden, nu de viewer klaar is.
      this.isInitialized.set(true);
    });
  }

  ngOnDestroy(): void {
    this.tiles3DService.destroyLayers();
    this.wmtsService.destroyLayers();
    this.geoJsonLayerService.destroyLayers();
    this.coreViewerService.setViewer(undefined);
    this.coreSelectionService.destroyAllSelections();
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
    const options = this.viewerOptions();

    if (options?.terrainModelUrl) {
      terrainUrl = options.terrainModelUrl;
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
      animation: this.viewerOptions()?.animation ?? false,
      baseLayerPicker: false,
      fullscreenButton: false,
      vrButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: this.viewerOptions()?.timeline ?? false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      requestRenderMode: false
    } as Viewer.ConstructorOptions);
  }

  private initLight() {
    const viewerOptions = this.viewerOptions();
    if (viewerOptions?.directionalLightOptions) {
      const { direction, ...rest } = viewerOptions.directionalLightOptions;

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

  private async flyTo(cameraOptions: CameraOptions | undefined) {
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
    this.cesiumViewer().nativeElement.focus();
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
