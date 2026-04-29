import { AfterViewInit, Component, inject } from "@angular/core";
import {
  GgcLayerBrtAchtergrondkaartComponent,
  GgcMapComponent,
  GgcMapService,
  GgcWmtsLayerComponent,
  WmtsLayerOptions
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
    GgcWmtsLayerComponent
  ],
  templateUrl: "./example-layer-wmts.component.html",
  styleUrl: "./example-layer-wmts.component.scss"
})
export class ExampleLayerWmtsComponent implements AfterViewInit {
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
  // DOCS-SKIP:END
  wmtsLayerOptions: WmtsLayerOptions = {
    layer: "Kadastralekaart",
    url: "https://service.pdok.nl/kadaster/kadastralekaart/wmts/v5_0"
  };

  private readonly mapService: GgcMapService = inject(GgcMapService);

  ngAfterViewInit() {
    this.mapService.zoomToCoordinate([194195, 465885], undefined, 12);
  }
}
