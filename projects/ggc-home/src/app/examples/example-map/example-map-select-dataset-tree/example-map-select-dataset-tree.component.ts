import { Component, inject, OnInit, AfterViewInit } from "@angular/core";
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
import { GgcDatasetTreeComponent, Theme } from "@kadaster/ggc-dataset-tree";
import { MapComponentEventTypes } from "@kadaster/ggc-models";
import {
  GgcFeatureInfoComponent,
  GgcFeatureInfoTabsComponent
} from "@kadaster/ggc-feature-info";
import { RouterLink } from "@angular/router";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";

@Component({
  selector: "ggc-home-example-map-select",
  imports: [
    GgcMapComponent,
    GgcDatasetTreeComponent,
    GgcFeatureInfoComponent,
    GgcFeatureInfoTabsComponent,
    ExampleFormatComponent,
    FormsModule,
    RouterLink
  ],
  templateUrl: "./example-map-select-dataset-tree.component.html",
  styleUrl: "./example-map-select-dataset-tree.component.scss"
})
export class ExampleMapSelectDatasetTreeComponent
  extends ExampleFormatComponent
  implements OnInit, AfterViewInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/example-map-select-dataset-tree",
    title: "Selecteren op de kaart met kaartlaag keuze",
    introduction:
      "Selecteer en markeer objecten door in geactiveerde kaartlagen te klikken.",
    components: [
      Components.GGC_MAP,
      Components.GGC_DATASET_TREE,
      Components.GGC_FEATURE_INFO
    ],
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

  private readonly selectStyle = new Style({
    fill: new Fill({
      color: "rgba(0, 147, 190, 0.2)"
    }),
    stroke: new Stroke({
      color: "#0093be",
      width: 3
    })
  });

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
  }

  ngAfterViewInit() {
    this.onSelectModeChange("singleselect");
  }

  onSelectModeChange(mode: "singleselect" | "multiselect") {
    switch (mode) {
      case "singleselect":
        this.selectService.startSelect({ selectMode: "single" }, this.mapIndex);
        break;
      case "multiselect":
        this.selectService.startSelect(
          { selectMode: "multi", style: this.selectStyle },
          this.mapIndex
        );
        break;
    }
  }
}
