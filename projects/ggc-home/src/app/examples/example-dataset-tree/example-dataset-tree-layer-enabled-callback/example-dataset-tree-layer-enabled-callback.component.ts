import { Component, inject, OnInit } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import {
  GgcLayerService,
  GgcMapComponent,
  GgcMapEventsService,
  GgcMapService,
  Webservice
} from "@kadaster/ggc-map";
import {
  DatasetTreeMapConnectService,
  GgcDatasetTreeComponent,
  LayerEnabledCallback,
  Theme
} from "@kadaster/ggc-dataset-tree";
import { FormsModule } from "@angular/forms";
import { ViewerType } from "@kadaster/ggc-models";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "app-example-dataset-tree-layer-enabled-callback",
  imports: [
    GgcMapComponent,
    GgcDatasetTreeComponent,
    FormsModule,
    ExampleFormatComponent
  ],
  templateUrl: "./example-dataset-tree-layer-enabled-callback.component.html",
  styleUrl: "./example-dataset-tree-layer-enabled-callback.component.scss"
})
export class ExampleDatasetTreeLayerEnabledCallback
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/dataset-tree-layer-enabled-callback",
    title: "Kaartlaag keuze aan-/uitzetten",
    introduction:
      "De bediening van kaartlagen in de dataset-tree kan aan-/uitgezet worden. Dit kan per kaartlaag ingesteld worden.",
    components: [Components.GGC_DATASET_TREE],
    theme: [Themes.KAARTWEERGAVE_KIEZEN],
    tags: [Tags.DATASET, Tags.LAYER],
    imageLocation:
      "code/examples/example-dataset-tree/example-dataset-tree-layer-enabled-callback/example-dataset-tree-layer-enabled-callback.png"
  } as ComponentInfo;
  tsDocsUrl = `${document.baseURI}tsdocs/classes/ggc-dataset-tree_src_public-api.GgcDatasetTreeComponent.html`;
  urlComponentModule =
    "example-dataset-tree/example-dataset-tree-layer-enabled-callback/example-dataset-tree-layer-enabled-callback.component.ts";

  // DOCS-SKIP:END
  mapIndex = "datasetTreeExample";
  mapConfig: Webservice[];
  datasetTreeConfig: Theme[];
  gemeentesEnabled = false;
  protected resolution: number | undefined;
  protected dataset: any;
  private readonly connectService = inject(DatasetTreeMapConnectService);

  private readonly layerService = inject(GgcLayerService);
  private readonly mapEventsService = inject(GgcMapEventsService);
  private readonly mapService = inject(GgcMapService);

  layerEnabledCallback: LayerEnabledCallback = ({ layer, isEnabled }) => {
    if (layer.layerId === "gemeenten") {
      if (
        this.layerService.isVisible("gemeenten", this.mapIndex) &&
        !this.gemeentesEnabled
      ) {
        this.layerService.removeLayer(this.mapIndex, "gemeenten");
      }
      return this.gemeentesEnabled;
    }
    return isEnabled;
  };

  ngOnInit() {
    this.httpClient
      .get(
        "code/examples/example-dataset-tree/example-dataset-tree-layer-enabled-callback/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
    this.httpClient
      .get(
        "code/examples/example-dataset-tree/example-dataset-tree-layer-enabled-callback/treeconfig.json"
      )
      .subscribe((data) => {
        this.datasetTreeConfig = data as Theme[];
      });
    this.mapEventsService
      .getZoomendObservableForMap(this.mapIndex)
      .subscribe(() => {
        this.resolution = this.mapService
          .getMap(this.mapIndex)
          .getView()
          .getResolution();
      });
  }

  gemeentesChanged() {
    this.connectService.emitTrigger(ViewerType.TWEE_D, this.mapIndex);
  }

  getEnabled(layerId: string) {
    return this.layerService.getEnabled(layerId, this.mapIndex);
  }

  getTitle(layerId: string) {
    return this.layerService.getTitle(layerId, this.mapIndex);
  }
}
