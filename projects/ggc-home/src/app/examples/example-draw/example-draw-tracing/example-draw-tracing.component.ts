import { Component, inject, OnInit, signal } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";
import {
  GeojsonLayerOptions,
  GgcDrawService,
  GgcMapComponent,
  Webservice
} from "@kadaster/ggc-map";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import { MapComponentDrawTypes, Webservice2DType } from "@kadaster/ggc-models";
import Fill from "ol/style/Fill";

@Component({
  selector: "ggc-home-example-draw-tracing",
  imports: [ExampleFormatComponent, GgcMapComponent],
  templateUrl: "./example-draw-tracing.component.html"
})
export class ExampleDrawTracingComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/draw-tracing",
    title: "Tekenen met traceren",
    introduction:
      "Bij het tekenen automatisch bestaande lijnen of vlakken volgen.",
    components: [Components.GGC_MAP],
    theme: [Themes.TEKENEN],
    tags: [Tags.DRAW, Tags.TRACE],
    imageLocation:
      "code/examples/example-draw/example-draw-tracing/example-draw-tracing.png"
  };
  urlComponentModule =
    "example-draw/example-draw-tracing/example-draw-tracing.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/classes/ggc-map_src_public-api.GgcDrawService.html`;
  // DOCS-SKIP:END
  mapConfig: Webservice[] = [
    {
      url: "https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0?",
      type: Webservice2DType.WMTS,
      layers: [
        {
          layerId: "brtAchtergrondkaartGrijs",
          title: "BRT achtergrond kaart Grijs(WMTS)",
          layerName: "grijs",
          zIndex: -20
        }
      ]
    },
    {
      type: Webservice2DType.GEOJSON,
      url: "https://service.pdok.nl/cbs/gebiedsindelingen/2026/wfs/v1_0?request=GetFeature&service=WFS&VERSION=2.0.0&typenames=provincie_gegeneraliseerd&outputformat=application/json",
      layers: [
        {
          layerId: "provincies",
          title: "Provincies",
          zIndex: 20,
          styleLike: new Style({
            stroke: new Stroke({
              color: "orange",
              width: 2
            })
          })
        } as GeojsonLayerOptions
      ]
    },
    {
      type: Webservice2DType.GEOJSON,
      url: "https://service.pdok.nl/cbs/gebiedsindelingen/2023/wfs/v1_0?request=GetFeature&service=WFS&VERSION=2.0.0&typenames=gemeente_gegeneraliseerd&outputformat=application/json",
      layers: [
        {
          layerId: "gemeentes",
          title: "Gemeentes",
          zIndex: 10,
          styleLike: new Style({
            stroke: new Stroke({
              color: "black",
              width: 1
            })
          })
        } as GeojsonLayerOptions
      ]
    }
  ];
  activeDrawType = signal<MapComponentDrawTypes | undefined>(undefined);
  protected readonly mapComponentDrawTypes = MapComponentDrawTypes;
  private readonly drawService = inject(GgcDrawService);
  private readonly drawLayer = "draw";

  ngOnInit() {
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
      this.startDrawLine();
    }, 500);
  }

  startDrawLine() {
    this.activeDrawType.set(MapComponentDrawTypes.LINESTRING);
    this.drawService.startDraw(
      this.drawLayer,
      MapComponentDrawTypes.LINESTRING,
      {
        trace: true,
        traceSourceId: "provincies",
        traceSnapTolerance: 10
      }
    );
  }

  startDrawPolygon() {
    this.activeDrawType.set(MapComponentDrawTypes.POLYGON);
    this.drawService.startDraw(this.drawLayer, MapComponentDrawTypes.POLYGON, {
      trace: true,
      traceSourceId: "gemeentes",
      traceSnapTolerance: 10
    });
  }
}
