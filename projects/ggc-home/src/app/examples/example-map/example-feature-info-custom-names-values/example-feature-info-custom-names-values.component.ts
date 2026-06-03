import { Component, OnInit } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { GgcMapComponent, Webservice } from "@kadaster/ggc-map";
import { GgcFeatureInfoComponent } from "@kadaster/ggc-feature-info";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "app-example-feature-info-custom-names-values",
  imports: [ExampleFormatComponent, GgcFeatureInfoComponent, GgcMapComponent],
  templateUrl: "./example-feature-info-custom-names-values.component.html",
  styleUrl: "./example-feature-info-custom-names-values.component.scss"
})
export class ExampleFeatureInfoCustomNamesValuesComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/feature-info-custom-names-values",
    title: "Aangepaste Feature Info weergeven",
    introduction: "Toon feature info voor één of meer kaartlagen.",
    components: [Components.GGC_FEATURE_INFO],
    theme: [Themes.INFORMATIE_OP_KAART],
    tags: [Tags.FEATURE_INFO],
    imageLocation:
      "code/examples/example-map/example-feature-info-custom-names-values/example-feature-info-custom-names-values.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-map/example-feature-info-custom-names-values/example-feature-info-custom-names-values.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/classes/feature-info_public-api.GgcFeatureInfo.html`;
  // DOCS-SKIP:END
  mapIndex = "featureInfoCustomNamesValues";
  mapConfig: Webservice[];

  ngOnInit() {
    this.httpClient
      .get(
        "code/examples/example-map/example-feature-info-custom-names-values/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
  }
}
