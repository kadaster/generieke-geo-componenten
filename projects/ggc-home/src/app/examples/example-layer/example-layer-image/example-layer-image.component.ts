import { AfterViewInit, Component, inject } from "@angular/core";
import {
  GgcImageLayerComponent,
  GgcLayerBrtAchtergrondkaartComponent,
  GgcMapComponent,
  GgcMapService,
  ImageLayerOptions
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
    GgcImageLayerComponent,
    GgcLayerBrtAchtergrondkaartComponent
  ],
  templateUrl: "./example-layer-image.component.html",
  styleUrl: "./example-layer-image.component.scss"
})
export class ExampleLayerImageComponent implements AfterViewInit {
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

  imageLayerOptions: ImageLayerOptions = {
    url: "/code/examples/example-layer/example-layer-image/bestemmingsplan.png",
    layerName: "Bestemmingsplan",
    imageExtent: [193413, 465508, 194660, 466762],
    zIndex: 200
  };

  private readonly mapService: GgcMapService = inject(GgcMapService);

  ngAfterViewInit() {
    this.mapService.zoomToCoordinate([194195, 465885], undefined, 10);
  }
}
