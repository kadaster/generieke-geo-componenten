import { Component, inject, OnInit } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { GgcMapComponent, Webservice } from "@kadaster/ggc-map";
import {
  FeatureInfoDisplayType,
  GgcFeatureInfoComponent,
  GgcFeatureInfoConfigService,
  GgcFeatureInfoTabsComponent,
  SortFilterConfig
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
  templateUrl: "./example-feature-info-tabs.component.html"
})
export class ExampleFeatureInfoTabsComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/feature-info-tabs",
    title:
      "Toon informatie over geografische objecten op de kaart in tabbladen per kaartlaag",
    introduction:
      "Met het feature-informatie component kan informatie uit de WMTS- ,WMS-, GeoJSON-kaart(en) en OGC API vector Tiles getoond worden in een dialoog met of zonder tabbladen.",
    components: [Components.GGC_FEATURE_INFO],
    theme: [Themes.INFORMATIE_OP_KAART],
    tags: [Tags.FEATURE_INFO],
    imageLocation:
      "code/examples/example-map/example-feature-info-tabs/example-feature-info-tabs.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-map/example-feature-info-tabs/example-feature-info-adv.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/classes/feature-info_public-api.GgcFeatureInfo.html`;
  // DOCS-SKIP:END
  mapIndex = "featureInfoTabs";
  mapConfig: Webservice[];
  protected featureInfoDisplayType: FeatureInfoDisplayType =
    FeatureInfoDisplayType.LIST;
  protected showEmptyMessage = true;
  protected hidePagerWithOneFeature = true;
  private readonly featureInfoConfigService = inject(
    GgcFeatureInfoConfigService
  );
  private defaultTabOrder = [
    { layerName: "Gemeenten", tabIndex: 1 },
    { layerName: "Provincies", tabIndex: 2 }
  ] as SortFilterConfig[];
  private alternativeTabOrder = [
    { layerName: "Provincies", tabIndex: 1 },
    { layerName: "Gemeenten", tabIndex: 2 }
  ] as SortFilterConfig[];
  private tabOrder = this.defaultTabOrder;

  ngOnInit() {
    this.httpClient
      .get(
        "code/examples/example-map/example-feature-info-tabs/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
    this.featureInfoConfigService.setConfig(this.tabOrder);
  }

  public toggleTabOrder(): void {
    this.tabOrder =
      this.tabOrder === this.defaultTabOrder
        ? this.alternativeTabOrder
        : this.defaultTabOrder;
    this.featureInfoConfigService.setConfig(this.tabOrder);
  }
}
