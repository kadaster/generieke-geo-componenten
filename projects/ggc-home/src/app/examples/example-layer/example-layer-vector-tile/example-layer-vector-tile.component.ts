import { Component } from "@angular/core";
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

  vectorTileLayerOptions: VectorTileLayerOptions = {
    attributions: "PDOK",
    url: "https://api.pdok.nl/kadaster/brt-achtergrondkaart/ogc/v1/tiles/NetherlandsRDNewQuad/{z}/{y}/{x}?f=mvt",
    getFeatureInfoOnSingleclick: true,
    zIndex: 0,
    style:
      "https://api.pdok.nl/kadaster/brt-achtergrondkaart/ogc/v1/styles/darkmode__netherlandsrdnewquad?f=json",
    enableOverzoom: true
  };
}
