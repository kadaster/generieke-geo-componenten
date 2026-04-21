import { Component } from "@angular/core";
import {
  GeojsonLayerOptions,
  GgcGeojsonLayerComponent,
  GgcLayerBrtAchtergrondkaartComponent,
  GgcMapComponent
} from "@kadaster/ggc-map";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
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
  templateUrl: "./example-layer-geojson-wfs.component.html",
  styleUrl: "./example-layer-geojson-wfs.component.scss"
})
export class ExampleLayerGeojsonWfsComponent {
  readonly componentInfo: ComponentInfo = {
    route: "/layer-geojson-wfs",
    title: "Kaartlaag: GeoJSON WFS",
    introduction: "Voeg een GeoJSON WFS laag toe aan de kaart.",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER],
    imageLocation:
      "code/examples/example-layer/example-layer-geojson-wfs/example-layer-geojson-wfs.png"
  } as ComponentInfo;

  optionsProvincie: GeojsonLayerOptions = {
    url: "https://service.pdok.nl/cbs/gebiedsindelingen/2026/wfs/v1_0?request=GetFeature&service=WFS&VERSION=2.0.0&typenames=provincie_gegeneraliseerd&outputformat=application/json",
    zIndex: 10
  };

  optionsProvincieCustomStyle = {
    ...this.optionsProvincie,
    styleLike: new Style({
      fill: new Fill({ color: [43, 196, 0, 0.3] }),
      stroke: new Stroke({ color: [245, 66, 66], width: 3 })
    })
  };

  protected useCustomStyles = false;
}
