import { LineString, Point, Polygon } from "ol/geom";
import Feature from "ol/Feature";
import { DrawEvent, DrawOnSignature } from "ol/interaction/Draw";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OlMap from "ol/Map";
import { EventsKey } from "ol/events";
import { StyleLike } from "ol/style/Style";
import { Coordinate } from "ol/coordinate";
import {
  CenterBase,
  CenterBaseOptions,
  FeatureCoordinateResult
} from "./center-base";
import {
  coordinateIsOnSegment,
  coordinatesAreEqual,
  getClosestSegmentCoordinate,
  getClosestVertex,
  getCoordinatesOfFeature,
  getCoordinatesOfFeatureWithMiddlePoints,
  intersectsCoordinate,
  isCoordinateInFeature
} from "./center-coordinate-utils";
import {
  defaultHighlightStyle,
  defaultSelectedPointStyle
} from "./default-modify-style";

export interface CenterModifyOptions extends CenterBaseOptions {
  targetSource: VectorSource;
  modifyStyle?: StyleLike;
  selectedPointStyle?: StyleLike;
  pixelTolerance?: number;
  customKeyNextPoint?: string;
  customKeyPrevPoint?: string;
}

export class CenterModify extends CenterBase {
  // type voor on overgenomen uit ol>interaction>Draw.d.ts
  on: DrawOnSignature<EventsKey>;

  private sketchFeature: Feature | undefined;
  private readonly modifyOverlay: VectorLayer;
  private readonly selectedPointOverlay: VectorLayer | undefined;
  private readonly targetSource: VectorSource;
  private modifiedIndex: number | undefined;
  private readonly pixelTolerance: number = 6;
  private highlightedFeature: Feature | undefined;
  private selectedFeatureCurrentCoordinateIndex: number | undefined;
  private keyNextPoint = "BracketRight"; // ]
  private keyPrevPoint = "BracketLeft"; // [

  constructor(options: CenterModifyOptions) {
    super(options);
    this.modifyOverlay = this.createVectorLayerWithStyle(
      options.modifyStyle ?? defaultHighlightStyle,
      Infinity
    );
    this.selectedPointOverlay = this.createVectorLayerWithStyle(
      options.selectedPointStyle ?? defaultSelectedPointStyle,
      Infinity
    );
    this.targetSource = options.targetSource;
    if (options.pixelTolerance) {
      this.pixelTolerance = options.pixelTolerance;
    }
    this.setOptionalCustomKeys(options);
    globalThis.addEventListener("keypress", this.handleKeyPress);
  }

  setMap(map: OlMap | null): void {
    super.setMap(map);
    this.modifyOverlay.setMap(map);
    this.selectedPointOverlay!.setMap(map);
    this.placeCrossHairOverlayOnTop();
    this.updateCenterPoint();
  }

  /**
   * Start het bewerken van een feature met center interaction
   */
  startModifyCurrentPoint(): void {
    const featureCoordinate = this.getClosestFeatureCoordinate(
      this.targetSource.getFeatures(),
      this.centerPoint.getCoordinates(),
      this.pixelTolerance
    );

    if (!featureCoordinate) {
      return;
    }
    const feature = featureCoordinate.feature;
    const coordinate = featureCoordinate.coordinate;
    this.targetSource.removeFeature(feature);
    this.modifyOverlay.getSource()!.addFeature(feature);
    this.sketchFeature = feature;
    if (coordinate) {
      this.modifiedIndex = this.coordinateOfFeatureToIndex(feature, coordinate);
    }
    this.updateCenterPoint();
  }

  finishModify(): void {
    const sketchFeature = this.abortModifying();
    if (!sketchFeature) {
      return;
    }
    this.dispatchEvent(new DrawEvent("modifyend", sketchFeature));
    this.targetSource?.addFeature(sketchFeature);
    this.updateCenterPoint();
  }

  cleanup() {
    super.cleanup();
    this.finishModify();
    const map = this.getMap();
    if (map) {
      map.removeLayer(this.selectedPointOverlay!);
      map.removeLayer(this.modifyOverlay);
    }
    globalThis.removeEventListener("keypress", this.handleKeyPress);
  }

  protected updateCenterPoint() {
    super.updateCenterPoint();
    if (this.sketchFeature) {
      switch (this.sketchFeature?.getGeometry()!.getType()) {
        case "Point":
          this.updatePoint();
          break;
        case "LineString":
          this.updateLineString(
            this.sketchFeature?.getGeometry() as LineString
          );
          break;
        case "Polygon":
          this.updatePolygon(this.sketchFeature?.getGeometry() as Polygon);
          break;
      }
    }
    this.updateHighlightSelection();
    this.placeSelectedPoint();
  }

  private getClosestFeatureCoordinate(
    features: Feature[],
    coordinate: Coordinate,
    pixelTolerance = 6
  ): FeatureCoordinateResult | undefined {
    const closestVertex = getClosestVertex(features, coordinate);
    if (
      closestVertex &&
      this.calculatePixelDistanceOfCoordinates(
        closestVertex.coordinate,
        coordinate
      ) < pixelTolerance
    ) {
      return closestVertex;
    }

    const closestSegmentCoordinate = getClosestSegmentCoordinate(
      features,
      coordinate
    );
    if (
      closestSegmentCoordinate &&
      this.calculatePixelDistanceOfCoordinates(
        closestSegmentCoordinate.coordinate,
        coordinate
      ) < pixelTolerance
    ) {
      return closestSegmentCoordinate;
    }

    return undefined;
  }

  private getFeatureAtCoordinateWithTolerance(
    features: Feature[]
  ): Feature | undefined {
    const map = this.getMap();
    if (!map) {
      console.warn("geen map gevonden voor feature");
      return undefined;
    }
    const centerCoordinates = this.centerPoint.getCoordinates();

    // Get first the closest feature and if none in the pixel tolerance, check if a feature intersects the coordinate
    // With this order, a line under a polygon can still be selected
    const closestFeature = this.getClosestFeatureCoordinate(
      features,
      centerCoordinates,
      this.pixelTolerance
    )?.feature;

    if (closestFeature) {
      return closestFeature;
    }

    for (const feature of features) {
      if (intersectsCoordinate(feature, centerCoordinates)) {
        return feature;
      }
    }

    return undefined;
  }

  private updateHighlightSelection() {
    const newHighlightedFeature = this.getNewHightlightedFeature();

    if (this.highlightedFeature != newHighlightedFeature) {
      // reset the current coordinate index for tabbing between the feature points
      this.selectedFeatureCurrentCoordinateIndex = undefined;
    }
    this.highlightedFeature = newHighlightedFeature;

    const source = this.modifyOverlay.getSource();
    if (!source) {
      return;
    }
    source.clear();
    if (this.highlightedFeature) {
      source.addFeature(new Feature(this.highlightedFeature.getGeometry()));
    }
  }

  private getNewHightlightedFeature() {
    // If modify is active, return modified feature
    if (this.sketchFeature) {
      return this.sketchFeature;
    }

    // If current selected feature is still within pixelTolerance, prioritize currently selected feature
    if (
      this.highlightedFeature &&
      this.getClosestFeatureCoordinate(
        [this.highlightedFeature],
        this.centerPoint.getCoordinates(),
        this.pixelTolerance
      )
    ) {
      return this.highlightedFeature;
    }

    // Else return closest feature for highlighting
    return this.getFeatureAtCoordinateWithTolerance([
      ...this.targetSource.getFeatures(),
      ...(this.modifyOverlay.getSource()?.getFeatures() ?? [])
    ]);
  }

  private updatePoint() {
    this.sketchFeature?.setGeometry(this.centerPoint);
  }

  private updateLineString(geometry: LineString) {
    const coords = geometry.getCoordinates();
    const center = this.getMap()?.getView().getCenter();
    if (this.modifiedIndex !== undefined) {
      coords.splice(this.modifiedIndex, 1, center!);
    }
    geometry.setCoordinates(coords);
  }

  private updatePolygon(geometry: Polygon) {
    const coords = geometry.getCoordinates()[0];
    const center = this.getMap()?.getView().getCenter();
    if (this.modifiedIndex !== undefined) {
      coords.splice(this.modifiedIndex, 1, center!);
      if (this.modifiedIndex == 0) {
        // First and last coordinate of a polygon should be the same
        coords.splice(-1, 1, center!);
      }
    }
    geometry.setCoordinates([coords]);
  }

  /**
   * Return the coordiante-index of the provided coordinate in the feature, returns undefined if the coordinate is not on the feature.
   * If the coordinate is on a segment instead of an existing vertex, a new vertex is inserted and that newly created index is returned.
   * If the feature is a point, undefined is returned, as a point does not have indices.
   * @param feature
   * @param coordinate
   * @private
   */
  private coordinateOfFeatureToIndex(
    feature: Feature,
    coordinate: Coordinate
  ): number | undefined {
    const geometry = feature.getGeometry();
    if (!geometry || geometry.getType() == "Point") {
      return undefined;
    }

    const coordinateInFeature = isCoordinateInFeature(feature, coordinate);
    switch (coordinateInFeature) {
      case "vertex": {
        const coordinates = getCoordinatesOfFeature(feature);
        const result = coordinates.findIndex((c) => {
          return coordinatesAreEqual(coordinate, c);
        });
        return result == -1 ? undefined : result;
      }
      case "segment": {
        return this.insertCoordinateInFeature(feature, coordinate);
      }
      default:
        return undefined;
    }
  }

  /**
   * Insert the provided coordinate as a new vertex inside an existing segment in the feature.
   * Return the index where it is inserted in the feature.
   * If no valid coordinate is provided or the feature is a point, undefined is returned.
   * @param feature
   * @param coordinate
   * @private
   */
  private insertCoordinateInFeature(
    feature: Feature,
    coordinate: Coordinate
  ): number | undefined {
    const geometry = feature.getGeometry();
    if (!geometry || geometry.getType() == "Point") {
      return undefined;
    }

    const featureCoordinates = getCoordinatesOfFeature(feature);
    for (let i = 0; i < featureCoordinates.length - 1; i++) {
      if (
        coordinateIsOnSegment(
          featureCoordinates[i],
          featureCoordinates[i + 1],
          coordinate
        )
      ) {
        featureCoordinates.splice(i + 1, 0, coordinate);
        if (geometry.getType() == "LineString") {
          (geometry as LineString).setCoordinates(featureCoordinates);
        } else if (geometry.getType() == "Polygon") {
          (geometry as Polygon).setCoordinates([featureCoordinates]);
        }
        return i + 1;
      }
    }
    return undefined;
  }

  private abortModifying() {
    const sketchFeature = this.sketchFeature;
    this.sketchFeature = undefined;
    this.modifyOverlay.getSource()!.clear(true);
    return sketchFeature;
  }

  private placeSelectedPoint() {
    const source = this.selectedPointOverlay!.getSource();
    if (!source) {
      return;
    }
    source.clear();

    if (!this.highlightedFeature) {
      return;
    }

    const coordinate = this.getClosestFeatureCoordinate(
      [this.highlightedFeature],
      this.centerPoint.getCoordinates(),
      this.pixelTolerance
    )?.coordinate;

    if (coordinate) {
      const pointFeature = new Feature(new Point(coordinate));
      source.addFeature(pointFeature);
    }
  }

  private readonly handleKeyPress = (evt: KeyboardEvent) => {
    if (!this.highlightedFeature) {
      return;
    }
    switch (evt.code) {
      case this.keyNextPoint:
        this.updateNextTabCoordinate();
        break;
      case this.keyPrevPoint:
        this.updatePreviousTabCoordinate();
        break;
    }
    this.getMap()!.getView().setCenter(this.getCurrentTabCoordinate());
  };

  private updateNextTabCoordinate() {
    const coordinatesLength = getCoordinatesOfFeatureWithMiddlePoints(
      this.highlightedFeature!
    ).length;
    const newIndex =
      this.selectedFeatureCurrentCoordinateIndex == undefined
        ? 0
        : this.selectedFeatureCurrentCoordinateIndex + 1;
    this.selectedFeatureCurrentCoordinateIndex =
      newIndex >= coordinatesLength ? 0 : newIndex;
  }

  private updatePreviousTabCoordinate() {
    const coordinatesLength = getCoordinatesOfFeatureWithMiddlePoints(
      this.highlightedFeature!
    ).length;
    const newIndex =
      this.selectedFeatureCurrentCoordinateIndex == undefined
        ? coordinatesLength - 1
        : this.selectedFeatureCurrentCoordinateIndex - 1;
    this.selectedFeatureCurrentCoordinateIndex =
      newIndex <= -1 ? coordinatesLength - 1 : newIndex;
  }

  private getCurrentTabCoordinate() {
    if (
      !this.highlightedFeature ||
      this.selectedFeatureCurrentCoordinateIndex == undefined
    ) {
      return;
    }
    const coordinates = getCoordinatesOfFeatureWithMiddlePoints(
      this.highlightedFeature
    );
    return coordinates.at(this.selectedFeatureCurrentCoordinateIndex);
  }

  private setOptionalCustomKeys(options: CenterModifyOptions) {
    if (options.customKeyNextPoint) {
      this.keyNextPoint = options.customKeyNextPoint;
    }
    if (options.customKeyPrevPoint) {
      this.keyPrevPoint = options.customKeyPrevPoint;
    }
  }
}
