import { Feature, FeatureCollection } from "geojson";
import OlFeature from "ol/Feature";
import { GeoJSON } from "ol/format";
import Geometry, { Type } from "ol/geom/Geometry";
import { MapComponentDrawTypes } from "../model/draw-interaction-event.model";
import { epsg28992 } from "./epsg28992";

export const toGeoJSONFeature = (
  feature: OlFeature<Geometry>,
  dataProjection = "EPSG:4326"
): Feature => {
  const geoJsonFormat = new GeoJSON();
  return geoJsonFormat.writeFeatureObject(feature, {
    dataProjection,
    featureProjection: epsg28992
  });
};

export const fromGeoJSONFeature = (
  feature: Feature,
  dataProjection = "EPSG:4326"
): OlFeature<Geometry> | OlFeature<Geometry>[] => {
  const geoJsonFormat = new GeoJSON();
  return geoJsonFormat.readFeature(feature, {
    dataProjection,
    featureProjection: epsg28992
  });
};

export const fromGeoJSONFeatures = (
  features: FeatureCollection,
  dataProjection = "EPSG:4326"
): OlFeature<any>[] => {
  const geoJsonFormat = new GeoJSON();
  return geoJsonFormat.readFeatures(features, {
    dataProjection,
    featureProjection: epsg28992
  });
};

export const drawTypeToGeometryType = (
  drawType: MapComponentDrawTypes
): Type => {
  switch (drawType) {
    case MapComponentDrawTypes.RECTANGLE:
    case MapComponentDrawTypes.POLYGON:
      return "Polygon";
    case MapComponentDrawTypes.CIRCLE:
      return "Circle";
    case MapComponentDrawTypes.LINESTRING:
      return "LineString";
    case MapComponentDrawTypes.POINT:
      return "Point";
  }
};

/**
 * @deprecated
 **/
export const measureTypeToGeometryType = (
  drawType: MapComponentDrawTypes
): Type => {
  return drawTypeToGeometryType(drawType);
};
