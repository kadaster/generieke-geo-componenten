import { Component, inject } from "@angular/core";
import {
  GgcGeojsonLayerComponent,
  GgcLayerBrtAchtergrondkaartComponent,
  GgcMapComponent,
  GgcMapService
} from "@kadaster/ggc-map";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import Style, { StyleLike } from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";
import { Webservice } from "@kadaster/ggc-cesium/src/lib/model/interfaces";
import { HttpClient } from "@angular/common/http";
import VectorLayer from "ol/layer/Vector";

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

  protected mapConfig: Webservice[];
  protected mapIndex = "geoJsonWfs";

  private customStyle: StyleLike = new Style({
    fill: new Fill({ color: [43, 196, 0, 0.3] }),
    stroke: new Stroke({ color: [245, 66, 66], width: 3 })
  });
  private useCustomStyle = false;
  private readonly httpClient = inject(HttpClient);
  private readonly mapService = inject(GgcMapService);

  constructor() {
    this.httpClient
      .get(
        "code/examples/example-layer/example-layer-geojson-wfs/kaartconfig.json"
      )
      .subscribe((data) => {
        console.log(data);
        this.mapConfig = data as Webservice[];
      });
  }

  protected switchStyle() {
    this.useCustomStyle = !this.useCustomStyle;
    const geoJsonLayer = this.mapService.getLayer(
      "gemeentegebied",
      this.mapIndex
    ) as VectorLayer;
    geoJsonLayer.setStyle(this.useCustomStyle ? this.customStyle : undefined);
  }
}
