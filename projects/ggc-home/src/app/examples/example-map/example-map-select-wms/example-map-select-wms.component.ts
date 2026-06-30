import {
  Component,
  inject,
  OnInit,
  signal,
  AfterViewInit,
  ChangeDetectionStrategy
} from "@angular/core";
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
import { FeatureCollectionForCoordinate } from "@kadaster/ggc-models";
import { RouterLink } from "@angular/router";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";

@Component({
  selector: "app-example-map-select",
  imports: [GgcMapComponent, ExampleFormatComponent, FormsModule, RouterLink],
  templateUrl: "./example-map-select-wms.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: "./example-map-select-wms.component.scss"
})
export class ExampleMapSelectWmsComponent
  extends ExampleFormatComponent
  implements OnInit, AfterViewInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/example-map-select-wms",
    title: "Objecten selecteren op de kaart (WMS/WMTS)",
    introduction:
      "Kies en markeer objecten door in de WMS/WMTS kaart te klikken.",
    components: [Components.GGC_MAP],
    theme: [Themes.INFORMATIE_OP_KAART],
    tags: [Tags.SELECT],
    imageLocation:
      "code/examples/example-map/example-map-select-wms/example-map-select-wms.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-map/example-map-select-wms/example-map-select-wms.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/interfaces/ggc-map_src_public-api.GgcSelectService.html`;
  // DOCS-SKIP:END
  protected mapConfig: Webservice[];
  protected mapIndex = "example-select";

  protected selectMode: "singleselect" | "multiselect" = "singleselect";
  protected geselecteerdeGemeentes = signal<string>("");

  private readonly selectService = inject(GgcSelectionService);

  private readonly selectStyle = new Style({
    fill: new Fill({
      color: "rgba(0, 147, 190, 0.2)"
    }),
    stroke: new Stroke({
      color: "#0093be",
      width: 3
    })
  });

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
        const features =
          (mapEvent.value as FeatureCollectionForCoordinate)
            .featureCollectionForLayers[0]?.features ?? [];
        const gemeentes: string[] = features.map(
          (feature: any) => feature?.values_?.naam
        );
        this.geselecteerdeGemeentes.set(
          gemeentes.length == 0 ? "" : gemeentes.join(", ")
        );
      }
    });
  }

  ngAfterViewInit() {
    this.selectService.startSelect(
      { selectMode: "single", style: this.selectStyle },
      this.mapIndex
    );
  }

  onSelectModeChange(mode: "singleselect" | "multiselect") {
    switch (mode) {
      case "singleselect":
        this.selectService.startSelect(
          { selectMode: "single", style: this.selectStyle },
          this.mapIndex
        );
        break;
      case "multiselect":
        this.selectService.startSelect(
          { selectMode: "multi", style: this.selectStyle },
          this.mapIndex
        );
        break;
    }
  }
}
