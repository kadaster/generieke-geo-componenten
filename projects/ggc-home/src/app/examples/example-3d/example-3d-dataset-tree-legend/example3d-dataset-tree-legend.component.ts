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
} from "@kadaster/ggc-map-3d";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { HttpClient } from "@angular/common/http";
import { ViewerType } from "@kadaster/ggc-models";
import { GgcDatasetTreeComponent, Theme } from "@kadaster/ggc-dataset-tree";
import { GgcLegendComponent } from "@kadaster/ggc-legend";
import { Tags } from "../../tags.enum";

@Component({
  selector: "ggc-example-3d-dataset-tree-legend",
  templateUrl: "./example3d-dataset-tree-legend.component.html",
  styleUrl: "./example3d-dataset-tree-legend.component.scss",
  imports: [
    GgcViewerComponent,
    GgcControlsComponent,
    ExampleFormatComponent,
    GgcDatasetTreeComponent,
    GgcLegendComponent
  ],
  encapsulation: ViewEncapsulation.None
})
export class Example3dDatasetTreeLegendComponent {
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/example-3d-dataset-tree-legend",
    title: "Legenda automatisch bijwerken na kaartlaag keuze (3D)",
    introduction:
      "Toon de legenda van één of meer kaartlagen in de 3D kaart. Actieve kaartlagen worden automatisch zichtbaar in de legenda.",
    components: [Components.GGC_DATASET_TREE, Components.GGC_LEGEND],
    theme: [Themes.KAARTWEERGAVE_KIEZEN],
    tags: [Tags.DRIED, Tags.DATASET, Tags.LEGEND, Tags.LAYER],
    imageLocation:
      "code/examples/example-3d/example-3d-dataset-tree-legend/example-3d-dataset-tree-legend.png"
  } as ComponentInfo;

  urlComponentModule =
    "example-3d/example-3d-dataset-tree-legend/example3d-dataset-tree-legend.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/modules/ggc-map_src_public-api.html`;
  // DOCS-SKIP:END

  protected cameraOptions: CameraOptions;
  protected webService: Webservice[];
  protected datasetTreeConfig: Theme[];
  protected viewerOptions: ViewerOptions = {
    elementId: "cesium-dataset-tree-legend",
    terrainModelUrl:
      "https://api.pdok.nl/kadaster/3d-basisvoorziening/ogc/v1/collections/digitaalterreinmodel/quantized-mesh",
    directionalLightOptions: {
      direction: "cameraDirection",
      intensity: 2.5
    }
  };

  protected viewerType = ViewerType.DRIE_D;

  protected kaartConfig =
    "code/examples/example-3d/example-3d-dataset-tree-legend/kaartconfig.json";

  private readonly httpClient = inject(HttpClient);

  constructor() {
    this.httpClient.get(this.kaartConfig).subscribe((data) => {
      this.webService = data as Webservice[];
    });
    this.httpClient
      .get(
        "code/examples/example-3d/example-3d-dataset-tree-legend/treeconfig.json"
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
