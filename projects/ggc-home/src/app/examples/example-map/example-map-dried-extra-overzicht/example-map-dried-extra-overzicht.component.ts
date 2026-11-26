import { AfterViewInit, Component, inject } from "@angular/core";
import { httpResource } from "@angular/common/http";
import { GgcMapComponent, GgcMapService, Webservice } from "@kadaster/ggc-map";
import { Webservice as Webservice3D } from "@kadaster/ggc-map-3d";
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
  GgcViewerService,
  GgcControlsComponent
} from "@kadaster/ggc-map-3d";
import proj4 from "proj4";
import { Polygon } from "ol/geom";
import { defs } from "@kadaster/ggc-models";

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

  private readonly mapService: GgcMapService = inject(GgcMapService);
  private readonly ggcViewerService = inject(GgcViewerService);

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

  private connectOverzichtKaart() {
    this.ggcViewerService.getCameraValuesObservable().subscribe(() => {
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
      this.mapIndexOverzichtkaart
    );
  }

  private handleMapEvent() {
    const corners = this.ggcViewerService.getCanvasCornerCoordinates();
    if (corners === undefined) return;

    const rdCorners = corners.map((corner) => {
      return proj4("EPSG:4326", defs, [corner!.longitude, corner!.latitude]);
    });

    const bboxFeature = new Feature({
      geometry: new Polygon([rdCorners])
    });

    this.mapService.clearSelectionLayer(this.mapIndexOverzichtkaart);
    this.mapService.addFeaturesToSelectionLayer(
      [bboxFeature],
      this.mapIndexOverzichtkaart
    );

    const geo = bboxFeature.getGeometry()!.clone();
    geo.scale(2.5);
    const polyExtent = geo.getExtent();
    this.mapService.zoomToExtent(polyExtent, {
      mapIndex: this.mapIndexOverzichtkaart
    });
  }
}
