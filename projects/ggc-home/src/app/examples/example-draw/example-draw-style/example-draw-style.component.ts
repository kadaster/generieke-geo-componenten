import { Component, inject, model, OnInit } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import {
  GgcDrawService,
  GgcMapComponent,
  MapComponentDrawTypes,
  Webservice
} from "@kadaster/ggc-map";
import { ComponentInfo } from "../../component-info.model";
import { FormsModule } from "@angular/forms";
import { Components } from "../../components.enum";
import { Style } from "ol/style";
import Stroke from "ol/style/Stroke";
import { RouterModule } from "@angular/router";
import Fill from "ol/style/Fill";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "app-example-draw-style",
  imports: [ExampleFormatComponent, GgcMapComponent, FormsModule, RouterModule],
  templateUrl: "./example-draw-style.component.html",
  styleUrl: "./example-draw-style.component.scss"
})
export class ExampleDrawStyle extends ExampleFormatComponent implements OnInit {
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/draw-style",
    title: "Tekenen met eigen styling",
    introduction: "Gebruiken van een eigen stijl voor het tekenen op de kaart.",
    components: [Components.GGC_MAP],
    theme: [Themes.INFORMATIE_OP_KAART],
    tags: [Tags.DRAW, Tags.STYLE],
    imageLocation:
      "code/examples/example-draw/example-draw-style/example-draw-style.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-draw/example-draw-style/example-draw-style.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/classes/ggc-map_src_public-api.GgcDrawService.html`;
  // DOCS-SKIP:END
  mapConfig: Webservice[];
  drawing = model("line");

  private readonly drawService = inject(GgcDrawService);
  private readonly drawLayer = "drawLayerWithStyle";

  ngOnInit() {
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
            }),
            fill: new Fill({
              color: "rgba(118,0,150,0.3)"
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
            fill: new Fill({
              color: "rgba(255,196,0,0.51)"
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
    this.drawing.set("line");
    this.drawService.startDraw(
      this.drawLayer,
      MapComponentDrawTypes.LINESTRING,
      {}
    );
  }

  drawPolygon() {
    this.drawing.set("polygon");
    this.drawService.startDraw(
      this.drawLayer,
      MapComponentDrawTypes.POLYGON,
      {}
    );
  }
}
