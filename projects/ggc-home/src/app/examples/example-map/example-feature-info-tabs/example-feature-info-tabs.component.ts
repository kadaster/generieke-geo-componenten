import { Component, inject, OnInit, AfterViewInit } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import {
  GgcMapComponent,
  GgcMapService,
  GgcSelectionService,
  Webservice
} from "@kadaster/ggc-map";
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
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import { MapComponentEventTypes } from "@kadaster/ggc-models";

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
  private readonly mapService = inject(GgcMapService);
  private readonly featureInfoConfigService = inject(
    GgcFeatureInfoConfigService
  );

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
  private defaultTabOrder = [
    { layerName: "Gemeenten", tabIndex: 1 },
    { layerName: "Provincies", tabIndex: 2 }
  ] as SortFilterConfig[];
  private alternativeTabOrder = [
    { layerName: "Provincies", tabIndex: 1 },
    { layerName: "Gemeenten", tabIndex: 2 }
  ] as SortFilterConfig[];
  private tabOrder = this.defaultTabOrder;

  private readonly selectionService = inject(GgcSelectionService);

  ngOnInit() {
    this.httpClient
      .get(
        "code/examples/example-map/example-feature-info-tabs/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
    this.mapService.changeHighlightLayerStyle(
      this.highlightStyle,
      this.mapIndex
    );
    this.featureInfoConfigService.setConfig(this.tabOrder);
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

  public toggleTabOrder(): void {
    this.tabOrder =
      this.tabOrder === this.defaultTabOrder
        ? this.alternativeTabOrder
        : this.defaultTabOrder;
    this.featureInfoConfigService.setConfig(this.tabOrder);
  }
}
