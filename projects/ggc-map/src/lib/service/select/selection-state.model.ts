import { Coordinate } from "ol/coordinate";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";

export class FeatureCollectionForLayer {
  layerName: string;
  features: Feature<Geometry>[];
}

export class FeatureCollectionForCoordinate {
  coordinate?: Coordinate;
  featureCollectionForLayers: FeatureCollectionForLayer[];

  constructor(coord?: Coordinate) {
    this.coordinate = coord;
    this.featureCollectionForLayers = [];
  }
}

// CurrentAndPreviousSelection niet exporteren in public api, want dit is een intern model.
// Wordt niet doorgegeven aan de afnemers van het component.
export class CurrentAndPreviousSelection {
  current: FeatureCollectionForCoordinate | undefined;
  previous: FeatureCollectionForCoordinate | undefined;
}
