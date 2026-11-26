import { AfterViewInit, Component, DestroyRef, inject } from "@angular/core";
import { httpResource } from "@angular/common/http";
import { GgcMapComponent, GgcMapService, Webservice } from "@kadaster/ggc-map";
import {
  CameraOptions,
  cameraOptionsTorentjeDenHaag,
  GgcControlsComponent,
  GgcViewerComponent,
  GgcViewerService,
  ViewerOptions,
  Webservice as Webservice3D
} from "@kadaster/ggc-map-3d";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";
import Feature from "ol/Feature";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import proj4 from "proj4";
import { Polygon } from "ol/geom";
import { defs } from "@kadaster/ggc-models";
import {
  animationFrames,
  animationFrameScheduler,
  defaultIfEmpty,
  filter,
  map,
  switchMap,
  take,
  throttleTime
} from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: "ggc-home-example-map-dried-extra-overzicht",
  imports: [
    GgcMapComponent,
    ExampleFormatComponent,
    GgcViewerComponent,
    GgcControlsComponent
  ],
  templateUrl: "./example-map-dried-extra-overzicht.component.html",
  styleUrl: "./example-map-dried-extra-overzicht.component.scss"
})
export class ExampleMapDriedExtraOverzichtComponent
  extends ExampleFormatComponent
  implements AfterViewInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/map-dried-extra-overzicht",
    title: "Overzichtskaart toevoegen (3D)",
    introduction:
      "Voeg een kleine overzichtskaart toe aan de 3D kaart om de positie op de kaart te tonen.",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER, Tags.DRIED],
    imageLocation:
      "code/examples/example-map/example-map-dried-extra-overzicht/example-map-dried-extra-overzicht.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-map/example-map-dried-extra-overzicht/example-map-dried-extra-overzicht.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/interfaces/ggc-map_src_public-api.WmtsLayerOptions.html`;
  // DOCS-SKIP:END
  protected readonly mapConfig = httpResource<Webservice3D[]>(
    () =>
      "code/examples/example-map/example-map-dried-extra-overzicht/kaartconfig.json"
  );
  protected readonly mapConfigOverzichtkaart = httpResource<Webservice[]>(
    () =>
      "code/examples/example-map/example-map-dried-extra-overzicht/kaartconfig-overzicht.json"
  );
  protected mapIndex = "index-kaart";
  protected mapIndexOverzichtkaart = "index-kaart-overzicht";

  protected cameraOptions: CameraOptions;
  protected viewerOptions: ViewerOptions = {
    elementId: "cesium-basic",
    terrainModelUrl:
      "https://api.pdok.nl/kadaster/3d-basisvoorziening/ogc/v1/collections/digitaalterreinmodel/quantized-mesh",
    directionalLightOptions: {
      direction: "cameraDirection",
      intensity: 2.5
    }
  };

  private readonly componentDestroyRef = inject(DestroyRef);
  private readonly ggcViewerService = inject(GgcViewerService);
  private readonly mapService: GgcMapService = inject(GgcMapService);
  private bboxFeature: Feature<Polygon> | undefined;

  ngAfterViewInit() {
    this.connectOverzichtKaart();
    this.setBoxStyle();

    void this.mapService.zoomToCoordinate([155000, 463000], this.mapIndex, 2);
  }

  public onCesiumReady() {
    setTimeout(() => {
      this.cameraOptions = cameraOptionsTorentjeDenHaag;
    });
  }

  private connectOverzichtKaart(): void {
    this.createCornerCoordinatesStream()
      .pipe(takeUntilDestroyed(this.componentDestroyRef))
      .subscribe((corners) => {
        if (corners === undefined) {
          this.handleNoCorners();
          return;
        }

        this.setOverzichtkaartGreyedOut(false);
        const rdCorners = this.toRdCorners(corners);

        this.zoomOverzichtkaartToScaledBbox(rdCorners);
      });
  }

  private createCornerCoordinatesStream() {
    return this.ggcViewerService.getCameraValuesObservable().pipe(
      // Beperk het aantal camera-events tot ongeveer twee updates per frame
      throttleTime(8, animationFrameScheduler, {
        leading: true,
        trailing: true
      }),
      // Start hoekbepaling opnieuw bij elke nieuwe camerastand. Probeer voor maximaal 3 frames geldige hoeken te berekenen.
      switchMap(() =>
        animationFrames().pipe(
          take(3),
          map(() => this.ggcViewerService.getCanvasCornerCoordinates()),
          filter((corners) => corners !== undefined),
          take(1),
          defaultIfEmpty(undefined)
        )
      )
    );
  }

  private handleNoCorners(): void {
    this.setOverzichtkaartGreyedOut(true);

    if (!this.bboxFeature) {
      return;
    }

    this.mapService.clearSelectionLayer(this.mapIndexOverzichtkaart);
    this.bboxFeature = undefined;
  }

  private setBoxStyle() {
    const stroke = new Stroke({
      color: "#0093be",
      width: 3
    });
    const selectionStyle = new Style({
      stroke
    });
    this.mapService.changeSelectionLayerStyle(
      selectionStyle,
      this.mapIndexOverzichtkaart
    );
  }

  private setOverzichtkaartGreyedOut(greyedOut: boolean) {
    const mapTargetElement = this.mapService
      .getMap(this.mapIndexOverzichtkaart)
      .getTargetElement();

    mapTargetElement.style.filter = greyedOut
      ? "grayscale(1) brightness(0.75)"
      : "none";
  }

  private toRdCorners(
    corners: {
      longitude: number;
      latitude: number;
    }[]
  ): [number, number][] {
    return corners.map((corner) => {
      const projected = proj4("EPSG:4326", defs, [
        corner.longitude,
        corner.latitude
      ]);

      return [projected[0], projected[1]];
    });
  }

  private zoomOverzichtkaartToScaledBbox(rdCorners: [number, number][]): void {
    if (this.bboxFeature) {
      this.bboxFeature.getGeometry()?.setCoordinates([rdCorners]);
    } else {
      this.bboxFeature = new Feature({
        geometry: new Polygon([rdCorners])
      });

      this.mapService.addFeaturesToSelectionLayer(
        [this.bboxFeature],
        this.mapIndexOverzichtkaart
      );
    }

    const bboxGeometry = this.bboxFeature?.getGeometry();
    if (!bboxGeometry) {
      return;
    }

    const bboxClone = bboxGeometry.clone();
    bboxClone.scale(2.5);

    this.mapService.zoomToExtent(bboxClone.getExtent(), {
      mapIndex: this.mapIndexOverzichtkaart
    });
  }
}
