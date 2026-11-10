import { AfterViewInit, Component, inject, OnInit } from "@angular/core";
import { GgcMapComponent, GgcMapService, Webservice } from "@kadaster/ggc-map";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";
import Feature from "ol/Feature";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import {
  CameraOptions,
  cameraOptionsTorentjeDenHaag,
  GgcViewerComponent,
  ViewerOptions,
  GgcViewerService
} from "@kadaster/ggc-map-3d";
import { CoreCameraService } from "@kadaster/ggc-map-3d/src/lib/service/core-camera.service";
import { CoreViewerService } from "@kadaster/ggc-map-3d/src/lib/service/core-viewer.service";
import proj4 from "proj4";
import { Polygon } from "ol/geom";
import { defs } from "@kadaster/ggc-models";
import { from } from "rxjs";

@Component({
  selector: "ggc-home-example-map-dried-extra-overzicht-location",
  imports: [GgcMapComponent, ExampleFormatComponent, GgcViewerComponent],
  templateUrl: "./example-map-dried-extra-overzicht.component.html",
  styleUrl: "./example-map-dried-extra-overzicht.component.scss"
})
export class ExampleMapDriedExtraOverzichtComponent
  extends ExampleFormatComponent
  implements OnInit, AfterViewInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/map-dried-extra-overzicht",
    title: "Experiment Innovation day 3D",
    introduction:
      "Voeg een afbeelding als laag toe aan de kaart met Web Map Tile Service (WMTS).",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER],
    imageLocation:
      "code/examples/example-layer/example-map-dried-extra-overzicht/example-map-dried-extra-overzicht.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-map/example-map-dried-extra-overzicht/example-map-dried-extra-overzicht.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/interfaces/ggc-map_src_public-api.WmtsLayerOptions.html`;
  // DOCS-SKIP:END
  protected mapConfig: any;
  protected mapConfigOverzicht: Webservice[];
  protected mapIndex = "index-kaart";
  protected mapIndexOverzicht = "index-kaart-overzicht";

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

  private readonly mapService: GgcMapService = inject(GgcMapService);
  private readonly map3dCameraService = inject(CoreCameraService);
  private readonly viewerService = inject(CoreViewerService);
  private readonly ggcViewerService = inject(GgcViewerService);

  ngOnInit() {
    this.httpClient
      .get(
        "code/examples/example-map/example-map-dried-extra-overzicht/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data;
      });
    this.httpClient
      .get(
        "code/examples/example-map/example-map-dried-extra-overzicht/kaartconfig-overzicht.json"
      )
      .subscribe((data) => {
        this.mapConfigOverzicht = data as Webservice[];
      });
  }

  ngAfterViewInit() {
    this.removeZoomInteractions(this.mapIndexOverzicht);
    this.removeZoomButtons(this.mapIndexOverzicht);

    this.connectOverzichtKaart();
    this.setBoxStyle();

    void this.mapService.zoomToCoordinate([155000, 463000], this.mapIndex, 2);
  }

  public onCesiumReady() {
    setTimeout(() => {
      this.cameraOptions = cameraOptionsTorentjeDenHaag;
    });
  }

  private connectOverzichtKaart() {
    this.map3dCameraService.getCameraValuesObservable().subscribe(() => {
      this.handleMapEvent();
    });
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
      this.mapIndexOverzicht
    );
  }

  private handleMapEvent() {
    const viewer = this.viewerService.getViewer();
    if (viewer) {
      const corners = this.ggcViewerService.getCanvasCornerCoordinates(viewer);
      if (corners === undefined) {
        return;
      }

      const rdCorners = corners.map((corner) => {
        return this.wgs84ToRd(corner!.longitude, corner!.latitude);
      });

      const bboxFeature = new Feature({
        geometry: new Polygon([rdCorners])
      });

      this.mapService.clearSelectionLayer(this.mapIndexOverzicht);
      this.mapService.addFeaturesToSelectionLayer(
        [bboxFeature],
        this.mapIndexOverzicht
      );

      const geo = bboxFeature.getGeometry()!.clone();
      geo.scale(2.5);
      const polyExtent = geo.getExtent();
      this.mapService.zoomToExtent(polyExtent, {
        mapIndex: this.mapIndexOverzicht
      });
    }
  }

  private wgs84ToRd(lon: number, lat: number): [number, number] {
    return proj4("EPSG:4326", defs, [lon, lat]);
  }

  private removeZoomButtons(mapIndex: string) {
    const map = this.mapService.getMap(mapIndex);
    const controls = map.getControls();
    controls.clear();
  }

  private removeZoomInteractions(mapIndex: string) {
    const mapOverzicht = this.mapService.getMap(mapIndex);
    const interactions = mapOverzicht.getInteractions();
    interactions.clear();
  }
}
