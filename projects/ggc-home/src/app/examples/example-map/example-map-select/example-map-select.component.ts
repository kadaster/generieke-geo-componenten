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
import { pointerMove } from "ol/events/condition";

@Component({
  selector: "app-example-map-select",
  imports: [GgcMapComponent, ExampleFormatComponent, FormsModule],
  templateUrl: "./example-map-select.component.html",
  styleUrl: "./example-map-select.component.scss"
})
export class ExampleMapSelectComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/example-map-select",
    title: "Selecteren op de kaart",
    introduction: "Selecteer en highlight features op de kaart",
    components: [Components.GGC_MAP],
    theme: [Themes.INFORMATIE_OP_KAART],
    tags: [Tags.SELECT],
    imageLocation:
      "code/examples/example-map/example-map-select/example-select.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-map/example-map-select/example-map-select.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/interfaces/ggc-map_src_public-api.GgcSelectService.html`;
  // DOCS-SKIP:END
  protected mapConfig: Webservice[];
  protected mapIndex = "example-select";

  protected selectMode: "default" | "singleselect" | "multiselect" | "hover" =
    "singleselect";
  protected geselecteerdeProvincies = signal<string>("geen");

  private readonly selectService = inject(GgcSelectionService);

  ngOnInit() {
    this.httpClient
      .get("code/examples/example-map/example-map-select/kaartconfig.json")
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
    this.selectService.getObservable(this.mapIndex).subscribe((mapEvent) => {
      if (
        mapEvent.mapIndex == this.mapIndex &&
        mapEvent.type === "selectionServiceSelectionUpdated"
      ) {
        const provincies: string[] = (mapEvent.value ?? []).map(
          (feature: any) => feature?.values_?.statnaam
        );
        this.geselecteerdeProvincies.set(
          provincies.length == 0 ? "geen" : provincies.join(", ")
        );
      }
    });
    this.selectService.startSelect({ selectMode: "single" }, this.mapIndex);
  }

  onSelectModeChange(
    mode: "default" | "singleselect" | "multiselect" | "hover"
  ) {
    switch (mode) {
      case "singleselect":
        this.selectService.startSelect({ selectMode: "single" }, this.mapIndex);
        break;
      case "multiselect":
        this.selectService.startSelect({ selectMode: "multi" }, this.mapIndex);
        break;
      case "default":
        this.selectService.startSelect(
          { selectMode: "openlayersDefault" },
          this.mapIndex
        );
        break;
      case "hover":
        this.selectService.startSelect(
          { selectMode: "single", condition: pointerMove },
          this.mapIndex
        );
    }
  }
}
