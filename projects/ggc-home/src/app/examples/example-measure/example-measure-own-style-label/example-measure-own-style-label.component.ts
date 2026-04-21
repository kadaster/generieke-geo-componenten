import { Component, inject, model } from "@angular/core";
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
import { Fill, Style, Text } from "ol/style";
import Stroke from "ol/style/Stroke";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "app-example-measure-own-style-label",
  imports: [ExampleFormatComponent, GgcMapComponent, FormsModule],
  templateUrl: "./example-measure-own-style-label.component.html",
  styleUrl: "./example-measure-own-style-label.component.scss"
})
export class ExampleMeasureOwnStyleLabel extends ExampleFormatComponent {
  readonly componentInfo: ComponentInfo = {
    route: "/measure-own-style-label",
    title: "Meten met eigen label styling",
    introduction: "Toepassen van eigen stijl op labels tijdens het meten.",
    components: [Components.GGC_MAP],
    theme: [Themes.INFORMATIE_OP_KAART],
    tags: [Tags.MEASURE, Tags.STYLE],
    imageLocation:
      "code/examples/example-measure/example-measure-own-style-label/example-measure-own-style-label.png"
  } as ComponentInfo;

  mapConfig: Webservice[];
  measuring = model(false);

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

    this.drawService.setDrawStyle(this.measureLayer, {
      drawingDrawStyle: function () {
        return [
          new Style({
            stroke: new Stroke({
              color: "#008296",
              width: 3
            }),
            text: new Text({
              text: "Meten",
              fill: new Fill({
                color: "#000000"
              }),
              backgroundFill: new Fill({
                color: "rgba(244,125,46,0.93)"
              }),
              padding: [5, 6, 5, 6],
              offsetY: -15
            })
          }),
          new Style({
            stroke: new Stroke({
              color: "#008296",
              width: 3
            })
          })
        ];
      }
    });

    setTimeout(() => {
      this.measureLine();
    }, 100);
  }

  measureLine() {
    this.measuring.set(true);
    this.drawService.startDraw(
      this.measureLayer,
      MapComponentDrawTypes.LINESTRING,
      {}
    );
  }

  stopMeasureManual() {
    this.drawService.finishCurrentDraw();
  }
}
