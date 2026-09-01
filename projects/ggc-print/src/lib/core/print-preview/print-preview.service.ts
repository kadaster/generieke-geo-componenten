import { inject, Injectable } from "@angular/core";
import Collection from "ol/Collection";
import { Coordinate } from "ol/coordinate";
import { EventsKey } from "ol/events";
import { Extent, getCenter } from "ol/extent";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import { fromExtent } from "ol/geom/Polygon";
import Translate, { TranslateEvent } from "ol/interaction/Translate";
import Vector from "ol/layer/Vector";
import Map from "ol/Map";
import { unByKey } from "ol/Observable";
import VectorSource from "ol/source/Vector";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style, { StyleLike } from "ol/style/Style";
import { MapAreaSizeInPixels } from "../../model/print-request/mapfish-print-properties";
import { calculatePrintRectangle } from "../print-utils";
import { GgcMapService } from "@kadaster/ggc-map";

@Injectable()
export class PrintPreviewService {
  private mapService = inject(GgcMapService);
  private printRectangle: Extent;

  private map: Map;
  private feature: Feature<Geometry>;
  private translateInteraction: Translate;
  private translateLayer: Vector<VectorSource<Feature<Geometry>>>;
  private translateSubscription: EventsKey;

  private mapAreaSize: MapAreaSizeInPixels | undefined;
  private scale: number | undefined;
  private center: Coordinate;

  prepareMapForPrintPreview(mapIndex?: string, previewStyle?: StyleLike): void {
    this.map = this.mapService.getMap(mapIndex);
    this.createFeatureAndLayer(previewStyle);
    this.createTranslateInteractionForFeature();
  }

  getCenterFromPrintPreview(): Coordinate | undefined {
    return this.center;
  }

  clearPrintPreview(): void {
    // remove interaction and subscription
    unByKey(this.translateSubscription);
    this.map.removeInteraction(this.translateInteraction);

    this.translateLayer.setMap(null);
  }

  updateMapAreaSize(mapAreaSize: MapAreaSizeInPixels): void {
    this.mapAreaSize = mapAreaSize;
    this.updatePrintPreview();
  }

  updateScale(scale: number): void {
    this.scale = scale;
    this.updatePrintPreview();
  }

  updateCenter(newCenter: Coordinate): void {
    this.center = newCenter;
    this.updatePrintPreview();
  }

  private updatePrintPreview(): void {
    this.calculateCenter();
    if (this.mapAreaSize && this.scale && this.center) {
      this.printRectangle = calculatePrintRectangle(
        this.mapAreaSize,
        this.scale,
        this.center
      );
      const geometry = fromExtent(this.printRectangle);
      this.feature.setGeometry(geometry);
    }
  }

  private calculateCenter(): void {
    // when this.center is undefined, set center to center of the map.
    if (!this.center) {
      if (this.map) {
        const view = this.map.getView();
        if (view) {
          this.center = view.getCenter() as Coordinate;
        }
      }
    }
  }

  private updatePrintPreviewOnTranslateEvent(translateEvent: TranslateEvent) {
    if (translateEvent.features.getLength() === 1) {
      const feature = translateEvent.features.item(0);
      const polygonGeometry = feature.getGeometry()!;
      this.printRectangle = polygonGeometry.getExtent();
      this.center = getCenter(this.printRectangle);
    }
  }

  private createFeatureAndLayer(previewStyle?: StyleLike): void {
    this.feature = new Feature();

    this.translateLayer = new Vector({
      source: new VectorSource({
        features: [this.feature]
      }),
      style: previewStyle || this.defaultPreviewStyle()
    });
    this.addLayerToMap();
  }

  private addLayerToMap() {
    this.translateLayer.setMap(this.map);
  }

  private createTranslateInteractionForFeature(): void {
    const featureCollection = new Collection<Feature<Geometry>>();
    featureCollection.push(this.feature);

    this.translateInteraction = new Translate({ features: featureCollection });
    this.map.addInteraction(this.translateInteraction);

    // subscribe to translateEvents
    this.translateSubscription = this.translateInteraction.on(
      "translateend",
      this.updatePrintPreviewOnTranslateEvent.bind(this)
    );
  }

  private defaultPreviewStyle(): Style {
    return new Style({
      stroke: new Stroke({
        color: "rgba(252, 124, 0, 1)",
        width: 3
      }),
      fill: new Fill({
        color: "rgba(252, 124, 0, 0.1)"
      })
    });
  }
}
