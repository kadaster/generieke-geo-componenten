import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Input,
  OnInit
} from "@angular/core";
import { Feature, Map as OLMap, VectorTile, View } from "ol";
import { applyStyle } from "ol-mapbox-style";
import { getCenter } from "ol/extent";
import { MVT } from "ol/format";
import { Geometry, LineString, Point } from "ol/geom";
import { fromExtent } from "ol/geom/Polygon";
import VectorTileLayer from "ol/layer/VectorTile";
import { Projection } from "ol/proj";
import VectorTileSource from "ol/source/VectorTile.js";
import {
  exhaustiveGuard,
  MapboxStyleService
} from "../service/mapbox-style.service";
import {
  LayerType,
  LegendItem,
  MapboxStyle
} from "../model/legend-mapbox.model";

@Component({
  selector: "ggc-mapbox-legend-item",
  templateUrl: "./mapbox-legend-item.component.html",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapboxLegendItemComponent implements OnInit {
  @Input() item!: LegendItem;
  @Input() mapboxStyle!: MapboxStyle;

  mapboxStyleService: MapboxStyleService = inject(MapboxStyleService);
  elementRef = inject(ElementRef);
  private extent: number[];
  private map: OLMap;
  private vectorSource!: VectorTileSource;
  private vectorLayer: VectorTileLayer;
  private projection!: Projection;
  private readonly itemLeft = 10;
  private readonly itemRight = 50;
  private readonly _itemHeight = 20;
  private readonly _itemWidth = 50;

  get itemHeight() {
    return this._itemHeight;
  }
  get itemWidth() {
    return this._itemWidth;
  }

  ngOnInit() {
    this.extent = [0, 0, this.itemWidth, this.itemHeight];
    this.projection = new Projection({
      code: "pixel-map",
      units: "pixels",
      extent: this.extent
    });
    this.vectorSource = new VectorTileSource({
      format: new MVT(),
      projection: this.projection
    });
    this.vectorLayer = new VectorTileLayer({
      source: this.vectorSource
    });
    this.map = new OLMap({
      controls: [],
      interactions: [],
      layers: [this.vectorLayer],
      view: new View({
        projection: this.projection,
        center: getCenter(this.extent),
        zoom: 2,
        minZoom: 2,
        maxZoom: 2
      })
    });
    const feature = this.newFeature(this.item);
    this.vectorLayer.getSource()?.setTileLoadFunction((tile) => {
      const vectorTile = tile as VectorTile<Feature>;
      vectorTile.setLoader(() => {
        const features: Feature<Geometry>[] = [];
        features.push(feature);
        vectorTile.setFeatures(features);
      });
    });
    const resolutions: number[] = [];
    resolutions.push(1);
    const sources = this.mapboxStyleService.getLayersids(this.mapboxStyle);
    applyStyle(
      this.vectorLayer,
      this.mapboxStyle,
      sources,
      undefined,
      resolutions
    )
      .then(() => {
        this.vectorLayer.getSource()?.refresh();
        const mapdiv: HTMLElement =
          this.elementRef.nativeElement.querySelector("[id='itemmap']");
        this.map.setTarget(mapdiv);
      })
      .catch((err: any) => {
        console.warn("error loading legend style: " + " " + err);
      });
  }

  private newFeature(item: LegendItem): Feature {
    switch (item.geoType) {
      case LayerType.Fill: {
        const ageom = fromExtent(this.extent);
        ageom.scale(0.05, 0.05);
        const f = new Feature({
          geometry: ageom,
          layer: item.sourceLayer
        });
        f.setProperties(item.properties);

        return f;
      }
      case LayerType.Circle:
      case LayerType.Raster:
      case LayerType.Symbol: {
        const f = new Feature({
          geometry: new Point(getCenter(this.extent)),
          layer: item.sourceLayer
        });
        f.setProperties(item.properties);
        return f;
      }
      case LayerType.Line: {
        const half = this.itemHeight / 2;
        const f = new Feature({
          geometry: new LineString([
            [this.itemLeft, half],
            [this.itemRight, half]
          ]),
          layer: item.sourceLayer
        });
        f.setProperties(item.properties);
        return f;
      }
      default: {
        exhaustiveGuard(item.geoType);
      }
    }
  }
}
