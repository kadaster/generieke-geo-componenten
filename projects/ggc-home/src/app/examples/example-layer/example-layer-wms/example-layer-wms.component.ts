import { Component } from "@angular/core";
import {
  GgcLayerBrtAchtergrondkaartComponent,
  GgcMapComponent,
  GgcWmsLayerComponent,
  WmsLayerOptions
} from "@kadaster/ggc-map";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

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

  wmsLayerOptions: WmsLayerOptions = {
    layers: ["woonplaats"],
    url: "https://service.pdok.nl/kadaster/bag/wms/v2_0",
    tiled: true
  };
}
