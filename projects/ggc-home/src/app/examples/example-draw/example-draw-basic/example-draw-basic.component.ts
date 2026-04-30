import { Component, inject, OnInit, signal } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import {
  GgcDrawService,
  GgcMapComponent,
  MapComponentDrawTypes,
  Webservice
} from "@kadaster/ggc-map";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "app-example-draw-basic",
  imports: [ExampleFormatComponent, GgcMapComponent],
  templateUrl: "./example-draw-basic.component.html",
  styleUrl: "./example-draw-basic.component.scss"
})
export class ExampleDrawBasicComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/draw-basic",
    title: "Tekenen met de muis",
    introduction:
      "Teken lijnen, punten, vlakken, rechthoeken en cirkels met de muis.",
    components: [Components.GGC_MAP],
    theme: [Themes.INFORMATIE_OP_KAART],
    tags: [Tags.DRAW],
    imageLocation:
      "code/examples/example-draw/example-draw-basic/example-draw-basic.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-draw/example-draw-basic/example-draw-basic.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/classes/ggc-map_src_public-api.GgcDrawService.html`;
  // DOCS-SKIP:END
  mapConfig: Webservice[];
  activeDrawType = signal<MapComponentDrawTypes | undefined>(undefined);

  protected readonly mapComponentDrawTypes = MapComponentDrawTypes;

  private readonly drawService = inject(GgcDrawService);
  private readonly drawLayer = "draw";

  ngOnInit() {
    this.httpClient
      .get("code/examples/example-draw/kaartconfig.json")
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
    this.drawService.stopDraw();
    this.startDrawLine();
  }

  finishDrawing() {
    this.drawService.finishCurrentDraw();
    this.activeDrawType.set(undefined);
    this.drawService.stopDraw();
  }

  startDrawPoint() {
    this.activeDrawType.set(MapComponentDrawTypes.POINT);
    this.drawService.startDraw(this.drawLayer, MapComponentDrawTypes.POINT, {});
  }

  startDrawLine() {
    this.activeDrawType.set(MapComponentDrawTypes.LINESTRING);
    this.drawService.startDraw(
      this.drawLayer,
      MapComponentDrawTypes.LINESTRING,
      {}
    );
  }

  startDrawRectangle() {
    this.activeDrawType.set(MapComponentDrawTypes.RECTANGLE);
    this.drawService.startDraw(
      this.drawLayer,
      MapComponentDrawTypes.RECTANGLE,
      {}
    );
  }

  startDrawCircle() {
    this.activeDrawType.set(MapComponentDrawTypes.CIRCLE);
    this.drawService.startDraw(
      this.drawLayer,
      MapComponentDrawTypes.CIRCLE,
      {}
    );
  }

  startDrawPolygon() {
    this.activeDrawType.set(MapComponentDrawTypes.POLYGON);
    this.drawService.startDraw(
      this.drawLayer,
      MapComponentDrawTypes.POLYGON,
      {}
    );
  }
}
