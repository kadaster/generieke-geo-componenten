import { Component, OnInit } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { GgcMapComponent, Webservice } from "@kadaster/ggc-map";
import {
  FeatureInfoDisplayType,
  GgcFeatureInfoComponent,
  GgcFeatureInfoTabsComponent
} from "@kadaster/ggc-feature-info";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-example-feature-info-tabs",
  imports: [
    ExampleFormatComponent,
    GgcFeatureInfoComponent,
    GgcMapComponent,
    GgcFeatureInfoTabsComponent,
    FormsModule
  ],
  templateUrl: "./example-feature-info-tabs.component.html",
  styleUrl: "./example-feature-info-tabs.component.scss"
})
export class ExampleFeatureInfoTabsComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/feature-info-tabs",
    title: "Feature Info weergeven in tabs",
    introduction: "Toon feature info voor één of meer kaartlagen.",
    components: [Components.GGC_FEATURE_INFO],
    theme: [Themes.INFORMATIE_OP_KAART],
    tags: [Tags.FEATURE_INFO],
    imageLocation:
      "code/examples/example-map/example-feature-info-tabs/example-feature-info-tabs.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-map/example-feature-info-tabs/example-feature-info-tabs.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/classes/feature-info_public-api.GgcFeatureInfo.html`;
  // DOCS-SKIP:END
  mapIndex = "featureInfoTabs";
  mapConfig: Webservice[];
  protected featureInfoDisplayType: FeatureInfoDisplayType =
    FeatureInfoDisplayType.LIST;
  protected showEmptyMessage = true;
  protected hidePagerWithOneFeature = true;

  ngOnInit() {
    this.httpClient
      .get(
        "code/examples/example-map/example-feature-info-tabs/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
  }

  public toggleFeatureInfoDisplayType(): void {
    this.featureInfoDisplayType =
      this.featureInfoDisplayType === FeatureInfoDisplayType.LIST
        ? FeatureInfoDisplayType.TABLE
        : FeatureInfoDisplayType.LIST;
  }
}
