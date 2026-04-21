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
  Dataset,
  DatasetLabelTemplateDirective,
  DatasetTreeMapConnectService,
  GgcDatasetTreeComponent,
  LayerLabelTemplateDirective,
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
  selector: "app-example-dataset-tree-templates",
  imports: [
    GgcMapComponent,
    GgcDatasetTreeComponent,
    FormsModule,
    ExampleFormatComponent,
    DecimalPipe,
    DatasetLabelTemplateDirective,
    LayerLabelTemplateDirective
  ],
  templateUrl: "./example-dataset-tree-templates.component.html",
  styleUrl: "./example-dataset-tree-templates.component.scss"
})
export class ExampleDatasetTreeTemplatesComponent
  extends ExampleFormatComponent
  implements OnInit
{
  readonly componentInfo: ComponentInfo = {
    route: "/dataset-tree-label-template",
    title: "Dataset Tree label templates",
    introduction:
      "Met behulp van de dataset tree kunnen kaartlagen aan of uitgevinkt worden.",
    components: [Components.GGC_DATASET_TREE],
    theme: [Themes.KAARTWEERGAVE_KIEZEN],
    tags: [Tags.DATASET, Tags.LAYER],
    imageLocation:
      "code/examples/example-dataset-tree/example-dataset-tree-templates/example-dataset-tree-templates.png"
  } as ComponentInfo;
  mapIndex = "datasetTreeExample";
  mapConfig: Webservice[];
  datasetTreeConfig: Theme[];
  protected resolution: number | undefined;
  protected dataset: any;
  private readonly mapEventsService = inject(GgcMapEventsService);
  private readonly mapService = inject(GgcMapService);
  private readonly layerService = inject(GgcLayerService);
  private readonly httpClient = inject(HttpClient);
  private readonly connectService = inject(DatasetTreeMapConnectService);

  private readonly datasetTypeCache = new Map<string, string>();

  constructor() {
    super();
    this.httpClient
      .get("code/examples/example-dataset-tree/kaartconfig.json")
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
    this.httpClient
      .get("code/examples/example-dataset-tree/treeconfig.json")
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

  getTypeOfDataset(dataset: Dataset): string {
    const firstLayerId = dataset.services[0].layers[0].layerId;

    if (!this.datasetTypeCache.has(firstLayerId)) {
      this.datasetTypeCache.set(firstLayerId, "loading");

      this.connectService
        .getTypeOfLayer(firstLayerId, this.mapIndex, ViewerType.TWEE_D)
        .then((type) => {
          this.datasetTypeCache.set(firstLayerId, type.toUpperCase());
        });
    }

    return this.datasetTypeCache.get(firstLayerId)!;
  }

  getEnabled(layerId: string) {
    return this.layerService.getEnabled(layerId, this.mapIndex);
  }

  getTitle(layerId: string) {
    return this.layerService.getTitle(layerId, this.mapIndex);
  }

  zoomToVisible(layerId: string) {
    let layerResolution: number = this.resolution!;
    const layerConfig = this.layerService.getLayerConfig(
      layerId,
      this.mapIndex
    );
    if (layerConfig) {
      const maxresolution = layerConfig.maxResolution;
      const minresolution = layerConfig.minResolution;
      if (maxresolution && this.resolution! >= maxresolution) {
        //op exact de max resolution is de layer nog niet zichtbaar
        //trek er 1% van af
        layerResolution = maxresolution * 0.99;
      }
      if (minresolution && this.resolution! < minresolution) {
        layerResolution = minresolution * 1.01;
      }
    }
    this.mapService
      .getMap(this.mapIndex)
      .getView()
      .setResolution(layerResolution);
  }
}
