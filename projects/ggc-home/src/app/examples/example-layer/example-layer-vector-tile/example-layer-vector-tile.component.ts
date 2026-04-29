import { Component, inject } from "@angular/core";
import {
  GgcMapComponent,
  GgcVectorTileLayerComponent,
  VectorTileLayerOptions
} from "@kadaster/ggc-map";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";
import { Webservice } from "@kadaster/ggc-cesium/src/lib/model/interfaces";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-example-search-location",
  imports: [
    GgcMapComponent,
    ExampleFormatComponent,
    GgcVectorTileLayerComponent
  ],
  templateUrl: "./example-layer-vector-tile.component.html",
  styleUrl: "./example-layer-vector-tile.component.scss"
})
export class ExampleLayerVectorTileComponent {
  readonly componentInfo: ComponentInfo = {
    route: "/layer-vector-tile",
    title: "Kaartlaag: Vector Tile",
    introduction: "Voeg een Vector Tile laag toe aan de kaart.",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.OGC_API, Tags.LAYER],
    imageLocation:
      "code/examples/example-layer/example-layer-vector-tile/example-layer-vector-tile.png"
  } as ComponentInfo;

  protected mapConfig: Webservice[];

  private readonly httpClient = inject(HttpClient);

  constructor() {
    this.httpClient
      .get(
        "code/examples/example-layer/example-layer-vector-tile/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
  }
}
