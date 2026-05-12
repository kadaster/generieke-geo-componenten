import { Coordinate } from "ol/coordinate";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";

/**
 * Verzameling van features die behoren tot één specifieke kaartlaag.
 */
export class FeatureCollectionForLayer {
  /**
   * Naam van de laag waartoe de features behoren.
   */
  layerName: string;
  /**
   * Lijst van OpenLayers features met geometrie.
   */
  features: Feature<Geometry>[];
}

/**
 * Verzameling van features gegroepeerd per laag voor een specifieke
 * kaartcoördinaat.
 *
 * Wordt bijvoorbeeld gebruikt bij feature-informatie of
 * selectieresultaten op een kaartlocatie.
 */
export class FeatureCollectionForCoordinate {
  /**
   * Coördinaat waarop de featurecollecties betrekking hebben.
   */
  coordinate?: Coordinate;
  /**
   * Verzameling van featurecollecties per kaartlaag.
   */
  featureCollectionForLayers: FeatureCollectionForLayer[];

  /**
   * @param coord Optionele kaartcoördinaat
   */
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
