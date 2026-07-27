import { Component, OnInit } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { GgcMapComponent, Webservice } from "@kadaster/ggc-map";
import { GgcLegendComponent } from "@kadaster/ggc-legend";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "ggc-home-example-legend-zoom",
  imports: [ExampleFormatComponent, GgcMapComponent, GgcLegendComponent],
  templateUrl: "./example-legend-zoom.component.html",
  styleUrl: "./example-legend-zoom.component.scss"
})
export class ExampleLegendZoomComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/legend-basic",
    title: "Legenda weergeven",
    introduction: "Toon de legenda van één of meer kaartlagen.",
    components: [Components.GGC_LEGEND],
    theme: [Themes.LEGENDA],
    tags: [Tags.LEGEND, Tags.ZOOM],
    imageLocation:
      "code/examples/example-legend/example-legend-zoom/example-legend-zoom.png"
  };
  urlComponentModule =
    "example-legend/example-legend-zoom/example-legend-zoom.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/classes/ggc-legend_src_public-api.GgcLegendComponent.html`;
  // DOCS-SKIP:END
  mapIndex = "legendExample";
  mapConfig: Webservice[];

  ngOnInit() {
    this.httpClient
      .get("code/examples/example-legend/example-legend-zoom/kaartconfig.json")
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
  }
}
