import { Component, OnInit } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { GgcMapComponent, Webservice } from "@kadaster/ggc-map";
import { GgcFeatureInfoComponent } from "@kadaster/ggc-feature-info";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "app-example-feature-info-basic",
  imports: [ExampleFormatComponent, GgcFeatureInfoComponent, GgcMapComponent],
  templateUrl: "./example-feature-info-basic.component.html"
})
export class ExampleFeatureInfoBasicComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/feature-info-basic",
    title: "Toon informatie over geografische objecten op de kaart.",
    introduction:
      "Met het feature-informatie component kan informatie uit de WMTS- ,WMS-, GeoJSON-kaart(en) en OGC API vector Tiles getoond worden in een dialoog met of zonder tabbladen.",
    components: [Components.GGC_FEATURE_INFO],
    theme: [Themes.INFORMATIE_OP_KAART],
    tags: [Tags.OBJECTINFO],
    imageLocation:
      "code/examples/example-map/example-feature-info-basic/example-feature-info-basic.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-map/example-feature-info-basic/example-feature-info-basic.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/classes/feature-info_public-api.GgcFeatureInfo.html`;
  // DOCS-SKIP:END
  protected mapIndex = "featureInfoBasic";
  protected mapConfig: Webservice[];

  ngOnInit() {
    this.httpClient
      .get(
        "code/examples/example-map/example-feature-info-basic/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
  }
}
