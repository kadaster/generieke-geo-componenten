import { Component, inject, ViewEncapsulation } from "@angular/core";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import {
  CameraOptions,
  cameraOptionsTorentjeDenHaag,
  GgcControlsComponent,
  GgcViewerComponent,
  ViewerOptions,
  Webservice
} from "@kadaster/ggc-cesium";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { HttpClient } from "@angular/common/http";
import { ViewerType } from "@kadaster/ggc-models";
import {
  DatasetSwitcherButton,
  GgcDatasetSwitcherComponent,
  Theme
} from "@kadaster/ggc-dataset-tree";

@Component({
  selector: "app-example-3d-dataset-switcher",
  templateUrl: "./example3d-dataset-switcher.component.html",
  styleUrl: "./example3d-dataset-switcher.component.scss",
  imports: [
    GgcViewerComponent,
    GgcControlsComponent,
    ExampleFormatComponent,
    GgcDatasetSwitcherComponent
  ],
  encapsulation: ViewEncapsulation.None
})
export class Example3dDatasetSwitcherComponent {
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/example-3d-dataset-switcher",
    title: "3D kaart met dataset switcher",
    introduction: "Weergave van een 3D kaart met een dataset-switcher",
    components: [Components.GGC_3D, Components.GGC_DATASET_SWITCHER],
    theme: [Themes.DRIED],
    tags: [],
    imageLocation:
      "code/examples/example-3d/example-3d-dataset-switcher/example-3d-dataset-switcher.png"
  } as ComponentInfo;

  urlComponentModule =
    "example-3d/example-3d-dataset-switcher/example3d-dataset-switcher.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/modules/ggc-map_src_public-api.html`;
  // DOCS-SKIP:END

  protected cameraOptions: CameraOptions;
  protected webService: Webservice[];
  protected viewerOptions: ViewerOptions = {
    elementId: "cesium-dataset-switcher",
    terrainModelUrl:
      "https://api.pdok.nl/kadaster/3d-basisvoorziening/ogc/v1/collections/digitaalterreinmodel/quantized-mesh",
    directionalLightOptions: {
      direction: "cameraDirection",
      intensity: 2.5
    }
  };

  protected viewerType = ViewerType.DRIE_D;

  protected kaartConfig =
    "code/examples/example-3d/example-3d-dataset-switcher/kaartconfig.json";

  protected datasetSwitcherConfig: Theme[];

  protected datasetSwitcherButtons: DatasetSwitcherButton[] = [
    {
      name: "BRT-A standaard",
      imageUrl:
        "code/examples/example-dataset-switcher/thumbnails/brt-a-standaard.png"
    },
    {
      name: "BRT-A Grijs",
      imageUrl:
        "code/examples/example-dataset-switcher/thumbnails/brt-a-grijs.png"
    }
  ];

  private readonly httpClient = inject(HttpClient);

  constructor() {
    this.httpClient.get(this.kaartConfig).subscribe((data) => {
      this.webService = data as Webservice[];
    });
    this.httpClient
      .get(
        "code/examples/example-3d/example-3d-dataset-switcher/switcherconfig.json"
      )
      .subscribe((data) => {
        this.datasetSwitcherConfig = data as Theme[];
      });
  }

  public onCesiumReady() {
    // zoom to Torentje
    setTimeout(() => {
      this.cameraOptions = cameraOptionsTorentjeDenHaag;
    });
  }
}
