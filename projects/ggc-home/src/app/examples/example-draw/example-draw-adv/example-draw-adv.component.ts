import { Component, inject, signal } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import {
  GgcDrawService,
  GgcMapComponent,
  MapComponentDrawTypes,
  Webservice
} from "@kadaster/ggc-map";
import { StyleLikeMap } from "@kadaster/ggc-map/src/lib/model/draw-interaction-event.model";
import Feature from "ol/Feature";
import { Geometry, Polygon } from "ol/geom";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import { HttpClient } from "@angular/common/http";
import { Tags } from "../../tags.enum";

@Component({
  selector: "app-example-draw-adv",
  imports: [ExampleFormatComponent, GgcMapComponent],
  templateUrl: "./example-draw-adv.component.html",
  styleUrl: "./example-draw-adv.component.scss"
})
export class ExampleDrawAdvComponent extends ExampleFormatComponent {
  readonly componentInfo: ComponentInfo = {
    route: "/draw-adv",
    title: "Tekenen met de muis",
    introduction:
      "Teken lijnen, polygonen, punten, rechthoeken en cirkels met de muis.",
    components: [Components.GGC_MAP],
    tags: [Tags.DRAW],
    imageLocation:
      "code/examples/example-draw/example-draw-basic/example-draw-basic.png"
  } as ComponentInfo;

  mapConfig: Webservice[];
  readonly maxPointsExample = 4;
  maxPoints = signal<number | undefined>(this.maxPointsExample);
  validatorsEnabled = signal(true);

  styleMap: StyleLikeMap = {
    invalidDrawStyle: new Style({
      fill: new Fill({ color: "rgba(208,12,12,0.82)" })
    }),
    invalidFinishDrawStyle: (): Style => {
      return new Style({
        fill: new Fill({ color: "rgba(208,12,12,0.56)" })
      });
    }
  };

  private readonly drawLayer = "draw";
  private readonly drawService = inject(GgcDrawService);
  private readonly httpClient = inject(HttpClient);
  private readonly zuidNederlandBbox = new Polygon([
    [
      [-65659.09753254626, 301541.95029904693],
      [313293.32215320657, 301541.95029904693],
      [313293.32215320657, 470092.1226485067],
      [-65659.09753254626, 470092.1226485067],
      [-65659.09753254626, 301541.95029904693]
    ]
  ]);

  constructor() {
    super();
    this.httpClient
      .get("code/examples/example-draw/kaartconfig.json")
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
    // Stop eventuele actieve draw-interactie van een vorige sessie
    this.drawService.stopDraw();
    // Stel de stijl in vóór start tekenen
    this.drawService.setDrawStyle(this.drawLayer, this.styleMap);
    this.startDrawPolygon();
  }

  finishDrawing() {
    this.drawService.finishCurrentDraw();
  }

  startDrawPolygon() {
    this.drawService.startDraw(this.drawLayer, MapComponentDrawTypes.POLYGON, {
      validators: this.validators,
      maxPoints: this.maxPoints()
    });
  }

  toggleInvalidDrawStyle() {
    this.drawService.stopDraw();
    this.validatorsEnabled.update((value) => !value);
    this.startDrawPolygon();
  }

  toggleMaxPoints() {
    this.drawService.stopDraw();
    this.maxPoints.update((value) =>
      value ? undefined : this.maxPointsExample
    );
    this.startDrawPolygon();
  }

  validateMaxSize = (feature: Feature<Geometry>): boolean => {
    return (feature.getGeometry() as Polygon).getArea() < 3000000000;
  };

  validateZuidNederland = (feature: Feature<Geometry>): boolean => {
    const coords = (feature.getGeometry() as Polygon).getCoordinates();
    return coords[0].reduce<boolean>((prev, coord): boolean => {
      if (!this.zuidNederlandBbox.intersectsCoordinate(coord)) {
        // Stop verder validatie door array te legen
        coords[0].splice(0, coords[0].length);
        return false;
      }
      return true;
    }, true);
  };

  get validators() {
    return this.validatorsEnabled()
      ? [this.validateMaxSize, this.validateZuidNederland]
      : [];
  }
}
