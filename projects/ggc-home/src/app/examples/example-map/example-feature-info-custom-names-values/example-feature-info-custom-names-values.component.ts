import { Component, inject, OnInit } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { GgcMapComponent, Webservice } from "@kadaster/ggc-map";
import {
  CustomFeatureInfo,
  GgcFeatureInfoComponent,
  GgcFeatureInfoConfigService
} from "@kadaster/ggc-feature-info";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "ggc-home-example-feature-info-custom-names-values",
  imports: [ExampleFormatComponent, GgcFeatureInfoComponent, GgcMapComponent],
  templateUrl: "./example-feature-info-custom-names-values.component.html"
})
export class ExampleFeatureInfoCustomNamesValuesComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/feature-info-custom-names-values",
    title: "Objectinformatie aangepast weergeven",
    introduction:
      "Toon informatie over geografische objecten op de kaart in een eigen weergave.",
    components: [Components.GGC_FEATURE_INFO],
    theme: [Themes.INFORMATIE_OP_KAART],
    tags: [Tags.OBJECTINFO],
    imageLocation:
      "code/examples/example-map/example-feature-info-custom-names-values/example-feature-info-custom-names-values.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-map/example-feature-info-custom-names-values/example-feature-info-custom-names-values.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/classes/feature-info_public-api.GgcFeatureInfo.html`;
  // DOCS-SKIP:END
  mapIndex = "featureInfoCustomNamesValues";
  mapConfig: Webservice[];
  customAttributeNamesAndValues: Map<string, CustomFeatureInfo>;
  private readonly featureInfoConfigService = inject(
    GgcFeatureInfoConfigService
  );

  ngOnInit() {
    this.httpClient
      .get(
        "code/examples/example-map/example-feature-info-custom-names-values/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
    this.setCustomFeatureInfoNames();
    this.featureInfoConfigService.setConfig([
      {
        layerId: "gemeenten",
        attributeOrder: ["naam", "code", "ligtInProvincieNaam"],
        hideUnorderedAttributes: true
      }
    ]);
  }

  setCustomFeatureInfoNames() {
    const customFeatureInfoMap = new Map<string, CustomFeatureInfo>();
    customFeatureInfoMap.set(
      "naam",
      new CustomFeatureInfo({
        customAttributeValueFunction: this.changeGemeenteNaam
      })
    );
    customFeatureInfoMap.set(
      "code",
      new CustomFeatureInfo({
        customAttributeName: "gemeente code",
        customAttributeValueFunction: this.changeGemeenteCode
      })
    );
    customFeatureInfoMap.set(
      "ligtInProvincieNaam",
      new CustomFeatureInfo({
        customAttributeName: "ligt in "
      })
    );

    this.customAttributeNamesAndValues = customFeatureInfoMap;
  }

  changeGemeenteCode(code: string | number): string {
    return "GM" + code;
  }
  changeGemeenteNaam(naam: string | number): string {
    return "gemeente " + naam;
  }
}
