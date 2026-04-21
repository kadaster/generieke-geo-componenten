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
import { Style } from "ol/style";
import Stroke from "ol/style/Stroke";
import { RouterModule } from "@angular/router";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "app-example-draw-style",
  imports: [ExampleFormatComponent, GgcMapComponent, FormsModule, RouterModule],
  templateUrl: "./example-draw-style.component.html",
  styleUrl: "./example-draw-style.component.scss"
})
export class ExampleDrawStyle extends ExampleFormatComponent {
  readonly componentInfo: ComponentInfo = {
    route: "/draw-style",
    title: "Tekenen met eigen styling",
    introduction: "Toepassen van eigen tekenstijl tijdens het tekenen.",
    components: [Components.GGC_MAP],
    theme: [Themes.INFORMATIE_OP_KAART],
    tags: [Tags.DRAW, Tags.STYLE],
    imageLocation:
      "code/examples/example-draw/example-draw-style/example-draw-style.png"
  } as ComponentInfo;

  mapConfig: Webservice[];
  drawing = model(false);

  private readonly httpClient = inject(HttpClient);
  private readonly drawService = inject(GgcDrawService);
  private readonly drawLayer = "draw";

  constructor() {
    super();
    this.httpClient
      .get("code/examples/example-draw/example-draw-style/kaartconfig.json")
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });

    this.drawService.setDrawStyle(this.drawLayer, {
      drawingDrawStyle: function () {
        return [
          new Style({
            stroke: new Stroke({
              color: "#760096",
              width: 6
            })
          }),
          new Style({
            stroke: new Stroke({
              color: "#760096",
              width: 4
            })
          })
        ];
      },
      finishDrawStyle: function () {
        return [
          new Style({
            stroke: new Stroke({
              color: "#1c9600",
              width: 6
            }),
            image: new CircleStyle({
              radius: 6,
              fill: new Fill({
                color: "#008296"
              }),
              stroke: new Stroke({
                color: "white",
                width: 2
              })
            })
          }),
          new Style({
            stroke: new Stroke({
              color: "#1c9600",
              width: 4
            }),
            image: new CircleStyle({
              radius: 6,
              fill: new Fill({
                color: "#008296"
              }),
              stroke: new Stroke({
                color: "white",
                width: 2
              })
            })
          })
        ];
      }
    });

    setTimeout(() => {
      this.drawLine();
    }, 100);
  }

  drawLine() {
    this.drawing.set(true);
    this.drawService.startDraw(
      this.drawLayer,
      MapComponentDrawTypes.LINESTRING,
      {}
    );
  }

  finishCurrentDraw() {
    this.drawService.finishCurrentDraw();
  }
}
