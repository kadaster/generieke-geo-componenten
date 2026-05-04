import { Component, inject, OnInit, OnDestroy } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
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
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import { Geometry, LineString, MultiPolygon } from "ol/geom";
import { Segment } from "ol/interaction/Snap";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "app-example-snapping-adv",
  imports: [
    ExampleFormatComponent,
    GgcGeojsonLayerComponent,
    GgcLayerBrtAchtergrondkaartComponent,
    GgcMapComponent,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: "./example-snapping-adv.component.html",
  styleUrl: "./example-snapping-adv.component.scss"
})
export class ExampleSnappingAdvComponent
  extends ExampleFormatComponent
  implements OnInit, OnDestroy
{
  drawService = inject(GgcDrawService);
  snapService = inject(GgcSnapService);

  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/snapping-advanced",
    title: "Snapping (verbinden, uitgebreid)",
    introduction:
      "Bij het tekenen sluiten lijnen automatisch aan op andere geografische objecten.",
    components: [Components.GGC_MAP],
    tags: [Tags.SNAP, Tags.DRAW],
    imageLocation:
      "code/examples/example-snapping/example-snapping-basic/example-snapping-basic.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-snapping/example-snapping-adv/example-snapping-adv.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/classes/ggc-map_src_public-api.GgcDrawService.html`;
  // DOCS-SKIP:END

  drawLayer = "drawLayerAdvanced";
  mapIndex = "snappingAdvanced";
  pixelTolerance = 10;
  segmentersEnabled = false;
  snapDrawLayer = true;
  snapProvincieLayer = true;
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

  private _snapOptions: SnapOptions = {
    pixelTolerance: 10,
    vertex: true,
    edge: true,
    intersection: true,
    snapDrawLayers: [this.drawLayer],
    snapLayers: ["provincies"]
  };

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
    this.updateSnapLayers();
  }

  ngOnDestroy(): void {
    this.snapService.stopSnap(this.mapIndex);
    this.drawService.stopDraw(this.mapIndex);
  }

  setPixelTolerance(event: Event) {
    const target = event.target as HTMLInputElement;
    const pixelTolerance = Number(target.value);
    this.snapOptions = {
      ...this.snapOptions,
      pixelTolerance
    };
  }

  toggleEdge(): void {
    this.snapOptions = {
      ...this.snapOptions,
      edge: !this.snapOptions.edge
    };
  }

  toggleIntersection(): void {
    this.snapOptions = {
      ...this.snapOptions,
      intersection: !this.snapOptions.intersection
    };
  }

  toggleSegmenterSnapping() {
    this.segmentersEnabled = !this.segmentersEnabled;

    this.snapOptions.segmenters = this.segmentersEnabled
      ? {
          MultiPolygon: (geom: Geometry) => {
            const multiPolygon = geom as MultiPolygon;
            const segments: Segment[] = [];
            for (const polygon of multiPolygon.getPolygons()) {
              for (const ring of polygon.getLinearRings()) {
                const cords = ring.getCoordinates();
                for (let i = 0; i < cords.length - 1; i++) {
                  const c1 = cords[i];
                  const c2 = cords[i + 1];
                  const midpoint = [(c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2];
                  segments.push([c1, midpoint], [midpoint, c2]);
                }
              }
            }
            return segments;
          },
          LineString: (geom: Geometry) => {
            const line = geom as LineString;
            const segments: Segment[] = [];
            const coords = line.getCoordinates();

            for (let i = 0; i < coords.length - 1; i++) {
              const c1 = coords[i];
              const c2 = coords[i + 1];
              const midpoint = [(c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2];
              segments.push([c1, midpoint], [midpoint, c2]);
            }

            return segments;
          }
        }
      : undefined;
    this.snapService.stopSnap(this.mapIndex);
    this.snapService.startSnap(this.drawLayer, this.mapIndex, this.snapOptions);
  }

  toggleSnapDrawLayer(): void {
    this.snapDrawLayer = !this.snapDrawLayer;
    this.updateSnapLayers();
  }

  toggleSnapProvincieLayer(): void {
    this.snapProvincieLayer = !this.snapProvincieLayer;
    this.updateSnapLayers();
  }

  toggleVertex(): void {
    this.snapOptions = {
      ...this.snapOptions,
      vertex: !this.snapOptions.vertex
    };
  }

  updateSnapLayers(): void {
    const snapLayers =
      this.snapProvincieLayer && this.optionsProvincie.layerId
        ? [this.optionsProvincie.layerId]
        : [];
    const snapDrawLayers = this.snapDrawLayer ? [this.drawLayer] : [];

    this.snapOptions = {
      ...this.snapOptions,
      snapLayers,
      snapDrawLayers
    };
  }

  get snapOptions(): SnapOptions {
    return this._snapOptions;
  }

  set snapOptions(value: SnapOptions) {
    this._snapOptions = value;

    this.snapService.stopSnap(this.mapIndex);
    console.log("snappen met snapoptions: ", this.snapOptions);
    this.snapService.startSnap(this.drawLayer, this.mapIndex, this.snapOptions);
  }
}
