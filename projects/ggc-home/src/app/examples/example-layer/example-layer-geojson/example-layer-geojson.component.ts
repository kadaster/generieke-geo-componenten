import { Component } from "@angular/core";
import {
  GeojsonLayerOptions,
  GgcGeojsonLayerComponent,
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
    GgcLayerBrtAchtergrondkaartComponent,
    GgcGeojsonLayerComponent
  ],
  templateUrl: "./example-layer-geojson.component.html",
  styleUrl: "./example-layer-geojson.component.scss"
})
export class ExampleLayerGeojsonComponent {
  readonly componentInfo: ComponentInfo = {
    route: "/layer-geojson",
    title: "Kaartlaag: GeoJSON",
    introduction: "Voeg een GeoJSON laag toe aan de kaart.",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER],
    imageLocation:
      "code/examples/example-layer/example-layer-geojson/example-layer-geojson.png"
  } as ComponentInfo;

  optionsGelderland: GeojsonLayerOptions = {
    url: "/code/examples/example-layer/example-layer-geojson/gelderland.json",
    zIndex: 10
  };
}
