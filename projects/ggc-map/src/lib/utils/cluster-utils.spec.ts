import {
  declusterFeatures,
  featureCollectionForLayerHasCluster
} from "./cluster-utils";
import { Geometry } from "ol/geom";
import Feature from "ol/Feature";

describe("ClusterUtils", () => {
  it("should return false if featureinfoCollection.features contains an empty array", () => {
    const featureinfoCollection = createFeatureInfoCollection([]);

    const result = featureCollectionForLayerHasCluster(featureinfoCollection);

    expect(result).toBeFalse();
  });

  it("should return false if featureinfoCollection.features only contains features without property 'features'", () => {
    const featureinfoCollection = createFeatureInfoCollection([
      new Feature<Geometry>(),
      new Feature<Geometry>()
    ]);

    const result = featureCollectionForLayerHasCluster(featureinfoCollection);

    expect(result).toBeFalse();
  });

  it("should return false if featureinfoCollection.features contains a feature with property 'features' containing 1 feature", () => {
    const feature = new Feature<Geometry>({ features: [new Feature()] });
    const featureinfoCollection = createFeatureInfoCollection([
      feature,
      new Feature<Geometry>()
    ]);

    const result = featureCollectionForLayerHasCluster(featureinfoCollection);

    expect(result).toBeFalse();
  });

  it("should return true if featureinfoCollection.features contains a feature with property 'features' containing 2 features", () => {
    const clusterFeature = new Feature<Geometry>({
      features: [new Feature<Geometry>(), new Feature<Geometry>()]
    });
    const featureinfoCollection = createFeatureInfoCollection([
      clusterFeature,
      new Feature<Geometry>()
    ]);

    const result = featureCollectionForLayerHasCluster(featureinfoCollection);

    expect(result).toBeTrue();
  });

  it("should return array of features when called with features", () => {
    const feature12 = new Feature<Geometry>({ id: 12 });
    const feature13 = new Feature<Geometry>({ id: 13 });
    const feature14 = new Feature<Geometry>({ id: 14 });
    const clusterFeature = new Feature<Geometry>({
      features: [feature12, feature13]
    });
    const clusterFeatureTwo = new Feature<Geometry>({
      features: [feature14]
    });

    const declusteredFeatures = declusterFeatures([
      clusterFeature,
      clusterFeatureTwo
    ]);

    expect(declusteredFeatures.length).toBe(3);
    expect(declusteredFeatures).toContain(feature12);
    expect(declusteredFeatures).toContain(feature13);
    expect(declusteredFeatures).toContain(feature14);
  });
});

function createFeatureInfoCollection(features: Feature<Geometry>[]) {
  return {
    layerName: "test-layer",
    features
  };
}
