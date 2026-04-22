import { Geometry } from "ol/geom";
import Feature from "ol/Feature";
import { FeatureCollectionForLayer } from "../service/select/selection-state.model";

/**
 * Controleert of een featurecollectie voor een laag één of meerdere
 * geclusterde features bevat (features in een feature).
 *
 * Een clusterfeature wordt herkend aan de aanwezigheid
 * van een `features` property met meer dan één onderliggend feature.
 *
 * @param featureinfo Featurecollectie voor een specifieke laag
 * @returns `true` indien er minimaal één clusterfeature aanwezig is,
 *          anders `false`
 */
export const featureCollectionForLayerHasCluster = (
  featureinfo: FeatureCollectionForLayer
): boolean => {
  return featureinfo.features.some(
    (feature) => feature.get("features") && feature.get("features").length > 1
  );
};

/**
 * Haalt de onderliggende features uit geclusterde features
 * en geeft deze terug als een vlakke lijst.
 *
 * Deze functie wordt gebruikt om clusterfeatures te
 * "declusteren" naar losse OpenLayers features.
 *
 * @param features Array van (cluster)features
 * @returns Array met individuele OpenLayers features
 */
export const declusterFeatures = (
  features: Feature<Geometry>[]
): Feature<Geometry>[] => {
  return features.reduce((previousValue, currentValue) => {
    const containedFeatures = (currentValue.get("features") as Feature[]) || [];
    return previousValue.concat(containedFeatures);
  }, [] as Feature[]);
};
