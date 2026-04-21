import { Component, inject, OnInit, signal } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import {
  GgcDrawService,
  GgcMapComponent,
  GgcMapService,
  MapComponentDrawTypes,
  Webservice
} from "@kadaster/ggc-map";
import { ComponentInfo } from "../../component-info.model";
import { HttpClient } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { Components } from "../../components.enum";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";
import { StyleLikeMap } from "../../../../../../ggc-map/src/lib/model/draw-interaction-event.model";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import CircleStyle from "ol/style/Circle";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "app-example-draw-center-draw",
  imports: [ExampleFormatComponent, GgcMapComponent, FormsModule],
  templateUrl: "./example-draw-center-draw.component.html",
  styleUrl: "./example-draw-center-draw.component.scss"
})
export class ExampleDrawCenterDrawComponent
  extends ExampleFormatComponent
  implements OnInit
{
  readonly componentInfo: ComponentInfo = {
    route: "/draw-center-draw",
    title: "Tekenen met centrum van kaart",
    introduction: "Teken met het middelpunt van de kaart.",
    components: [Components.GGC_MAP],
    theme: [Themes.INFORMATIE_OP_KAART],
    tags: [Tags.DRAW, Tags.KEYBOARD],
    imageLocation:
      "code/examples/example-draw/example-draw-center-draw/example-draw-center-draw.png"
  } as ComponentInfo;

  mapConfig: Webservice[];
  activeDrawType = signal<MapComponentDrawTypes | undefined>(undefined);

  styleMap: StyleLikeMap = {
    drawingDrawStyle: new Style({
      stroke: new Stroke({
        color: "#008296",
        width: 3
      }),
      fill: new Fill({
        color: [255, 255, 255, 0.5]
      }),
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({
          color: "red"
        }),
        stroke: new Stroke({
          color: "white",
          width: 2
        })
      })
    }),
    finishDrawStyle: (): Style => {
      return new Style({
        stroke: new Stroke({
          color: "#008296",
          width: 3
        }),
        fill: new Fill({
          color: [255, 255, 255, 0.5]
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
      });
    }
  };

  protected readonly mapComponentDrawTypes = MapComponentDrawTypes;

  private readonly httpClient = inject(HttpClient);
  private readonly mapService = inject(GgcMapService);
  private readonly drawService = inject(GgcDrawService);
  private readonly drawLayer = "draw";

  constructor() {
    super();
    this.httpClient
      .get(
        "code/examples/example-draw/example-draw-center-draw/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
    this.drawService.setDrawStyle(this.drawLayer, this.styleMap);
  }

  ngOnInit() {
    setTimeout(() => {
      this.startDrawLine();
      this.setPoint();
    }, 100);
  }

  setPoint(): void {
    const center = this.mapService
      .getMap(DEFAULT_MAPINDEX)
      .getView()
      .getCenter() ?? [160000, 455000];
    this.drawService.appendCoordinates(center, DEFAULT_MAPINDEX);
  }

  startDrawPoint() {
    this.activeDrawType.set(MapComponentDrawTypes.POINT);
    this.drawService.startDraw(this.drawLayer, MapComponentDrawTypes.POINT, {
      centerDraw: true
    });
  }

  startDrawLine() {
    this.activeDrawType.set(MapComponentDrawTypes.LINESTRING);
    this.drawService.startDraw(
      this.drawLayer,
      MapComponentDrawTypes.LINESTRING,
      {
        centerDraw: true
      }
    );
  }

  startDrawPolygon() {
    this.activeDrawType.set(MapComponentDrawTypes.POLYGON);
    this.drawService.startDraw(this.drawLayer, MapComponentDrawTypes.POLYGON, {
      centerDraw: true,
      maxPoints: 10
    });
  }

  stopDrawing() {
    this.drawService.finishCurrentDraw();
    this.activeDrawType.set(undefined);
    this.drawService.stopDraw();
  }
}
