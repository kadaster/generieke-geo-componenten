import { Component, OnInit } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { GgcMapComponent, Webservice } from "@kadaster/ggc-map";
import { GgcDatasetTreeComponent, Theme } from "@kadaster/ggc-dataset-tree";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "ggc-home-example-capabilities-layer-options",
  imports: [ExampleFormatComponent, GgcMapComponent, GgcDatasetTreeComponent],
  templateUrl: "./example-capabilities-layer-options.component.html"
})
export class ExampleCapabilitiesLayerOptionsComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/capabilities-layer-options",
    title: "Kaartlaagopties uit capabilities",
    introduction:
      "Vul o.a. de titel en het zichtbaarheidsbereik van kaartlagen automatisch aan vanuit de capabilities.",
    components: [Components.GGC_MAP, Components.GGC_DATASET_TREE],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER, Tags.DATASET],
    imageLocation:
      "code/examples/example-map/example-capabilities-layer-options/example-capabilities-layer-options.png"
  };
  urlComponentModule =
    "example-map/example-capabilities-layer-options/example-capabilities-layer-options.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/interfaces/ggc-map_src_public-api.AbstractConfigurableLayerOptions.html`;
  // DOCS-SKIP:END
  protected mapConfig: Webservice[];
  protected datasetTreeConfig: Theme[];
  protected mapIndex = "example-capabilities-layer-options";

  ngOnInit() {
    this.httpClient
      .get(
        "code/examples/example-map/example-capabilities-layer-options/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
    this.httpClient
      .get(
        "code/examples/example-map/example-capabilities-layer-options/treeconfig.json"
      )
      .subscribe((data) => {
        this.datasetTreeConfig = data as Theme[];
      });
  }
}
