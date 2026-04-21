import { Component, inject } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { GgcMapComponent, Webservice } from "@kadaster/ggc-map";
import { GgcLegendComponent } from "@kadaster/ggc-legend";
import { ComponentInfo } from "../../component-info.model";
import { HttpClient } from "@angular/common/http";
import { GgcDatasetTreeComponent, Theme } from "@kadaster/ggc-dataset-tree";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "app-example-legend-dataset-tree",
  imports: [
    ExampleFormatComponent,
    GgcMapComponent,
    GgcLegendComponent,
    GgcDatasetTreeComponent
  ],
  templateUrl: "./example-legend-dataset-tree.component.html",
  styleUrl: "../example-legend.component.scss"
})
export class ExampleLegendDatasetTreeComponent extends ExampleFormatComponent {
  readonly componentInfo: ComponentInfo = {
    route: "/legend-dataset-tree",
    title: "Legend met dataset-tree",
    introduction:
      "Toon de legenda van één of meerdere kaartlagen. De legenda reageert automatisch op actieve kaartlagen.",
    components: [Components.GGC_LEGEND],
    theme: [Themes.LEGENDA],
    tags: [Tags.LEGEND, Tags.DATASET],
    imageLocation:
      "code/examples/example-legend/example-legend-dataset-tree/example-legend-dataset-tree.png"
  } as ComponentInfo;
  mapIndex = "legendExample";
  mapConfig: Webservice[];
  datasetTreeConfig: Theme[];

  private readonly httpClient = inject(HttpClient);

  constructor() {
    super();
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
