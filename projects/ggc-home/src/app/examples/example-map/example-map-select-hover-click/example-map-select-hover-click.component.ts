import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  signal
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
import { pointerMove } from "ol/events/condition";
import { FeatureCollectionForCoordinate } from "@kadaster/ggc-models";
import { GgcFeatureInfoComponent } from "@kadaster/ggc-feature-info";

@Component({
  selector: "app-example-map-select",
  imports: [
    GgcMapComponent,
    ExampleFormatComponent,
    FormsModule,
    GgcFeatureInfoComponent
  ],
  templateUrl: "./example-map-select-hover-click.component.html",
  styleUrl: "./example-map-select-hover-click.component.scss"
})
export class ExampleMapSelectHoverClickComponent
  extends ExampleFormatComponent
  implements OnInit, AfterViewInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/example-map-select-hover-click",
    title: "Objecten selecteren met hover en klik",
    introduction:
      "Kies en markeer objecten door de muis over de kaart te bewegen of te klikken.\n",
    components: [Components.GGC_MAP, Components.GGC_FEATURE_INFO],
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

  protected currentHoverGemeente = signal<string>("geen");
  protected readonly selectIndexClick = "selectIndexClick";
  private readonly selectIndexHover = "selectIndexHover";

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
      .getObservable(this.mapIndex, this.selectIndexHover)
      .subscribe((mapEvent) => {
        if (mapEvent.type === "selectionServiceSelectionUpdated") {
          const features =
            (mapEvent.value as FeatureCollectionForCoordinate)
              .featureCollectionForLayers[0]?.features ?? [];
          const gemeentes: string[] = features.map(
            (feature: any) => feature?.values_?.statnaam
          );
          this.currentHoverGemeente.set(
            gemeentes.length == 0 ? "geen" : gemeentes[0]
          );
        }
      });
  }

  ngAfterViewInit() {
    this.selectService.startSelect(
      { selectMode: "single", condition: pointerMove },
      this.mapIndex,
      this.selectIndexHover
    );
    this.selectService.startSelect(
      { selectMode: "single" },
      this.mapIndex,
      this.selectIndexClick
    );
  }
}
