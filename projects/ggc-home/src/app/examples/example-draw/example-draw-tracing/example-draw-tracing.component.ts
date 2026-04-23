import { Component, inject, signal } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";
import {
  GeojsonLayerOptions,
  GgcDrawService,
  GgcGeojsonLayerComponent,
  GgcLayerBrtAchtergrondkaartComponent,
  GgcMapComponent,
  MapComponentDrawTypes
} from "@kadaster/ggc-map";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";

@Component({
  selector: "app-example-draw-tracing",
  imports: [
    ExampleFormatComponent,
    GgcMapComponent,
    GgcLayerBrtAchtergrondkaartComponent,
    GgcGeojsonLayerComponent
  ],
  templateUrl: "./example-draw-tracing.component.html",
  styleUrl: "./example-draw-tracing.component.scss"
})
export class ExampleDrawTracingComponent extends ExampleFormatComponent {
  readonly componentInfo: ComponentInfo = {
    route: "/draw-tracing",
    title: "Tekenen met behulp van traceren (overtrekken)",
    introduction:
      "Teken een lijn of polygon, door middel van het overtrekken van een lijn of vlak uit een bestaande GeoJSON laag",
    components: [Components.GGC_MAP],
    theme: [Themes.INFORMATIE_OP_KAART],
    tags: [Tags.DRAW, Tags.TRACE],
    imageLocation:
      "code/examples/example-draw/example-draw-tracing/example-draw-tracing.png"
  } as ComponentInfo;

  activeDrawType = signal<MapComponentDrawTypes | undefined>(undefined);
  optionsProvincie: GeojsonLayerOptions = {
    layerId: "provincies",
    url: "https://service.pdok.nl/cbs/gebiedsindelingen/2023/wfs/v1_0?request=GetFeature&service=WFS&VERSION=2.0.0&typenames=provincie_gegeneraliseerd&outputformat=application/json",
    styleLike: new Style({
      stroke: new Stroke({
        color: "orange",
        width: 2
      })
    }),
    zIndex: 2
  };
  optionsGemeente: GeojsonLayerOptions = {
    layerId: "gemeentes",
    url: "https://service.pdok.nl/cbs/gebiedsindelingen/2023/wfs/v1_0?request=GetFeature&service=WFS&VERSION=2.0.0&typenames=gemeente_gegeneraliseerd&outputformat=application/json",
    styleLike: new Style({
      stroke: new Stroke({
        color: "black",
        width: 1
      })
    })
  };
  protected readonly mapComponentDrawTypes = MapComponentDrawTypes;
  protected mapIndex = "trace-map";
  private readonly drawService = inject(GgcDrawService);
  private readonly drawLayer = "draw";

  constructor() {
    super();
    this.drawService.stopDraw();
  }

  startDrawLine() {
    this.activeDrawType.set(MapComponentDrawTypes.LINESTRING);
    this.drawService.startDraw(
      this.drawLayer,
      MapComponentDrawTypes.LINESTRING,
      { trace: true, traceSourceId: "provincies", traceSnapTolerance: 10 },
      DEFAULT_MAPINDEX
    );
  }

  startDrawPolygon() {
    this.activeDrawType.set(MapComponentDrawTypes.POLYGON);
    this.drawService.startDraw(
      this.drawLayer,
      MapComponentDrawTypes.POLYGON,
      { trace: true, traceSourceId: "gemeentes", traceSnapTolerance: 20 },
      DEFAULT_MAPINDEX
    );
  }
}
