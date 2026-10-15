import { Component, inject, OnInit, signal } from "@angular/core";
import {
  GgcLayerService,
  GgcMapComponent,
  Webservice
} from "@kadaster/ggc-map";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";
import { LayerChangedEventTrigger, Style } from "@kadaster/ggc-models";
import { GgcLegendComponent } from "@kadaster/ggc-legend";

@Component({
  selector: "ggc-home-example-layer-styles",
  imports: [GgcMapComponent, GgcLegendComponent, ExampleFormatComponent],
  templateUrl: "./example-layer-styles.component.html",
  styleUrl: "./example-layer-styles.component.scss"
})
export class ExampleLayerStylesComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/layer-styles",
    title: "Styles gebruiken in WMS kaartlagen",
    introduction: "Kies en wijzig styles voor WMS kaartlagen.",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER],
    imageLocation:
      "code/examples/example-layer/example-layer-styles/example-layer-styles.png"
  };
  urlComponentModule =
    "example-layer/example-layer-styles/example-layer-styles.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/interfaces/ggc-map_src_public-api.VectorTileLayerOptions.html`;
  // DOCS-SKIP:END
  protected mapConfig: Webservice[];
  protected mapIndex = "layer-styles-mapindex";
  protected styles = signal<Style[]>([]);
  protected activeStyle = signal<string | undefined>(undefined);

  private layerService = inject(GgcLayerService);
  private layerId = "bag-panden";

  ngOnInit() {
    this.httpClient
      .get("code/examples/example-layer/example-layer-styles/kaartconfig.json")
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
    this.layerService.getLayerChangedObservable().subscribe((event) => {
      if (
        event.mapIndex === this.mapIndex &&
        event.layerId === this.layerId &&
        event.eventTrigger === LayerChangedEventTrigger.LAYER_ADDED
      ) {
        this.styles.set(
          this.layerService.getStyles(this.layerId, this.mapIndex)
        );
        const activeStyle = this.layerService.getActiveStyle(
          this.layerId,
          this.mapIndex
        );
        this.activeStyle.set(activeStyle?.name ?? undefined);
      }
    });
  }

  onStyleSelectionChange(styleName: string) {
    this.layerService.setActiveStyle(styleName, this.layerId, this.mapIndex);
    this.activeStyle.set(styleName);
  }
}
