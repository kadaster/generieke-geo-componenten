import { Coordinate } from "ol/coordinate";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";

/**
 * @deprecated verhuisd naar ggc-models
 * Verzameling van features die behoren tot één specifieke kaartlaag.
 */
export class FeatureCollectionForLayer {
  /**
   * @deprecated
   * Naam van de laag waartoe de features behoren.
   */
  layerName?: string;
  /**
   * LayerId van de laag waartoe de features behoren.
   */
  layerId: string;
  /**
   * Title van de laag waartoe de features behoren, indien opgegeven.
   */
  layerTitle?: string;
  /**
   * Lijst van OpenLayers features met geometrie.
   */
  features: Feature<Geometry>[];
}

/**
 * @deprecated verhuisd naar ggc-models
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
