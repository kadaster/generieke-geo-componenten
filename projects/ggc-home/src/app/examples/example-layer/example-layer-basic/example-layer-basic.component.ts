import { Component } from "@angular/core";
import {
  GgcLayerBrtAchtergrondkaartComponent,
  GgcMapComponent
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
    GgcLayerBrtAchtergrondkaartComponent
  ],
  templateUrl: "./example-layer-basic.component.html",
  styleUrl: "./example-layer-basic.component.scss"
})
export class ExampleLayerBasicComponent {
  readonly componentInfo: ComponentInfo = {
    route: "/layer-basic",
    title: "Kaartlaag: BRT achtergrondkaart",
    introduction: "Voeg een BRT laag toe aan de kaart.",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER],
    imageLocation:
      "code/examples/example-layer/example-layer-basic/example-layer-basic.png"
  } as ComponentInfo;
}
