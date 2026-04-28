import { Component, inject } from "@angular/core";
import {
  GgcGeojsonLayerComponent,
  GgcLayerBrtAchtergrondkaartComponent,
  GgcMapComponent,
  GgcMapService,
  Webservice
} from "@kadaster/ggc-map";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-example-search-location",
  imports: [
    GgcMapComponent,
    ExampleFormatComponent,
    GgcLayerBrtAchtergrondkaartComponent,
    GgcGeojsonLayerComponent
  ],
  templateUrl: "./example-layer-geojson-ogc.component.html",
  styleUrl: "./example-layer-geojson-ogc.component.scss"
})
export class ExampleLayerGeojsonOgcComponent {
  readonly componentInfo: ComponentInfo = {
    route: "/layer-geojson-ogc",
    title: "Kaartlaag: GeoJSON OGC",
    introduction: "Voeg een GeoJSON OGC laag toe aan de kaart.",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER, Tags.OGC_API],
    imageLocation:
      "code/examples/example-layer/example-layer-geojson-ogc/example-layer-geojson-ogc.png"
  } as ComponentInfo;

  protected mapConfig: Webservice[];
  protected mapIndex = "GeoJsonOgcExample";

  private readonly httpClient = inject(HttpClient);
  private readonly mapService = inject(GgcMapService);

  constructor() {
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
