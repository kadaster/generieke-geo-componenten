import { Coordinate } from "ol/coordinate";
import Feature from "ol/Feature";
import { Geometry, LineString, Point } from "ol/geom";
import Polygon from "ol/geom/Polygon";
import { Pixel } from "ol/pixel";
import { FeatureCoordinateResult } from "./center-base";

/**
 * Returns whether the provided coordinate is on the outline of the given feature and if it is a vertex or a line.
 * If the coordinate is not on the feature, undefined is returned.
 * @param feature
 * @param coordinate
 */
export function isCoordinateInFeature(
  feature: Feature,
  coordinate: Coordinate
): "vertex" | "segment" | undefined {
  const closestCoordinate = getClosestCoordinate(feature, coordinate);

  if (!closestCoordinate) {
    return undefined;
  }

  const coordinateOnFeature = coordinatesAreEqual(
    closestCoordinate,
    coordinate
  );

  if (!coordinateOnFeature) {
    return undefined;
  }

  const featureVertices = getCoordinatesOfFeature(feature);
  const isVertex = featureVertices.some((vertex) => {
    return coordinatesAreEqual(vertex, coordinate);
  });
  return isVertex ? "vertex" : "segment";
}

/**
 * Returns whether the provided coordinate is on the segment/line between the 2 provided segment coordinates.
 * The segmentCoordinates are excluded.
 * @param segmentCoordinate1
 * @param segmentCoordinate2
 * @param coordinate
 */
export function coordinateIsOnSegment(
  segmentCoordinate1: Coordinate,
  segmentCoordinate2: Coordinate,
  coordinate: Coordinate
) {
  const lineString: LineString = new LineString([
    segmentCoordinate1,
    segmentCoordinate2
  ]);
  return (
    isCoordinateInFeature(new Feature(lineString), coordinate) == "segment"
  );
}

/**
 * Returns whether the given coordinate intersects the feature.
 * Point and linestring will always return false
 */
export function intersectsCoordinate(feature: Feature, coordinate: Coordinate) {
  const geom = feature.getGeometry();
  if (!geom) return;
  if (geom.getType() === "Polygon" || geom.getType() === "MultiPolygon") {
    return geom.intersectsCoordinate(coordinate);
  }
  return false;
}

/**
 * get the closest coordinate of the feature to the provided coordinate
 * @param feature
 * @param coordinate
 */
export function getClosestCoordinate(
  feature: Feature,
  coordinate: Coordinate
): Coordinate | undefined {
  const geometry = feature.getGeometry();
  if (geometry instanceof Point) {
    return geometry.getCoordinates();
  } else if (geometry instanceof LineString) {
    return geometry.getClosestPoint(coordinate);
  } else if (geometry instanceof Polygon) {
    return geometry.getClosestPoint(coordinate);
  }
  return undefined;
}

/**
 * Returns the coordinates of a feature as a list of coordinates
 * @param feature The feature to get the coordinates from
 */
export function getCoordinatesOfFeature(feature: Feature): Coordinate[] {
  const geometry = feature.getGeometry();
  if (!geometry) {
    return [];
  }
  return getCoordinatesOfGeometry(geometry);
}

export function getCoordinatesOfGeometry(geometry: Geometry) {
  if (geometry instanceof Point) {
    return [geometry.getCoordinates()];
  } else if (geometry instanceof LineString) {
    return geometry.getCoordinates();
  } else if (geometry instanceof Polygon) {
    return geometry.getCoordinates().flat();
  }
  return [];
}

export function getCoordinatesOfFeatureWithMiddlePoints(feat: Feature) {
  const coords: Coordinate[] = getCoordinatesOfFeature(feat);
  const result = [];
  for (let i = 0; i < coords.length - 1; i++) {
    //voeg punt  en tussenpunt toe
    result.push(
      coords[i],
      new LineString([coords[i], coords[i + 1]]).getCoordinateAt(0.5)
    );
  }
  //voeg laatste punt toe, niet voor polygoon (dit is namelijk hetzelfde als het eerste punt)
  if (feat.getGeometry() && feat.getGeometry()!.getType() !== "Polygon") {
    result.push(coords.at(-1));
  }
  return result;
}

/**
 * Calculate the distance between 2 pixels
 * @param p1 pixel 1
 * @param p2 pixel 2
 */
export function calculateDistanceOfPixels(p1: Pixel, p2: Pixel) {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return Math.hypot(dx, dy);
}

export function calculateDistanceOfCoordinates(c1: Coordinate, c2: Coordinate) {
  const dx = c1[0] - c2[0];
  const dy = c1[1] - c2[1];
  return Math.hypot(dx, dy);
}

/**
 * Coordintes are often not exactly the same, therefore we introduce this function which checks if they are close enough
 * @param coord1 Coordinaat 1
 * @param coord2 Coordinaat 2
 * @param margin The margin when 2 coordinates are seen as equal
 */
export function coordinatesAreEqual(
  coord1: Coordinate,
  coord2: Coordinate,
  margin = 1e-9
): boolean {
  return (
    Math.abs(coord1[0] - coord2[0]) < margin &&
    Math.abs(coord1[1] - coord2[1]) < margin
  );
}

export function getClosestVertex(features: Feature[], coordinate: Coordinate) {
  let closestFeatureVertex: FeatureCoordinateResult | undefined;
  let minDistance = Infinity;

  features.forEach((feature) => {
    const featureVertices = getCoordinatesOfFeature(feature);
    for (const vertex of featureVertices) {
      const distance = calculateDistanceOfCoordinates(coordinate, vertex);
      if (distance < minDistance) {
        minDistance = distance;
        closestFeatureVertex = {
          feature: feature,
          coordinate: vertex
        } as FeatureCoordinateResult;
      }
    }
  });
  return closestFeatureVertex;
}

export function getClosestSegmentCoordinate(
  features: Feature[],
  coordinate: Coordinate
) {
  let closestFeatureCoordinate: FeatureCoordinateResult | undefined;
  let minDistance = Infinity;

  features.forEach((feature) => {
    const featureCoordinate = getClosestCoordinate(feature, coordinate);
    if (featureCoordinate) {
      const distance = calculateDistanceOfCoordinates(
        coordinate,
        featureCoordinate
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestFeatureCoordinate = {
          feature: feature,
          coordinate: featureCoordinate
        } as FeatureCoordinateResult;
      }
    }
  });
  return closestFeatureCoordinate;
}
