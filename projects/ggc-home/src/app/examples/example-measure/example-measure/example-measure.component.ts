import {
  Component,
  inject,
  OnInit,
  signal,
  ChangeDetectionStrategy
} from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { GgcDrawService, GgcMapComponent, Webservice } from "@kadaster/ggc-map";
import { ComponentInfo } from "../../component-info.model";
import { FormsModule } from "@angular/forms";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";
import { MapComponentDrawTypes } from "@kadaster/ggc-models";

@Component({
  selector: "app-example-measure",
  imports: [ExampleFormatComponent, GgcMapComponent, FormsModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: "./example-measure.component.html"
})
export class ExampleMeasure extends ExampleFormatComponent implements OnInit {
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/measure",
    title: "Meten",
    introduction:
      "Lengtes en oppervlaktes laten zien bij het tekenen van een figuur.",
    components: [Components.GGC_MAP],
    theme: [Themes.TEKENEN],
    tags: [Tags.MEASURE],
    imageLocation:
      "code/examples/example-measure/example-measure/example-measure.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-measure/example-measure/example-measure.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/classes/ggc-map_src_public-api.GgcDrawService.html`;
  // DOCS-SKIP:END
  mapConfig: Webservice[];
  measuring = signal<MapComponentDrawTypes | undefined>(undefined);
  protected readonly mapComponentDrawTypes = MapComponentDrawTypes;

  protected readonly mapIndex = "measure";

  private readonly drawService = inject(GgcDrawService);
  private readonly measureLayer = "measure";

  ngOnInit() {
    this.httpClient
      .get(
        "code/examples/example-measure/example-measure-own-style-label/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
    this.measureLine();
  }

  measureLine() {
    this.measuring.set(MapComponentDrawTypes.LINESTRING);
    this.drawService.startDraw(
      this.measureLayer,
      MapComponentDrawTypes.LINESTRING,
      {
        showSegmentLength: true,
        showTotalLength: true
      },
      this.mapIndex
    );
  }

  measurePolygon() {
    this.measuring.set(MapComponentDrawTypes.POLYGON);
    this.drawService.startDraw(
      this.measureLayer,
      MapComponentDrawTypes.POLYGON,
      {
        showSegmentLength: true,
        showArea: true
      },
      this.mapIndex
    );
  }

  stopMeasureManual() {
    this.drawService.finishCurrentDraw(this.mapIndex);
  }

  clearMeasures() {
    this.drawService.clearLayer(this.measureLayer, this.mapIndex);
  }
}
