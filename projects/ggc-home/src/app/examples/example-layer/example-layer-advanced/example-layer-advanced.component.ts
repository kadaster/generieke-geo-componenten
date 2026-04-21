import { Component, inject, OnInit } from "@angular/core";
import {
  GgcCapabilitiesService,
  GgcLayerBrtAchtergrondkaartComponent,
  GgcLayerService,
  GgcMapComponent,
  GgcWmsLayerComponent,
  WmsLayerOptions
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
  imports: [
    GgcMapComponent,
    ExampleFormatComponent,
    GgcLayerBrtAchtergrondkaartComponent,
    GgcWmsLayerComponent,
    FormsModule
  ],
  templateUrl: "./example-layer-advanced.component.html",
  styleUrl: "./example-layer-advanced.component.scss"
})
export class ExampleLayerAdvancedComponent implements OnInit {
  readonly componentInfo: ComponentInfo = {
    route: "/layer-advanced",
    title: "Kaartlagen: HTML configuratie",
    introduction:
      "Voeg verschillende kaartlagen toe aan de kaart d.m.v. HTML configuratie.",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER],
    imageLocation:
      "code/examples/example-layer/example-layer-advanced/example-layer-advanced.png"
  } as ComponentInfo;

  wandelrouteLayerOptions: WmsLayerOptions = {
    layers: ["landelijke-wandelroutes", "streekpaden"],
    url: "https://service.pdok.nl/wandelnet/landelijke-wandelroutes/wms/v1_0",
    tiled: true,
    zIndex: 20
  };

  wandelrouteZIndex20 = { ...this.wandelrouteLayerOptions, zIndex: 20 };
  wandelrouteZIndex5 = { ...this.wandelrouteLayerOptions, zIndex: 5 };
  wandelrouteZIndexMin5 = { ...this.wandelrouteLayerOptions, zIndex: -5 };
  selectedZIndex = "20";
  selectedOpacity = "75";

  wmsLayerOptionsNatura2000: WmsLayerOptions;

  private readonly layerService = inject(GgcLayerService);
  private readonly ggcCapabilitiesService = inject(GgcCapabilitiesService);
  private layerAdded = false;

  ngOnInit(): void {
    const natura2000Url = "https://service.pdok.nl/rvo/natura2000/wms/v1_0";
    this.ggcCapabilitiesService
      .getServiceFromCapabilities(natura2000Url, "WMS")
      .subscribe((services) => {
        const natura2000Layer = services?.layers.find(
          (layer) => layer.title === "natura2000"
        );

        if (natura2000Layer) {
          this.wmsLayerOptionsNatura2000 = {
            layers: [natura2000Layer.title ?? ""],
            layerId: natura2000Layer.title,
            url: natura2000Url,
            tiled: true,
            mapIndex: DEFAULT_MAPINDEX,
            zIndex: 10,
            opacity: 0.75
          };

          this.switchLayer();
        }
      });
  }

  protected changeOpacity() {
    this.wmsLayerOptionsNatura2000.opacity = +this.selectedOpacity / 100;

    // Alleen als de laag is toegevoegd passen we de opacity toe door de laag
    // te verwijderen en opnieuw toe te voegen
    if (this.layerAdded) {
      this.switchLayer();
      this.switchLayer();
    }
  }

  protected switchLayer() {
    if (this.layerAdded) {
      this.layerService.removeLayer(
        DEFAULT_MAPINDEX,
        this.wmsLayerOptionsNatura2000.layerId ?? ""
      );
    } else {
      this.layerService.addWmsLayer(this.wmsLayerOptionsNatura2000);
    }
    this.layerAdded = !this.layerAdded;
  }
}
