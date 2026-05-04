import { Component, OnInit } from "@angular/core";
import { GgcMapComponent } from "@kadaster/ggc-map";
import { Webservice } from "@kadaster/ggc-cesium/src/lib/model/interfaces";
import { ExampleFormatComponent } from "../example-format/example-format.component";
import { ComponentInfo } from "../component-info.model";
import { Components } from "../components.enum";
import { Themes } from "../themes.enum";
import { Tags } from "../tags.enum";

@Component({
  selector: "app-example-search-location",
  imports: [GgcMapComponent, ExampleFormatComponent],
  templateUrl: "./example-map-zoom-scale-position.html",
  styleUrl: "./example-map-zoom-scale-position.scss"
})
export class ExampleMapZoomScalePosition
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/map-zoom-scale-position",
    title: "Kaart eigenschappen tonen (schaal, zoom niveau en muis positie)",
    introduction: "",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTBEDIENING],
    tags: [Tags.SCALE, Tags.ZOOM, Tags.LOCATION],
    imageLocation:
      "code/examples/example-layer/example-layer-wms/example-map-zoom-scale-position.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-layer/example-layer-wms/example-map-zoom-scale-position.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/modules/ggc-map_src_public-api.html`;
  // DOCS-SKIP:END
  protected mapConfig: Webservice[];

  constructor() {
    super();
  }

  ngOnInit() {
    this.httpClient
      .get(
        "code/examples/example-map/example-map-zoom-scale-position/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
  }
}
