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
import { HttpClient } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { DecimalPipe } from "@angular/common";
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
    ExampleFormatComponent,
    DecimalPipe
  ],
  templateUrl: "./example-dataset-tree-layer-enabled-callback.component.html",
  styleUrl: "./example-dataset-tree-layer-enabled-callback.component.scss"
})
export class ExampleDatasetTreeLayerEnabledCallback
  extends ExampleFormatComponent
  implements OnInit
{
  readonly componentInfo: ComponentInfo = {
    route: "/dataset-tree-layer-enabled-callback",
    title: "Dataset Tree dataset (de)activeren",
    introduction:
      "Met een custom callback kan de status van een kaartlaag worden aangepast op basis van de dataset en/of de laag.",
    components: [Components.GGC_DATASET_TREE],
    theme: [Themes.KAARTWEERGAVE_KIEZEN],
    tags: [Tags.DATASET, Tags.LAYER],
    imageLocation:
      "code/examples/example-dataset-tree/example-dataset-tree-layer-enabled-callback/example-dataset-tree-layer-enabled-callback.png"
  } as ComponentInfo;
  mapIndex = "datasetTreeExample";
  mapConfig: Webservice[];
  datasetTreeConfig: Theme[];
  gemeentesEnabled = true;
  protected resolution: number | undefined;
  protected dataset: any;
  private readonly mapEventsService = inject(GgcMapEventsService);
  private readonly mapService = inject(GgcMapService);
  private readonly layerService = inject(GgcLayerService);
  private readonly httpClient = inject(HttpClient);
  private readonly connectService = inject(DatasetTreeMapConnectService);

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

  constructor() {
    super();
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
  }

  ngOnInit() {
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
