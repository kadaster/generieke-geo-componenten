import { Geometry } from "ol/geom";
import Feature from "ol/Feature";
import { FeatureCollectionForLayer } from "../service/select/selection-state.model";

export const featureCollectionForLayerHasCluster = (
  featureinfo: FeatureCollectionForLayer
): boolean => {
  return featureinfo.features.some(
    (feature) => feature.get("features") && feature.get("features").length > 1
  );
};

export const declusterFeatures = (
  features: Feature<Geometry>[]
): Feature<Geometry>[] => {
  return features.reduce((previousValue, currentValue) => {
    const containedFeatures = (currentValue.get("features") as Feature[]) || [];
    return previousValue.concat(containedFeatures);
  }, [] as Feature[]);
};
