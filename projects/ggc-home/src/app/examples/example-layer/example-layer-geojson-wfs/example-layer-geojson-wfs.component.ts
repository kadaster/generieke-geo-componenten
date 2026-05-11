import { Component, inject, OnInit } from "@angular/core";
import { GgcMapComponent, GgcMapService } from "@kadaster/ggc-map";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import Style, { StyleLike } from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";
import { Webservice } from "@kadaster/ggc-cesium/src/lib/model/interfaces";
import VectorLayer from "ol/layer/Vector";

@Component({
  selector: "app-example-search-location",
  imports: [GgcMapComponent, ExampleFormatComponent],
  templateUrl: "./example-layer-geojson-wfs.component.html",
  styleUrl: "./example-layer-geojson-wfs.component.scss"
})
export class ExampleLayerGeojsonWfsComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/layer-geojson-wfs",
    title: "Kaartlaag toevoegen: WFS (GeoJSON)",
    introduction:
      "Voeg een GeoJSON laag toe aan de kaart met Web Feature Service (WFS).",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER],
    imageLocation:
      "code/examples/example-layer/example-layer-geojson-wfs/example-layer-geojson-wfs.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-layer/example-layer-geojson-wfs/example-layer-geojson-wfs.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/interfaces/ggc-map_src_public-api.GeojsonLayerOptions.html`;
  // DOCS-SKIP:END
  protected mapConfig: Webservice[];

  private readonly customStyle: StyleLike = new Style({
    fill: new Fill({ color: [43, 196, 0, 0.3] }),
    stroke: new Stroke({ color: [245, 66, 66], width: 3 })
  });
  private useCustomStyle = false;

  private readonly mapService = inject(GgcMapService);

  ngOnInit() {
    this.httpClient
      .get(
        "code/examples/example-layer/example-layer-geojson-wfs/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
  }

  protected switchStyle() {
    this.useCustomStyle = !this.useCustomStyle;
    const geoJsonLayer = this.mapService.getLayer(
      "gemeentegebied"
    ) as VectorLayer;
    geoJsonLayer.setStyle(this.useCustomStyle ? this.customStyle : undefined);
  }
}
