import { Component, inject, OnInit } from "@angular/core";
import {
  GgcMapComponent,
  GgcSelectionService,
  Webservice
} from "@kadaster/ggc-map";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "app-example-map-select",
  imports: [GgcMapComponent, ExampleFormatComponent],
  templateUrl: "./example-map-select.component.html"
})
export class ExampleMapSelectComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/example-map-select",
    title: "Selecteren op de kaart",
    introduction:
      "Voeg een GeoJSON laag toe aan de kaart met OGC API - Features.",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER, Tags.OGC_API],
    imageLocation:
      "code/examples/example-layer/example-layer-geojson-ogc/example-layer-geojson-ogc.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-map/example-map-select/example-map-select.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/interfaces/ggc-map_src_public-api.GgcSelectService.html`;
  // DOCS-SKIP:END
  protected mapConfig: Webservice[];
  protected mapIndex = "example-select";

  protected selectMode: "default" | "singleselect" | "multiselect" =
    "singleselect";

  private readonly selectService = inject(GgcSelectionService);

  ngOnInit() {
    this.httpClient
      .get("code/examples/example-map/example-map-select/kaartconfig.json")
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
    this.selectService.startSelect({ selectMode: "single" }, this.mapIndex);
  }

  onSelectModeChange(mode: "default" | "singleselect" | "multiselect") {}
}
