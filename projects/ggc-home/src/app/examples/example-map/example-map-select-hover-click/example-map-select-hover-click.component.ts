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
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";

@Component({
  selector: "app-example-map-select",
  imports: [GgcMapComponent, ExampleFormatComponent, FormsModule],
  templateUrl: "./example-map-select-hover-click.component.html",
  styleUrl: "./example-map-select-hover-click.component.scss"
})
export class ExampleMapSelectHoverClickComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/example-map-select-hover-click",
    title: "Selecteren met hover en klik",
    introduction:
      "Selecteer en highlight features met zowel een hover en een klik op dezelfde kaart",
    components: [Components.GGC_MAP],
    theme: [Themes.INFORMATIE_OP_KAART],
    tags: [Tags.SELECT],
    imageLocation:
      "code/examples/example-map/example-map-select-hover-click/example-select.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-map/example-map-select-hover-click/example-map-select-hover-click.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/interfaces/ggc-map_src_public-api.GgcSelectService.html`;
  // DOCS-SKIP:END
  protected mapConfig: Webservice[];
  protected mapIndex = "example-select";

  protected geselecteerdeGemeente = signal<string>("geen");
  protected currentHoverGemeente = signal<string>("geen");

  private readonly selectIndexHover = "selectIndexHover";
  private readonly selectIndexClick = "selectIndexClick";
  private readonly clickSelectStyle = new Style({
    fill: new Fill({
      color: "rgba(255, 0, 0, 0.2)"
    }),
    stroke: new Stroke({
      color: "#ff0000",
      width: 4,
      lineJoin: "round"
    })
  });

  private readonly selectService = inject(GgcSelectionService);

  ngOnInit() {
    this.httpClient
      .get(
        "code/examples/example-map/example-map-select-hover-click/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
    this.selectService
      .getObservable(this.selectIndexClick)
      .subscribe((mapEvent) => {
        if (mapEvent.type === "selectionServiceSelectionUpdated") {
          const gemeentes: string[] = (mapEvent.value ?? []).map(
            (feature: any) =>
              feature?.values_?.statnaam +
              " (" +
              feature?.values_?.statcode +
              ")"
          );
          this.geselecteerdeGemeente.set(
            gemeentes.length == 0 ? "geen" : gemeentes[0]
          );
        }
      });
    this.selectService
      .getObservable(this.selectIndexHover)
      .subscribe((mapEvent) => {
        if (mapEvent.type === "selectionServiceSelectionUpdated") {
          const gemeentes: string[] = (mapEvent.value ?? []).map(
            (feature: any) => feature?.values_?.statnaam
          );
          this.currentHoverGemeente.set(
            gemeentes.length == 0 ? "geen" : gemeentes[0]
          );
        }
      });

    this.selectService.startSelect(
      { selectMode: "single", condition: pointerMove },
      this.mapIndex,
      this.selectIndexHover
    );
    this.selectService.startSelect(
      { selectMode: "single", style: this.clickSelectStyle },
      this.mapIndex,
      this.selectIndexClick
    );
  }
}
