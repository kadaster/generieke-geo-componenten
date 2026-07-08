import { Component, inject, ViewEncapsulation } from "@angular/core";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";
import {
  CameraOptions,
  cameraOptionsTorentjeDenHaag,
  CameraValues,
  GgcControlsComponent,
  GgcViewerComponent,
  TilesetConfig,
  ViewerOptions,
  Webservice
} from "@kadaster/ggc-map-3d";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { HttpClient } from "@angular/common/http";
import { ViewerType } from "@kadaster/ggc-models";
import { GgcDatasetTreeComponent, Theme } from "@kadaster/ggc-dataset-tree";

@Component({
  selector: "ggc-example-3d-layer-camera-options",
  templateUrl: "./example3d-layer-camera-options.component.html",
  styleUrl: "./example3d-layer-camera-options.component.scss",
  imports: [
    GgcViewerComponent,
    GgcControlsComponent,
    ExampleFormatComponent,
    GgcDatasetTreeComponent
  ],
  encapsulation: ViewEncapsulation.None
})
export class Example3dLayerCameraOptionsComponent {
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/example-3d-layer-camera-options",
    title: "Zichtbaarheid kaartlaag instellen (3D)",
    introduction: "Camera opties instellen voor een kaartlaag in een 3D kaart.",
    components: [Components.GGC_3D, Components.GGC_DATASET_TREE],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER, Tags.DATASET, Tags.OGC_API, Tags.DRIED],
    imageLocation:
      "code/examples/example-3d/example-3d-layer-camera-options/example-3d-layer-camera-options.png"
  };

  urlComponentModule =
    "example-3d/example-3d-layer-camera-options/example3d-layer-camera-options.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/modules/ggc-map_src_public-api.html`;
  // DOCS-SKIP:END

  protected cameraOptions: CameraOptions;
  protected webService: Webservice[];
  protected datasetTreeConfig: Theme[];
  protected viewerOptions: ViewerOptions = {
    elementId: "cesium-layer-camera-options",
    terrainModelUrl:
      "https://api.pdok.nl/kadaster/3d-basisvoorziening/ogc/v1/collections/digitaalterreinmodel/quantized-mesh",
    directionalLightOptions: {
      direction: "cameraDirection",
      intensity: 2.5
    }
  };

  protected viewerType = ViewerType.DRIE_D;

  protected kaartConfig =
    "code/examples/example-3d/example-3d-layer-camera-options/kaartconfig.json";

  protected tilesetConfigs: TilesetConfig[] = [
    {
      layerId: "3d-buildings",
      cameraValuesShowFunction: (cameraValues: CameraValues) => {
        return cameraValues?.cameraPosition?.alt
          ? cameraValues?.cameraPosition?.alt < 500 &&
              cameraValues?.cameraPosition?.alt > 100
          : false;
      }
    }
  ];

  private readonly httpClient = inject(HttpClient);

  constructor() {
    this.httpClient.get(this.kaartConfig).subscribe((data) => {
      this.webService = data as Webservice[];
    });
    this.httpClient
      .get(
        "code/examples/example-3d/example-3d-layer-camera-options/treeconfig.json"
      )
      .subscribe((data) => {
        this.datasetTreeConfig = data as Theme[];
      });
  }

  public onCesiumReady() {
    // zoom to Torentje
    setTimeout(() => {
      this.cameraOptions = cameraOptionsTorentjeDenHaag;
    });
  }
}
