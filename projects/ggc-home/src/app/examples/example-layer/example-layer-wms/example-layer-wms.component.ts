import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { GgcMapComponent, Webservice } from "@kadaster/ggc-map";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "app-example-search-location",
  imports: [GgcMapComponent, ExampleFormatComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: "./example-layer-wms.component.html"
})
export class ExampleLayerWmsComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/layer-wms",
    title: "Kaartlaag toevoegen: WMS (raster)",
    introduction:
      "Voeg een afbeelding als laag toe aan de kaart met Web Map Service (WMS).",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER],
    imageLocation:
      "code/examples/example-layer/example-layer-wms/example-layer-wms.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-layer/example-layer-wms/example-layer-wms.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/interfaces/ggc-map_src_public-api.WmsLayerOptions.html`;
  // DOCS-SKIP:END
  protected mapConfig: Webservice[];

  constructor() {
    super();
  }

  ngOnInit() {
    this.httpClient
      .get("code/examples/example-layer/example-layer-wms/kaartconfig.json")
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
  }
}
