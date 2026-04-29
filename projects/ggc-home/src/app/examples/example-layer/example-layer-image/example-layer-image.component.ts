import { Component, inject } from "@angular/core";
import {
  GgcImageLayerComponent,
  GgcLayerBrtAchtergrondkaartComponent,
  GgcMapComponent,
  GgcMapService
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
    GgcImageLayerComponent,
    GgcLayerBrtAchtergrondkaartComponent
  ],
  templateUrl: "./example-layer-image.component.html",
  styleUrl: "./example-layer-image.component.scss"
})
export class ExampleLayerImageComponent {
  readonly componentInfo: ComponentInfo = {
    route: "/layer-image",
    title: "Kaartlaag: Image",
    introduction: "Voeg een afbeelding als een laag toe aan de kaart.",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER],
    imageLocation:
      "code/examples/example-layer/example-layer-image/example-layer-image.png"
  } as ComponentInfo;

  protected mapConfig: Webservice[];
  protected mapIndex = "geoJsonWfs";

  private readonly httpClient = inject(HttpClient);
  private readonly mapService: GgcMapService = inject(GgcMapService);

  constructor() {
    this.httpClient
      .get("code/examples/example-layer/example-layer-image/kaartconfig.json")
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
        this.mapService.zoomToCoordinate([194195, 465985], undefined, 10);
      });
  }
}
