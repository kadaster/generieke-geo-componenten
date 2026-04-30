import { Component, inject, OnInit } from "@angular/core";
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
export class ExampleLayerImageComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/layer-image",
    title: "Kaartlaag toevoegen: Image",
    introduction: "Voeg een afbeelding als laag toe aan de kaart.",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER],
    imageLocation:
      "code/examples/example-layer/example-layer-image/example-layer-image.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-layer/example-layer-image/example-layer-image.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/interfaces/ggc-map_src_public-api.ImageLayerOptions.html`;
  // DOCS-SKIP:END
  protected mapConfig: Webservice[];

  private readonly mapService: GgcMapService = inject(GgcMapService);

  ngOnInit() {
    this.httpClient
      .get("code/examples/example-layer/example-layer-image/kaartconfig.json")
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
        this.mapService.zoomToCoordinate([194195, 465985], undefined, 10);
      });
  }
}
