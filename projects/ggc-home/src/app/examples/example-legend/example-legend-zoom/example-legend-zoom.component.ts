import { Component, inject, signal } from "@angular/core";
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
  selector: "app-example-legend-zoom",
  imports: [ExampleFormatComponent, GgcMapComponent, GgcLegendComponent],
  templateUrl: "./example-legend-zoom.component.html",
  styleUrl: "../example-legend.component.scss"
})
export class ExampleLegendZoomComponent extends ExampleFormatComponent {
  readonly componentInfo: ComponentInfo = {
    route: "/legend-zoom",
    title: "Legenda tonen (zoomniveau)",
    introduction:
      "Toon de legenda van één of meerdere kaartlagen op basis van het zoomniveau.",
    components: [Components.GGC_LEGEND],
    theme: [Themes.LEGENDA],
    tags: [Tags.LEGEND, Tags.ZOOM],
    imageLocation:
      "code/examples/example-legend/example-legend-zoom/example-legend-zoom.png"
  } as ComponentInfo;
  mapIndex = "legendExample";
  mapConfig: Webservice[];

  alwaysEnableLegends = signal(false);

  private readonly httpClient = inject(HttpClient);

  constructor() {
    super();
    this.httpClient
      .get("code/examples/example-legend/example-legend-zoom/kaartconfig.json")
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
  }

  toggleAlwaysEnableLegends() {
    this.alwaysEnableLegends.update((value) => !value);
  }
}
