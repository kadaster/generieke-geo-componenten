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

@Component({
  selector: "ggc-home-example-layer-styles-capabilities-vector-tile",
  imports: [GgcMapComponent, ExampleFormatComponent],
  templateUrl: "./example-layer-styles-capabilities-vector-tile.component.html",
  styleUrl: "./example-layer-styles-capabilities-vector-tile.component.scss"
})
export class ExampleLayerStylesCapabilitiesVectorTileComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/layer-styles-capabilities-vector-tile",
    title: "Styles uit de capabilities van een OGC API Vector Tile kaartlaag",
    introduction:
      "Haal de styles van een OGC API Vector Tile kaartlaag automatisch op uit de capabilities van de service.",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER, Tags.STYLE, Tags.OGC_API],
    imageLocation:
      "code/examples/example-layer/example-layer-styles-capabilities-vector-tile/example-layer-styles-capabilities-vector-tile.png"
  };
  urlComponentModule =
    "example-layer/example-layer-styles-capabilities-vector-tile/example-layer-styles-capabilities-vector-tile.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/interfaces/ggc-map_src_public-api.VectorTileLayerOptions.html`;
  // DOCS-SKIP:END
  protected mapConfig: Webservice[];
  protected mapIndex = "layer-styles-capabilities-vector-tile-mapindex";
  protected styles = signal<Style[]>([]);
  protected activeStyle = signal<string | undefined>(undefined);

  private layerService = inject(GgcLayerService);
  private layerId = "bestuurlijke-gebieden";

  ngOnInit() {
    this.httpClient
      .get(
        "code/examples/example-layer/example-layer-styles-capabilities-vector-tile/kaartconfig.json"
      )
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
        this.activeStyle.set(
          this.layerService.getActiveStyle(this.layerId, this.mapIndex)?.name
        );
      }
    });
  }

  onStyleSelectionChange(styleName: string) {
    this.layerService.setActiveStyle(styleName, this.layerId, this.mapIndex);
    this.activeStyle.set(styleName);
  }
}
