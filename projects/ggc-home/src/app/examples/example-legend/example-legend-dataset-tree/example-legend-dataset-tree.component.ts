import { Component, OnInit } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { GgcMapComponent, Webservice } from "@kadaster/ggc-map";
import { GgcLegendComponent } from "@kadaster/ggc-legend";
import { ComponentInfo } from "../../component-info.model";
import { GgcDatasetTreeComponent, Theme } from "@kadaster/ggc-dataset-tree";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";
import { RouterLink } from "@angular/router";

@Component({
  selector: "ggc-home-example-legend-dataset-tree",
  imports: [
    ExampleFormatComponent,
    GgcMapComponent,
    GgcLegendComponent,
    GgcDatasetTreeComponent,
    RouterLink
  ],
  templateUrl: "./example-legend-dataset-tree.component.html",
  styleUrl: "./example-legend-dataset-tree.component.scss"
})
export class ExampleLegendDatasetTreeComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/legend-dataset-tree",
    title: "Legenda automatisch bijwerken na kaartlaag keuze",
    introduction:
      "Toon de legenda van één of meer kaartlagen. Actieve kaartlagen worden automatisch zichtbaar in de legenda.",
    components: [Components.GGC_LEGEND, Components.GGC_DATASET_TREE],
    theme: [Themes.LEGENDA],
    tags: [Tags.LEGEND, Tags.DATASET],
    imageLocation:
      "code/examples/example-legend/example-legend-dataset-tree/example-legend-dataset-tree.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-legend/example-legend-dataset-tree/example-legend-dataset-tree.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/classes/ggc-legend_src_public-api.GgcLegendComponent.html`;
  // DOCS-SKIP:END
  mapIndex = "legendExample";
  mapConfig: Webservice[];
  datasetTreeConfig: Theme[];

  ngOnInit() {
    this.httpClient
      .get(
        "code/examples/example-legend/example-legend-dataset-tree/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
    this.httpClient
      .get(
        "code/examples/example-legend/example-legend-dataset-tree/treeconfig.json"
      )
      .subscribe((data) => {
        this.datasetTreeConfig = data as Theme[];
      });
  }
}
