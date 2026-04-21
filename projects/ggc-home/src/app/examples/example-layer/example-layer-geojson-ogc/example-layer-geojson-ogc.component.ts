import { AfterViewInit, Component, inject } from "@angular/core";
import {
  GeojsonLayerOptions,
  GgcGeojsonLayerComponent,
  GgcLayerBrtAchtergrondkaartComponent,
  GgcMapComponent,
  GgcMapService
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
  templateUrl: "./example-layer-geojson-ogc.component.html",
  styleUrl: "./example-layer-geojson-ogc.component.scss"
})
export class ExampleLayerGeojsonOgcComponent implements AfterViewInit {
  readonly componentInfo: ComponentInfo = {
    route: "/layer-geojson-ogc",
    title: "Kaartlaag: GeoJSON OGC",
    introduction: "Voeg een GeoJSON OGC laag toe aan de kaart.",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER, Tags.OGC_API],
    imageLocation:
      "code/examples/example-layer/example-layer-geojson-ogc/example-layer-geojson-ogc.png"
  } as ComponentInfo;

  optionsBuurt: GeojsonLayerOptions = {
    url: "https://api.pdok.nl/lv/bgt/ogc/v1/collections/buurt/items?crs=http://www.opengis.net/def/crs/EPSG/0/28992&f=json&limit=100&bbox=189555,465100,200880,473760&bbox-crs=http://www.opengis.net/def/crs/EPSG/0/28992&datetime=2024-10-15T00:00:00.000Z",
    zIndex: 10,
    layerId: "gemeentegebied",
    maxFeatures: 100
  };

  private readonly mapService = inject(GgcMapService);

  ngAfterViewInit(): void {
    this.mapService.zoomToCoordinate([194195, 465885], undefined, 6);
  }
}
