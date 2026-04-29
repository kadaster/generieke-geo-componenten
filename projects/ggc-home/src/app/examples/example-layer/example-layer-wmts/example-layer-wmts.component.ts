import { Component, inject } from "@angular/core";
import {
  GgcLayerBrtAchtergrondkaartComponent,
  GgcMapComponent,
  GgcMapService,
  GgcWmtsLayerComponent
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
    GgcLayerBrtAchtergrondkaartComponent,
    GgcWmtsLayerComponent
  ],
  templateUrl: "./example-layer-wmts.component.html",
  styleUrl: "./example-layer-wmts.component.scss"
})
export class ExampleLayerWmtsComponent extends ExampleFormatComponent {
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/layer-wmts",
    title: "Kaartlaag toevoegen: WMTS (raster)",
    introduction:
      "Voeg een afbeelding als laag toe aan de kaart met Web Map Tile Service (WMTS).",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER],
    imageLocation:
      "code/examples/example-layer/example-layer-wmts/example-layer-wmts.png"
  } as ComponentInfo;
  urlComponentModule = import.meta.url;
  // DOCS-SKIP:END
  protected mapConfig: Webservice[];

  private readonly httpClient = inject(HttpClient);
  private readonly mapService: GgcMapService = inject(GgcMapService);

  constructor() {
    super();
    this.httpClient
      .get("code/examples/example-layer/example-layer-wmts/kaartconfig.json")
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
        this.mapService.zoomToCoordinate([194195, 465885], undefined, 12);
      });
  }
}
