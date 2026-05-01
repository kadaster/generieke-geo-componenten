import { Component, inject, OnInit } from "@angular/core";
import { GgcMapComponent, GgcMapService, Webservice } from "@kadaster/ggc-map";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "app-example-search-location",
  imports: [GgcMapComponent, ExampleFormatComponent],
  templateUrl: "./example-layer-geojson-ogc.component.html",
  styleUrl: "./example-layer-geojson-ogc.component.scss"
})
export class ExampleLayerGeojsonOgcComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/layer-geojson-ogc",
    title: "Kaartlaag toevoegen: OGC API - Features (GeoJSON)",
    introduction:
      "Voeg een GeoJSON laag toe aan de kaart met OGC API - Features.",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER, Tags.OGC_API],
    imageLocation:
      "code/examples/example-layer/example-layer-geojson-ogc/example-layer-geojson-ogc.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-layer/example-layer-geojson-ogc/example-layer-geojson-ogc.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/interfaces/ggc-map_src_public-api.GeojsonLayerOptions.html`;
  // DOCS-SKIP:END
  protected mapConfig: Webservice[];
  protected mapIndex = "GeoJsonOgcExample";

  private readonly mapService = inject(GgcMapService);

  ngOnInit() {
    this.httpClient
      .get(
        "code/examples/example-layer/example-layer-geojson-ogc/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
        this.mapService.zoomToCoordinate([194195, 465885], this.mapIndex, 6);
      });
  }
}
