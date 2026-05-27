import { Component, inject, OnInit, signal } from "@angular/core";
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
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-example-map-select",
  imports: [GgcMapComponent, ExampleFormatComponent, FormsModule],
  templateUrl: "./example-map-select-wms.component.html",
  styleUrl: "./example-map-select-wms.component.scss"
})
export class ExampleMapSelectWmsComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/example-map-select-wms",
    title: "Selecteren op de kaart (WMS/WMTS)",
    introduction: "Selecteer en highlight features op de WMS/WMTS kaarten",
    components: [Components.GGC_MAP],
    theme: [Themes.INFORMATIE_OP_KAART],
    tags: [Tags.SELECT],
    imageLocation:
      "code/examples/example-map/example-map-select-wms/example-select.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-map/example-map-select-wms/example-map-select-wms.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/interfaces/ggc-map_src_public-api.GgcSelectService.html`;
  // DOCS-SKIP:END
  protected mapConfig: Webservice[];
  protected mapIndex = "example-select";

  protected selectMode: "singleselect" | "multiselect" = "singleselect";
  protected geselecteerdeGemeentes = signal<string>("geen");

  private readonly selectService = inject(GgcSelectionService);

  ngOnInit() {
    this.httpClient
      .get("code/examples/example-map/example-map-select-wms/kaartconfig.json")
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
    this.selectService.getObservable(this.mapIndex).subscribe((mapEvent) => {
      if (
        mapEvent.mapIndex == this.mapIndex &&
        mapEvent.type === "selectionServiceSelectionUpdated"
      ) {
        const gemeentes: string[] = (mapEvent.value ?? []).map(
          (feature: any) => feature?.values_?.naam
        );
        this.geselecteerdeGemeentes.set(
          gemeentes.length == 0 ? "geen" : gemeentes.join(", ")
        );
      }
    });
    this.selectService.startSelect({ selectMode: "single" }, this.mapIndex);
  }

  onSelectModeChange(mode: "singleselect" | "multiselect") {
    switch (mode) {
      case "singleselect":
        this.selectService.startSelect({ selectMode: "single" }, this.mapIndex);
        break;
      case "multiselect":
        this.selectService.startSelect({ selectMode: "multi" }, this.mapIndex);
        break;
    }
  }
}
