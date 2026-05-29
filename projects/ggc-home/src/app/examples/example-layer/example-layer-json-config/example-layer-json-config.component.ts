import { Component, inject, OnInit } from "@angular/core";
import {
  GgcLayerService,
  GgcMapComponent,
  GgcMapService
} from "@kadaster/ggc-map";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";
import { FormsModule } from "@angular/forms";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";
import { Webservice } from "@kadaster/ggc-cesium";

@Component({
  selector: "app-example-search-location",
  imports: [GgcMapComponent, ExampleFormatComponent, FormsModule],
  templateUrl: "./example-layer-json-config.component.html",
  styleUrl: "./example-layer-json-config.component.scss"
})
export class ExampleLayerJsonConfig
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/layer-json-config",
    title: "Kaartlagen instellen met JSON (dynamisch)",
    introduction: "Voeg kaartlagen toe aan de kaart met JSON (aanbevolen).",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER],
    imageLocation:
      "code/examples/example-layer/example-layer-json-config/example-layer-json-config.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-layer/example-layer-json-config/example-layer-json-config.component.ts";
  // DOCS-SKIP:END
  selectedOpacity = "75";
  selectedZIndex = "20";

  protected mapConfig: Webservice[];

  private readonly layerService = inject(GgcLayerService);
  private readonly mapService = inject(GgcMapService);

  ngOnInit() {
    this.httpClient
      .get(
        "code/examples/example-layer/example-layer-json-config/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
  }

  protected toggleNatura2000Visibility() {
    this.layerService.toggleVisibility("natura2000");

    // Zet de opacity nog goed (als deze veranderd is terwijl de laag uit stond)
    this.changeOpacity();
  }

  protected onZIndexChange() {
    this.changeZIndex("landelijke-wandelroutes");
    this.changeZIndex("streekpaden");
  }

  private changeZIndex(layerId: string) {
    const layerConfig = this.layerService.getLayerConfig(
      layerId,
      DEFAULT_MAPINDEX
    );

    if (layerConfig) {
      layerConfig.zIndex = +this.selectedZIndex;
      this.layerService.removeLayer(DEFAULT_MAPINDEX, layerId);
      this.layerService.addWmsLayer(layerConfig);
    }
  }

  protected changeOpacity() {
    if (!this.layerService.isVisible("natura2000")) {
      return;
    }

    const layerConfig = this.layerService.getLayerConfig(
      "natura2000",
      DEFAULT_MAPINDEX
    );

    if (layerConfig) {
      layerConfig.opacity = +this.selectedOpacity / 100;
      this.layerService.removeLayer(DEFAULT_MAPINDEX, "natura2000");
      this.layerService.addWmsLayer(layerConfig);
    }
  }

  protected getOpacityForBackground(): number {
    const backgoundLayer = this.mapService.getLayer(
      "brtAchtergrondkaartStandaard",
      DEFAULT_MAPINDEX
    );
    if (!backgoundLayer) {
      return 1;
    }
    return backgoundLayer.getOpacity();
  }

  protected setOpacityForBackground(opacity: number) {
    const backgoundLayer = this.mapService.getLayer(
      "brtAchtergrondkaartStandaard",
      DEFAULT_MAPINDEX
    );
    if (!backgoundLayer) {
      return;
    }
    backgoundLayer.setOpacity(opacity);
  }
}
