import { Component, inject, OnInit, signal } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import {
  GgcLayerService,
  GgcMapComponent,
  GgcMapService,
  Webservice
} from "@kadaster/ggc-map";
import { GgcLegendComponent } from "@kadaster/ggc-legend";
import { LayerChangedEventTrigger, Style } from "@kadaster/ggc-models";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

/** Een kaartlaag waarvoor in dit voorbeeld een stijl gekozen kan worden. */
interface StyleableLayer {
  layerId: string;
  title: string;
  styles: Style[];
  activeStyleName: string | undefined;
}

@Component({
  selector: "ggc-home-example-layer-styles",
  imports: [ExampleFormatComponent, GgcMapComponent, GgcLegendComponent],
  templateUrl: "./example-layer-styles.component.html"
})
export class ExampleLayerStylesComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/layer-styles",
    title: "Stijl van een kaartlaag wisselen",
    introduction:
      "Wissel van stijl op een kaartlaag; de kaart en de legenda worden automatisch bijgewerkt.",
    components: [Components.GGC_MAP, Components.GGC_LEGEND],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER, Tags.STYLE, Tags.LEGEND],
    imageLocation:
      "code/examples/example-layer/example-layer-styles/example-layer-styles.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-layer/example-layer-styles/example-layer-styles.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/classes/ggc-map_src_public-api.GgcLayerService.html`;
  // DOCS-SKIP:END

  protected readonly mapIndex = "example-layer-styles";
  protected mapConfig: Webservice[];
  protected readonly styleableLayers = signal<StyleableLayer[]>([]);

  private readonly layerService: GgcLayerService = inject(GgcLayerService);
  private readonly mapService: GgcMapService = inject(GgcMapService);

  ngOnInit() {
    this.httpClient
      .get("code/examples/example-layer/example-layer-styles/kaartconfig.json")
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });

    this.layerService.getLayerChangedObservable().subscribe((event) => {
      if (event.eventTrigger !== LayerChangedEventTrigger.LAYER_INITIALIZED) {
        return;
      }
      this.refreshStyleableLayers();
      if (event.layerId === "kadastralekaart") {
        this.mapService.zoomToCoordinate(
          [194290.41, 469436.395],
          this.mapIndex,
          13
        );
      }
    });
  }

  protected selectStyle(styleName: string, layerId: string) {
    this.layerService.setActiveStyle(styleName, layerId, this.mapIndex);
    this.refreshStyleableLayers();
  }

  private refreshStyleableLayers() {
    this.styleableLayers.set(
      (this.layerService.getLayerConfigs(this.mapIndex) ?? [])
        .flatMap((webservice) => webservice.layers)
        .filter((layerOptions) => layerOptions.layerId && layerOptions.styles)
        .map<StyleableLayer>((layerOptions) => {
          const layerId = layerOptions.layerId!;
          return {
            layerId,
            title: layerOptions.title ?? layerId,
            styles: this.layerService.getStyles(layerId, this.mapIndex),
            activeStyleName: this.layerService.getActiveStyle(
              layerId,
              this.mapIndex
            )?.name
          };
        })
    );
  }
}
