import { Component, inject, OnInit } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import {
  GgcLayerService,
  GgcMapComponent,
  GgcMapService,
  UrlParameter,
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
    title: "OGC API Features: parameters aanpassen",
    introduction: "Pas de URL-parameters van een GeoJSON-laag aan.",
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
  protected activeLocation: "perceel1" | "perceel2" | undefined;
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
    this.selectPerceel("9833");
  }

  selectPerceel2() {
    this.activeLocation = "perceel2";
    this.selectPerceel("7083");
  }

  private selectPerceel(perceelnummer: string) {
    const urlParameters: UrlParameter[] = [
      {
        parameterName: "kadastrale_gemeente_waarde",
        parameterValue: "Apeldoorn"
      },
      { parameterName: "sectie", parameterValue: "U" },
      { parameterName: "perceelnummer", parameterValue: perceelnummer }
    ];

    this.layerService.setUrlParameters(urlParameters, "perceel", this.mapIndex);
    this.layerService.setVisibilityLayers(["perceel"], true, this.mapIndex);
  }
}
