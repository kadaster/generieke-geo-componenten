import { Component, inject } from "@angular/core";
import {
  GgcLayerBrtAchtergrondkaartComponent,
  GgcMapComponent,
  GgcWmsLayerComponent
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
    GgcWmsLayerComponent
  ],
  templateUrl: "./example-layer-wms.component.html",
  styleUrl: "./example-layer-wms.component.scss"
})
export class ExampleLayerWmsComponent {
  readonly componentInfo: ComponentInfo = {
    route: "/layer-wms",
    title: "Kaartlaag: WMS",
    introduction: "Voeg een WMS-laag toe aan de kaart.",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER],
    imageLocation:
      "code/examples/example-layer/example-layer-wms/example-layer-wms.png"
  } as ComponentInfo;

  protected mapConfig: Webservice[];

  private readonly httpClient = inject(HttpClient);

  constructor() {
    this.httpClient
      .get("code/examples/example-layer/example-layer-wms/kaartconfig.json")
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
  }
}
