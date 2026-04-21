import { Component, inject } from "@angular/core";
import {
  GgcLayerService,
  GgcMapComponent,
  GgcMapService
} from "@kadaster/ggc-map";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models/src/lib/constants";
import { FormsModule } from "@angular/forms";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "app-example-search-location",
  imports: [GgcMapComponent, ExampleFormatComponent, FormsModule],
  templateUrl: "./example-layer-advanced2.component.html",
  styleUrl: "./example-layer-advanced2.component.scss"
})
export class ExampleLayerAdvanced2Component {
  readonly componentInfo: ComponentInfo = {
    route: "/layer-advanced2",
    title: "Kaartlagen: JSON configuratie",
    introduction:
      "Voeg verschillende kaartlagen toe aan de kaart d.m.v. JSON (de aanbevolen manier).",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER],
    imageLocation:
      "code/examples/example-layer/example-layer-advanced2/example-layer-advanced2.png"
  } as ComponentInfo;

  readonly kaartConfig = [
    {
      url: "https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0?",
      type: "wmts",
      layers: [
        {
          layerId: "brtAchtergrondkaartStandaard",
          title: "BRT achtergrond kaart Standaard (WMTS)",
          layerName: "standaard",
          visible: true,
          zIndex: 1
        }
      ]
    },
    {
      type: "wms",
      url: "https://service.pdok.nl/rvo/natura2000/wms/v1_0",
      layers: [
        {
          layerId: "natura2000",
          title: "Natura 2000",
          visible: true,
          layerName: "natura2000",
          zIndex: 10,
          opacity: 0.75,
          tiled: true
        }
      ]
    },
    {
      type: "wms",
      url: "https://service.pdok.nl/wandelnet/landelijke-wandelroutes/wms/v1_0",
      layers: [
        {
          layerId: "landelijke-wandelroutes",
          title: "landelijke-wandelroutes",
          visible: true,
          layerName: "landelijke-wandelroutes",
          zIndex: 20,
          tiled: true
        },
        {
          layerId: "streekpaden",
          title: "streekpaden",
          visible: true,
          layerName: "streekpaden",
          zIndex: 20,
          tiled: true
        }
      ]
    }
  ];

  selectedOpacity = "75";
  selectedZIndex = "20";

  private readonly layerService = inject(GgcLayerService);
  private readonly mapService = inject(GgcMapService);

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
