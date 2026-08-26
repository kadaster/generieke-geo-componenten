import { Component, OnInit } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { GgcMapComponent, Webservice } from "@kadaster/ggc-map";
import {
  GgcFeatureInfoComponent,
  ValueTemplateDirective,
  ValueTemplateDirectiveType
} from "@kadaster/ggc-feature-info";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: "ggc-home-example-feature-info-template",
  imports: [GgcFeatureInfoComponent, GgcMapComponent, ValueTemplateDirective],
  templateUrl: "./example-feature-info-template.component.html"
})
export class ExampleFeatureInfoTemplateComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/feature-info-template",
    title: "Objectinformatie weergeven met eigen templates",
    introduction:
      "Toon informatie over geografische objecten op de kaart met eigen templates.",
    components: [Components.GGC_FEATURE_INFO],
    theme: [Themes.INFORMATIE_OP_KAART],
    tags: [Tags.OBJECTINFO],
    imageLocation:
      "code/examples/example-map/example-feature-info-template/example-feature-info-template.png"
  };
  urlComponentModule =
    "example-map/example-feature-info-template/example-feature-info-template.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/classes/feature-info_public-api.GgcFeatureInfo.html`;
  // DOCS-SKIP:END
  types = ValueTemplateDirectiveType;
  protected mapIndex = "featureInfoTemplate";
  protected mapConfig: Webservice[];

  ngOnInit() {
    this.httpClient
      .get(
        "code/examples/example-map/example-feature-info-template/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
  }
}
