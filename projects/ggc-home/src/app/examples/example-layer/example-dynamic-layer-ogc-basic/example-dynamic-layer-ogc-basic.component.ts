import { Component, inject, OnInit } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import {
  GgcLayerService,
  GgcMapComponent,
  GgcMapService,
  Webservice
} from "@kadaster/ggc-map";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "ggc-home-example-dynamic-layer-ogc-basic",
  imports: [ExampleFormatComponent, GgcMapComponent],
  templateUrl: "./example-dynamic-layer-ogc-basic.component.html"
})
export class ExampleDynamicLayerOgcBasicComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/dynamic-layer-ogc-basic",
    title: "OGC API feature dynamisch toevoegen aan kaartlaag",
    introduction: "Voeg een OGC feature toe aan een GeoJSON kaartlaag.",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER, Tags.OGC_API],
    imageLocation:
      "code/examples/example-layer/example-dynamic-layer-ogc-basic/example-dynamic-layer-ogc-basic.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-layer/example-dynamic-layer-ogc-basic/example-dynamic-layer-ogc-basic.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/classes/ggc-map_src_public-api.GgcLayerService.html`;
  // DOCS-SKIP:END

  protected mapConfig: Webservice[];
  protected activeLocation:
    "perceel1" | "perceel2" | "perceel3" | "perceel4" | undefined;
  protected readonly mapIndex = "mapName";

  private layerService: GgcLayerService = inject(GgcLayerService);
  private mapService: GgcMapService = inject(GgcMapService);

  ngOnInit() {
    this.httpClient
      .get(
        "code/examples/example-layer/example-dynamic-layer-ogc-basic/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });

    this.layerService.getLayerChangedObservable().subscribe(() => {
      // zoom to location when layer is loaded
      this.mapService.zoomToCoordinate(
        [194290.41, 469436.395],
        this.mapIndex,
        12
      );
    });
  }

  selectPerceel1() {
    this.activeLocation = "perceel1";
    this.addFeatureToGeoJsonLayer("Apeldoorn&perceelnummer=9833&sectie=U");
  }

  selectPerceel2() {
    this.activeLocation = "perceel2";
    this.addFeatureToGeoJsonLayer("Apeldoorn&perceelnummer=7083&sectie=U");
  }

  private addFeatureToGeoJsonLayer(kadastraleGemeenteWaarde: string) {
    this.layerService.removeLayer(this.mapIndex, "perceel");
    this.layerService.addGeojsonLayer({
      url: `https://api.pdok.nl/kadaster/brk-kadastrale-kaart/ogc/v1/collections/perceel/items?crs=http://www.opengis.net/def/crs/EPSG/0/28992&f=json&limit=100&filter-lang=cql2-text&kadastrale_gemeente_waarde=${kadastraleGemeenteWaarde}`,
      layerId: "perceel",
      title: "Perceel",
      zIndex: 20,
      mapIndex: this.mapIndex
    });
  }
}
