import { Interaction } from "ol/interaction";
import { Point } from "ol/geom";
import Feature from "ol/Feature";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OlMap from "ol/Map";
import { EventsKey, listen, unlistenByKey } from "ol/events";
import { StyleLike } from "ol/style/Style";
import { Coordinate } from "ol/coordinate";
import { calculateDistanceOfPixels } from "./center-coordinate-utils";
import { unByKey } from "ol/Observable";
import { crossHairImageStyle } from "../measure-styles";

export interface CenterBaseOptions {
  crossHairStyle?: StyleLike;
}

export interface FeatureCoordinateResult {
  feature: Feature;
  coordinate: Coordinate;
}

export class CenterBase extends Interaction {
  protected centerPoint: Point;
  private changeCenterListener: EventsKey;
  // Tijdelijke kaartlaag voor de crosshair
  private readonly crossHairOverlay: VectorLayer;

  constructor(options: CenterBaseOptions) {
    super();
    const style = options.crossHairStyle ?? crossHairImageStyle;
    this.crossHairOverlay = this.createVectorLayerWithStyle(style, Infinity);
  }

  protected createVectorLayerWithStyle(
    style?: StyleLike,
    zIndex?: number
  ): VectorLayer {
    return new VectorLayer({
      source: new VectorSource({
        useSpatialIndex: false
      }),
      style: style,
      updateWhileInteracting: true,
      updateWhileAnimating: true,
      zIndex: zIndex
    });
  }

  setMap(map: OlMap | null): void {
    super.setMap(map);
    if (map) {
      this.registerListeners(map);
      this.crossHairOverlay.setMap(map);
      const center = map.getView().getCenter();
      if (center) {
        const crossHairSource = this.crossHairOverlay.getSource()!;
        this.centerPoint = new Point(center);
        crossHairSource.addFeature(new Feature(this.centerPoint));
      }
    } else {
      this.crossHairOverlay.setMap(map);
      unlistenByKey(this.changeCenterListener);
    }
  }

  cleanup() {
    unByKey(this.changeCenterListener);
    if (this.getMap() && this.crossHairOverlay) {
      this.crossHairOverlay.setMap(null);
      this.getMap()!.removeLayer(this.crossHairOverlay);
    }
  }

  protected updateCenterPoint() {
    const map = this.getMap();
    if (!map) {
      return;
    }
    const center = map.getView().getCenter();
    if (center) {
      this.centerPoint.setCoordinates(center);
    }
  }

  protected placeCrossHairOverlayOnTop() {
    const map = this.getMap();
    if (!map || !this.crossHairOverlay) {
      return;
    }
    this.crossHairOverlay.setMap(null);
    this.crossHairOverlay.setMap(map);
  }

  private registerListeners(map: OlMap) {
    this.changeCenterListener = listen(
      map.getView(),
      "change:center",
      this.updateCenterPoint,
      this
    );
  }

  protected calculatePixelDistanceOfCoordinates(
    c1: Coordinate,
    c2: Coordinate
  ): number {
    const map = this.getMap();
    if (!map) {
      return Infinity;
    }
    const p1 = map.getPixelFromCoordinate(c1);
    const p2 = map.getPixelFromCoordinate(c2);
    return calculateDistanceOfPixels(p1, p2);
  }
}
