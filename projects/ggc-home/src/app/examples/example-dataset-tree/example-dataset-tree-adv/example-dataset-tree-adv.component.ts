import { Component, inject, OnInit } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { GgcMapComponent, GgcMapEventsService, GgcMapService, Webservice } from "@kadaster/ggc-map";
import { GgcDatasetTreeComponent, Theme } from "@kadaster/ggc-dataset-tree";
import { FormsModule } from "@angular/forms";
import { Components } from "../../components.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "app-example-dataset-tree-basic",
  imports: [
    GgcMapComponent,
    GgcDatasetTreeComponent,
    FormsModule,
    ExampleFormatComponent
  ],
  templateUrl: "./example-dataset-tree-adv.component.html",
  styleUrl: "./example-dataset-tree-adv.component.scss"
})
export class ExampleDatasetTreeAdvComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/dataset-tree-advanced",
    title: "Kaartlagen aan-/uitzetten (boomstructuur, uitgebreid)",
    introduction: "Zet kaartlagen aan of uit in een lijst met meer niveau's.",
    components: [Components.GGC_DATASET_TREE],
    tags: [Tags.DATASET, Tags.LAYER],
    imageLocation:
      "code/examples/example-dataset-tree-basic/example-dataset-tree-basic.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-dataset-tree/example-dataset-tree-adv/example-dataset-tree-adv.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/classes/ggc-dataset-tree_src_public-api.GgcDatasetTreeComponent.html`;
  // DOCS-SKIP:END
  mapIndex = "datasetTreeExample";
  mapConfig: Webservice[];
  datasetTreeConfig: Theme[];
  protected hideTree = true;
  protected showOnlyDatasets = false;
  protected showActiveCounters = false;
  protected iconAlignRight = false;
  protected expandTreeOnInit = false;
  // Custom icons
  protected iconCollapsed = "fa-solid fa-plus";
  protected iconExpanded = "fa-solid fa-minus";
  protected iconUnchecked = "fas fa-square";
  protected iconChecked = "fas fa-check-square";
  protected iconInfoUrl = "fa-regular fa-circle-question";
  //
  protected resolution: number | undefined;
  private readonly mapEventsService = inject(GgcMapEventsService);
  private readonly mapService = inject(GgcMapService);

  ngOnInit() {
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
