import { Component, inject } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import {
  GgcMapComponent,
  Webservice
} from "@kadaster/ggc-map";
import { GgcLegendComponent } from "@kadaster/ggc-legend";
import { ComponentInfo } from "../../component-info.model";
import { HttpClient } from "@angular/common/http";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "app-example-legend-basic",
  imports: [ExampleFormatComponent, GgcMapComponent, GgcLegendComponent],
  templateUrl: "./example-legend-basic.component.html",
  styleUrl: "../example-legend.component.scss"
})
export class ExampleLegendBasicComponent extends ExampleFormatComponent {
  readonly componentInfo: ComponentInfo = {
    route: "/legend-basic",
    title: "Legenda tonen",
    introduction: "Toon de legenda van één of meerdere kaartlagen.",
    components: [Components.GGC_LEGEND],
    theme: [Themes.LEGENDA],
    tags: [Tags.LEGEND],
    imageLocation:
      "code/examples/example-legend/example-legend-basic/example-legend-basic.png"
  } as ComponentInfo;
  mapIndex = "legendExample";
  mapConfig: Webservice[];

  private readonly httpClient = inject(HttpClient);

  constructor() {
    super();
    this.httpClient
      .get("code/examples/example-legend/example-legend-basic/kaartconfig.json")
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
  }
}
