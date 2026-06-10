import { Component, inject, OnInit } from "@angular/core";
import {
  GgcMapComponent,
  GgcSelectionService,
  Webservice
} from "@kadaster/ggc-map";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";
import { FormsModule } from "@angular/forms";
import { Theme } from "@kadaster/ggc-dataset-tree";
import { GgcDatasetTreeComponent } from "../../../../../../ggc-dataset-tree/src/lib/dataset-tree/dataset-tree/ggc-dataset-tree.component";
import { MapComponentEventTypes } from "../../../../../../ggc-map/src/lib/model/map-component-event.model";

@Component({
  selector: "app-example-map-select",
  imports: [
    GgcMapComponent,
    GgcDatasetTreeComponent,
    ExampleFormatComponent,
    FormsModule
  ],
  templateUrl: "./example-map-select-dataset-tree.component.html",
  styleUrl: "./example-map-select-dataset-tree.component.scss"
})
export class ExampleMapSelectDatasetTreeComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/example-map-select-dataset-tree",
    title: "Selecteren op de kaart met dataset tree",
    introduction: "Selecteer en highlight features op diverse kaartlagen",
    components: [Components.GGC_MAP, Components.GGC_DATASET_TREE],
    theme: [Themes.INFORMATIE_OP_KAART],
    tags: [Tags.SELECT, Tags.DATASET],
    imageLocation:
      "code/examples/example-map/example-map-select-dataset-tree/example-select.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-map/example-map-select-dataset-tree/example-map-select-dataset-tree.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/interfaces/ggc-map_src_public-api.GgcSelectService.html`;
  // DOCS-SKIP:END
  protected mapConfig: Webservice[];
  protected datasetTreeConfig: Theme[];
  protected mapIndex = "example-select-dataset-tree";

  protected selectMode: "singleselect" | "multiselect" = "singleselect";

  private readonly selectService = inject(GgcSelectionService);

  ngOnInit() {
    this.httpClient
      .get(
        "code/examples/example-map/example-map-select-dataset-tree/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
    this.httpClient
      .get(
        "code/examples/example-map/example-map-select-dataset-tree/treeconfig.json"
      )
      .subscribe((data) => {
        this.datasetTreeConfig = data as Theme[];
      });

    this.selectService.getObservable(this.mapIndex).subscribe((data) => {
      if (
        data.type == MapComponentEventTypes.SELECTIONSERVICE_SELECTIONUPDATED
      ) {
        console.log("features", data.value);
      }
    });

    this.selectService.startSelect({ selectMode: "single" }, this.mapIndex);
  }

  onSelectModeChange(mode: "singleselect" | "multiselect") {
    switch (mode) {
      case "singleselect":
        this.selectService.startSelect({ selectMode: "single" }, this.mapIndex);
        break;
      case "multiselect":
        this.selectService.startSelect({ selectMode: "multi" }, this.mapIndex);
        break;
    }
  }
}
