import Feature from "ol/Feature";
import Geometry from "ol/geom/Geometry";

export class FeatureInfoCollection {
  constructor(
    public layerName: string,
    public features: Feature<Geometry>[] | object[]
  ) {}
}
