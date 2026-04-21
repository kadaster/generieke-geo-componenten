import { Component, inject, OnInit } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import {
  GgcMapComponent,
  GgcMapEventsService,
  GgcMapService,
  Webservice
} from "@kadaster/ggc-map";
import { GgcDatasetTreeComponent, Theme } from "@kadaster/ggc-dataset-tree";
import { HttpClient } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { DecimalPipe } from "@angular/common";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "app-example-dataset-tree-basic",
  imports: [
    GgcMapComponent,
    GgcDatasetTreeComponent,
    FormsModule,
    ExampleFormatComponent,
    DecimalPipe
  ],
  templateUrl: "./example-dataset-tree-basic-list.component.html",
  styleUrl: "./../example-dataset-tree.component.scss"
})
export class ExampleDatasetTreeBasicListComponent
  extends ExampleFormatComponent
  implements OnInit
{
  readonly componentInfo: ComponentInfo = {
    route: "/dataset-tree-basic-list",
    title: "Kaartlagen aan-/uitzetten (lijst)",
    introduction: "Zet kaartlagen aan of uit in een platte lijst.",
    components: [Components.GGC_DATASET_TREE],
    theme: [Themes.KAARTWEERGAVE_KIEZEN],
    tags: [Tags.DATASET, Tags.LAYER],
    imageLocation:
      "code/examples/example-dataset-tree/example-dataset-tree-basic-list/example-dataset-tree-basic-list.png"
  } as ComponentInfo;
  mapIndex = "datasetTreeExample";
  mapConfig: Webservice[];
  datasetTreeConfig: Theme[];

  protected resolution: number | undefined;
  private readonly mapEventsService = inject(GgcMapEventsService);
  private readonly mapService = inject(GgcMapService);
  private readonly httpClient = inject(HttpClient);

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
}
