import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { GgcMapComponent, Webservice } from "@kadaster/ggc-map";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "ggc-home-example-search-location",
  imports: [GgcMapComponent, ExampleFormatComponent],
  templateUrl: "./example-layer-geojson.component.html"
})
export class ExampleLayerGeojsonComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/layer-geojson",
    title: "Kaartlaag toevoegen: JSON-format (GeoJSON)",
    introduction: "Voeg een GeoJSON laag toe aan de kaart.",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER],
    imageLocation:
      "code/examples/example-layer/example-layer-geojson/example-layer-geojson.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-layer/example-layer-geojson/example-layer-geojson.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/interfaces/ggc-map_src_public-api.GeojsonLayerOptions.html`;
  // DOCS-SKIP:END

  protected mapConfig: Webservice[];

  ngOnInit() {
    this.httpClient
      .get("code/examples/example-layer/example-layer-geojson/kaartconfig.json")
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
  }
}
