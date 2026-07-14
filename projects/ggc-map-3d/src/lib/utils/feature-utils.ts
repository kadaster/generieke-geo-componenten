import { Cesium3DTileFeature, Entity } from "@cesium/engine";

export function cesium3DTileFeatureToGenericFeatures(
  feature: Cesium3DTileFeature | undefined
) {
  const properties: object[] = [];
  if (feature !== undefined) {
    const obj: { [x: string]: string } = {};
    feature.getPropertyIds().forEach((id: string) => {
      obj[id] = feature.getProperty(id);
    });
    properties.push(obj);
  }
  return properties;
}

export function cesiumGeoJsonFeatureToGenericFeatures(
  entity: Entity | undefined
) {
  const properties: object[] = [];
  if (entity?.properties !== undefined) {
    const obj: { [x: string]: string } = {};
    entity?.properties.propertyNames.forEach((id: string) => {
      obj[id] =
        entity.properties === undefined ? "" : entity.properties[id]._value;
    });
    properties.push(obj);
  }
  return properties;
}
