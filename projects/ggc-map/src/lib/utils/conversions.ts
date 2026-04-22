import { Feature, FeatureCollection } from "geojson";
import OlFeature from "ol/Feature";
import { GeoJSON } from "ol/format";
import Geometry, { Type } from "ol/geom/Geometry";
import { MapComponentDrawTypes } from "../model/draw-interaction-event.model";
import { epsg28992 } from "./epsg28992";

/**
 * Converteert een OpenLayers feature naar een GeoJSON feature.
 *
 * De geometrie wordt getransformeerd van de kaartprojectie
 * (EPSG:28992) naar de opgegeven data-projectie.
 *
 * @param feature OpenLayers feature met geometrie
 * @param dataProjection Doelprojectie voor de GeoJSON output
 * (default "EPSG:4326")
 * @returns GeoJSON {@link Feature}
 */
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

/**
 * Converteert een GeoJSON feature naar één of meerdere
 * OpenLayers features.
 *
 * De geometrie wordt getransformeerd van de data-projectie
 * naar de kaartprojectie (EPSG:28992).
 *
 * @param feature GeoJSON feature
 * @param dataProjection Projectie van de GeoJSON input
 *                       (default "EPSG:4326")
 * @returns Eén of meerdere OpenLayers features
 */
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

/**
 * Converteert een GeoJSON FeatureCollection naar
 * OpenLayers features.
 *
 * De geometrieën worden getransformeerd van de data-projectie
 * naar de kaartprojectie (EPSG:28992).
 *
 * @param features GeoJSON FeatureCollection
 * @param dataProjection Projectie van de GeoJSON input
 *                       (default "EPSG:4326")
 * @returns Array van OpenLayers features
 */
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

/**
 * Zet een draw-interactietype om naar een OpenLayers
 * geometrie-type.
 *
 * Wordt gebruikt bij het configureren van draw-interacties
 * en geometrie-afhankelijke logica.
 *
 * @param drawType Type van de draw-interactie
 * @returns OpenLayers geometrie-type
 */
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
