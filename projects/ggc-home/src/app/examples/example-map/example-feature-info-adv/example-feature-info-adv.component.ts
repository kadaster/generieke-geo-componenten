import { Component, inject, OnInit } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { GgcMapComponent, GgcMapService, Webservice } from "@kadaster/ggc-map";
import {
  FeatureInfoDisplayType,
  GgcFeatureInfoComponent
} from "@kadaster/ggc-feature-info";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";
import { FormsModule } from "@angular/forms";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";

@Component({
  selector: "app-example-feature-info-adv",
  imports: [
    ExampleFormatComponent,
    GgcFeatureInfoComponent,
    GgcMapComponent,
    FormsModule
  ],
  templateUrl: "./example-feature-info-adv.component.html"
})
export class ExampleFeatureInfoAdvComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/feature-info-adv",
    title: "Objectinformatie weergeven (uitgebreid)",
    introduction: "Toon informatie over geografische objecten op de kaart.",
    components: [Components.GGC_FEATURE_INFO],
    theme: [Themes.INFORMATIE_OP_KAART],
    tags: [Tags.OBJECTINFO],
    imageLocation:
      "code/examples/example-map/example-feature-info-adv/example-feature-info-adv.png"
  };
  urlComponentModule =
    "example-map/example-feature-info-adv/example-feature-info-adv.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/classes/feature-info_public-api.GgcFeatureInfo.html`;
  // DOCS-SKIP:END
  mapIndex = "featureInfoAdv";
  mapConfig: Webservice[];
  protected featureInfoDisplayType: FeatureInfoDisplayType =
    FeatureInfoDisplayType.LIST;
  protected showEmptyMessage = true;
  protected hidePagerWithOneFeature = false;
  private readonly mapService = inject(GgcMapService);

  private defaultHighlightStyle: Style = new Style({
    fill: new Fill({
      color: "rgba(0, 115, 149, 0.5)"
    }),
    stroke: new Stroke({
      color: "#007395",
      width: 5
    })
  });
  private alternativeHighlightStyle: Style = new Style({
    fill: new Fill({
      color: "rgba(0, 255, 0, 0.4)"
    }),
    stroke: new Stroke({
      color: "#00ff00",
      width: 3
    })
  });
  private highlightStyle = this.defaultHighlightStyle;

  ngOnInit() {
    this.httpClient
      .get(
        "code/examples/example-map/example-feature-info-adv/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
    this.mapService.changeHighlightLayerStyle(
      this.highlightStyle,
      this.mapIndex
    );
  }

  public toggleFeatureInfoDisplayType(): void {
    this.featureInfoDisplayType =
      this.featureInfoDisplayType === FeatureInfoDisplayType.LIST
        ? FeatureInfoDisplayType.TABLE
        : FeatureInfoDisplayType.LIST;
  }

  public toggleHighlightStyle(): void {
    this.highlightStyle =
      this.highlightStyle === this.defaultHighlightStyle
        ? this.alternativeHighlightStyle
        : this.defaultHighlightStyle;
    this.mapService.changeHighlightLayerStyle(
      this.highlightStyle,
      this.mapIndex
    );
  }
}
