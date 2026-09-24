import { Component, inject, OnInit } from "@angular/core";
import {
  GgcLayerService,
  GgcMapComponent,
  GgcMapService,
  Webservice
} from "@kadaster/ggc-map";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";
import { Webservice2DType } from "@kadaster/ggc-models";

@Component({
  selector: "ggc-home-example-search-location",
  imports: [GgcMapComponent, ExampleFormatComponent],
  templateUrl: "./example-layer-geojson-ogc.component.html"
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
  };
  urlComponentModule =
    "example-layer/example-layer-geojson-ogc/example-layer-geojson-ogc.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/interfaces/ggc-map_src_public-api.GeojsonLayerOptions.html`;
  // DOCS-SKIP:END
  protected mapConfig: Webservice[];
  protected mapIndex = "GeoJsonOgcExample";

  private layerService = inject(GgcLayerService);

  private readonly mapService = inject(GgcMapService);

  ngOnInit() {
    this.httpClient
      .get(
        "code/examples/example-layer/example-layer-geojson-ogc/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
        this.mapService.zoomToCoordinate([194195, 465885], this.mapIndex, 6);
        console.log(
          "Laag",
          this.mapService.getMap(this.mapIndex),
          this.mapService.getLayer("buurten", this.mapIndex)
        );
      });
  }

  public foo() {
    console.log("foo");
    this.layerService.removeLayer(this.mapIndex, "perceel");
    this.layerService.addGeojsonLayer({
      url: "https://api.pdok.nl/kadaster/brk-kadastrale-kaart/ogc/v1/collections/perceel/items?crs=http://www.opengis.net/def/crs/EPSG/0/28992&f=json&limit=100&filter-lang=cql2-text&kadastrale_gemeente_waarde=Zundert&perceelnummer=1560&sectie=P",
      layerId: "perceel",
      title: "Perceel",
      zIndex: 20,
      mapIndex: this.mapIndex
    });
  }
}
