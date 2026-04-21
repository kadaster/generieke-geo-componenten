import { Component, inject, signal } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import {
  GgcDrawService,
  GgcMapComponent,
  MapComponentDrawTypes,
  Webservice
} from "@kadaster/ggc-map";
import { ComponentInfo } from "../../component-info.model";
import { HttpClient } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "app-example-measure",
  imports: [ExampleFormatComponent, GgcMapComponent, FormsModule],
  templateUrl: "./example-measure.component.html",
  styleUrl: "./example-measure.component.scss"
})
export class ExampleMeasure extends ExampleFormatComponent {
  readonly componentInfo: ComponentInfo = {
    route: "/measure",
    title: "Meten",
    introduction: "Meet lengtes en oppervlaktes tijdens het tekenen.",
    components: [Components.GGC_MAP],
    theme: [Themes.INFORMATIE_OP_KAART],
    tags: [Tags.MEASURE],
    imageLocation:
      "code/examples/example-measure/example-measure/example-measure.png"
  } as ComponentInfo;

  mapConfig: Webservice[];
  measuring = signal<MapComponentDrawTypes | undefined>(undefined);
  protected readonly mapComponentDrawTypes = MapComponentDrawTypes;

  protected readonly mapIndex = "measure";
  private readonly httpClient = inject(HttpClient);
  private readonly drawService = inject(GgcDrawService);
  private readonly measureLayer = "measure";

  constructor() {
    super();
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
