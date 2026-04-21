import { Component, inject } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import {
  GgcMapComponent,
  Webservice
} from "@kadaster/ggc-map";
import {
  GgcLegendComponent,
  GgcLegendService
} from "@kadaster/ggc-legend";
import { ComponentInfo } from "../../component-info.model";
import { HttpClient } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { Components } from "../../components.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "app-example-legend-adv",
  imports: [
    ExampleFormatComponent,
    GgcMapComponent,
    GgcLegendComponent,
    FormsModule
  ],
  templateUrl: "./example-legend-adv.component.html",
  styleUrl: "../example-legend.component.scss"
})
export class ExampleLegendAdvComponent extends ExampleFormatComponent {
  readonly componentInfo: ComponentInfo = {
    route: "/legend-advanced",
    title: "Legenda tonen (uitgebreid)",
    introduction: "Toon de legenda van één of meerdere kaartlagen.",
    components: [Components.GGC_LEGEND],
    tags: [Tags.LEGEND],
    imageLocation:
      "code/examples/example-legend/example-legend-basic/example-legend-basic.png"
  } as ComponentInfo;
  mapIndex = "legendExample";
  mapConfig: Webservice[];
  // Custom icons
  protected iconCollapsed = "fa-solid fa-caret-right";
  protected iconExpanded = "fa-solid fa-caret-down";
  protected collapsable = true;
  protected showLegendsName = true;
  protected showEmptyLegendMessage = true;
  protected emptyLegendMessage = "Er is geen legenda voor deze laag";

  private readonly httpClient = inject(HttpClient);
  private readonly legendService = inject(GgcLegendService);

  constructor() {
    super();
    this.httpClient
      .get("code/examples/example-legend/example-legend-adv/kaartconfig.json")
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
  }

  protected collapseAll() {
    this.legendService.collapseAllLegends(this.mapIndex);
  }

  protected expandAll() {
    this.legendService.expandAllLegends(this.mapIndex);
  }
}
