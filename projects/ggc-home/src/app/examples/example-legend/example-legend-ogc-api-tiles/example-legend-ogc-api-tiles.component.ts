import { Component, inject } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { FormsModule } from "@angular/forms";
import { GgcLegendComponent } from "@kadaster/ggc-legend";
import { ComponentInfo } from "../../component-info.model";
import {
  GgcMapComponent,
  Webservice
} from "@kadaster/ggc-map";
import { HttpClient } from "@angular/common/http";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "app-example-legend-ogc-api-tiles",
  imports: [
    ExampleFormatComponent,
    FormsModule,
    GgcLegendComponent,
    GgcMapComponent
  ],
  templateUrl: "./example-legend-ogc-api-tiles.component.html",
  styleUrl: "../example-legend.component.scss"
})
export class ExampleLegendOgcApiTilesComponent extends ExampleFormatComponent {
  readonly componentInfo: ComponentInfo = {
    route: "/legend-ogc-api-tiles",
    title: "Legend OGC API Tiles",
    introduction:
      "Het legenda component ondersteund ook ogc api tiles legenda's.",
    components: [Components.GGC_LEGEND],
    theme: [Themes.LEGENDA],
    tags: [Tags.LEGEND, Tags.OGC_API],
    imageLocation:
      "code/examples/example-legend/example-legend-ogc-api-tiles/example-legend-ogc-api-tiles.png"
  } as ComponentInfo;
  mapIndex = "legendExample";
  mapConfig: Webservice[];

  private readonly httpClient = inject(HttpClient);

  constructor() {
    super();
    this.httpClient
      .get(
        "code/examples/example-legend/example-legend-ogc-api-tiles/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
  }
}
