import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import {
  GeojsonLayerOptions,
  GgcDrawService,
  GgcGeojsonLayerComponent,
  GgcLayerBrtAchtergrondkaartComponent,
  GgcMapComponent,
  GgcSnapService,
  MapComponentDrawTypes,
  SnapOptions
} from "@kadaster/ggc-map";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "app-example-snapping-basic",
  imports: [
    GgcLayerBrtAchtergrondkaartComponent,
    GgcMapComponent,
    ExampleFormatComponent,
    GgcGeojsonLayerComponent
  ],
  templateUrl: "./example-snapping-basic.component.html",
  styleUrl: "./example-snapping-basic.component.scss"
})
export class ExampleSnappingBasicComponent
  extends ExampleFormatComponent
  implements OnInit, OnDestroy
{
  drawService = inject(GgcDrawService);
  snapService = inject(GgcSnapService);

  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/snapping-basic",
    title: "Snapping (verbinden)",
    introduction:
      "Bij het tekenen sluiten lijnen automatisch aan op andere geografische objecten.",
    components: [Components.GGC_MAP],
    theme: [Themes.INFORMATIE_OP_KAART],
    tags: [Tags.SNAP, Tags.DRAW],
    imageLocation:
      "code/examples/example-snapping/example-snapping-basic/example-snapping-basic.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-snapping/example-snapping-basic/example-snapping-basic.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/classes/ggc-map_src_public-api.GgcDrawService.html`;
  // DOCS-SKIP:END
  drawLayer = "drawLayer";
  mapIndex = "snapping";
  snapOptions: SnapOptions = {
    pixelTolerance: 10,
    vertex: true,
    edge: true,
    intersection: true,
    snapDrawLayers: [this.drawLayer],
    snapLayers: ["provincies"]
  };

  optionsProvincie: GeojsonLayerOptions = {
    mapIndex: this.mapIndex,
    layerId: "provincies",
    url: "https://service.pdok.nl/cbs/gebiedsindelingen/2023/wfs/v1_0?request=GetFeature&service=WFS&VERSION=2.0.0&typenames=provincie_gegeneraliseerd&outputformat=application/json",
    zIndex: 10,
    styleLike: new Style({
      stroke: new Stroke({
        color: "green",
        width: 2
      })
    })
  };

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.drawService.stopDraw();
    this.drawService.startDraw(
      this.drawLayer,
      MapComponentDrawTypes.LINESTRING,
      {},
      this.mapIndex
    );
    setTimeout(() => {
      this.snapService.startSnap(
        this.drawLayer,
        this.mapIndex,
        this.snapOptions
      );
    }, 500);
  }

  ngOnDestroy(): void {
    this.snapService.stopSnap(this.mapIndex);
    this.drawService.stopDraw(this.mapIndex);
  }
}
