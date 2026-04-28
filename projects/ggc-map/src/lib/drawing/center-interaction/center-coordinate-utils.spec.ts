import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import Polygon from "ol/geom/Polygon";

import {
  isCoordinateInFeature,
  coordinateIsOnSegment,
  intersectsCoordinate,
  getClosestCoordinate,
  getCoordinatesOfFeature,
  getCoordinatesOfGeometry,
  getCoordinatesOfFeatureWithMiddlePoints,
  calculateDistanceOfPixels,
  calculateDistanceOfCoordinates,
  coordinatesAreEqual,
  getClosestVertex,
  getClosestSegmentCoordinate
} from "./center-coordinate-utils";

describe("center-coordinate-utils", () => {
  describe("coordinatesAreEqual", () => {
    it("returns true within margin", () => {
      expect(coordinatesAreEqual([1, 1], [1 + 1e-10, 1])).toBeTrue();
    });

    it("returns false outside margin", () => {
      expect(coordinatesAreEqual([1, 1], [1.1, 1])).toBeFalse();
    });
  });

  describe("getCoordinatesOfGeometry", () => {
    it("handles point geometry", () => {
      const geom = new Point([5, 10]);
      expect(getCoordinatesOfGeometry(geom)).toEqual([[5, 10]]);
    });

    it("handles linestring", () => {
      const geom = new LineString([
        [0, 0],
        [1, 1]
      ]);
      expect(getCoordinatesOfGeometry(geom)).toEqual([
        [0, 0],
        [1, 1]
      ]);
    });

    it("handles polygon with flattening", () => {
      const geom = new Polygon([
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 0]
        ]
      ]);
      expect(getCoordinatesOfGeometry(geom)).toEqual([
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 0]
      ]);
    });
  });

  describe("getCoordinatesOfFeature", () => {
    it("returns coordinates for point feature", () => {
      const feature = new Feature(new Point([1, 1]));
      expect(getCoordinatesOfFeature(feature)).toEqual([[1, 1]]);
    });
  });

  describe("getClosestCoordinate", () => {
    it("returns point coordinate", () => {
      const f = new Feature(new Point([5, 5]));
      expect(getClosestCoordinate(f, [100, 100])).toEqual([5, 5]);
    });

    it("returns closest on line", () => {
      const f = new Feature(
        new LineString([
          [0, 0],
          [10, 0]
        ])
      );
      expect(getClosestCoordinate(f, [3, 5])).toEqual([3, 0]);
    });
  });

  describe("isCoordinateInFeature", () => {
    it("detects vertex", () => {
      const feature = new Feature(
        new LineString([
          [0, 0],
          [5, 5]
        ])
      );
      expect(isCoordinateInFeature(feature, [0, 0])).toBe("vertex");
    });

    it("detects coordinate on line segment", () => {
      const feature = new Feature(
        new LineString([
          [0, 0],
          [10, 0]
        ])
      );
      expect(isCoordinateInFeature(feature, [5, 0])).toBe("segment");
    });

    it("returns undefined for point not on line", () => {
      const feature = new Feature(
        new LineString([
          [0, 0],
          [5, 5]
        ])
      );
      expect(isCoordinateInFeature(feature, [10, 10])).toBeUndefined();
    });
  });

  describe("coordinateIsOnSegment", () => {
    it("is true for on-segment non-vertex", () => {
      expect(coordinateIsOnSegment([0, 0], [10, 0], [5, 0])).toBeTrue();
    });

    it("is false for vertex", () => {
      expect(coordinateIsOnSegment([0, 0], [10, 0], [0, 0])).toBeFalse();
    });
  });

  describe("intersectsCoordinate", () => {
    it("detects point inside polygon", () => {
      const poly = new Feature(
        new Polygon([
          [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
            [0, 0]
          ]
        ])
      );
      expect(intersectsCoordinate(poly, [5, 5])).toBeTrue();
    });

    it("false for point outside polygon", () => {
      const poly = new Feature(
        new Polygon([
          [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
            [0, 0]
          ]
        ])
      );
      expect(intersectsCoordinate(poly, [20, 20])).toBeFalse();
    });

    it("lineString always false", () => {
      const line = new Feature(
        new LineString([
          [0, 0],
          [10, 0]
        ])
      );
      expect(intersectsCoordinate(line, [5, 0])).toBeFalse();
    });
  });

  describe("getCoordinatesOfFeatureWithMiddlePoints", () => {
    it("inserts midpoint between each pair", () => {
      const f = new Feature(
        new LineString([
          [0, 0],
          [10, 0]
        ])
      );
      const result = getCoordinatesOfFeatureWithMiddlePoints(f);

      expect(result.length).toBe(3);
      expect(result[0]).toEqual([0, 0]);
      expect(result[1]).toEqual([5, 0]);
      expect(result[2]).toEqual([10, 0]);
    });

    it("inserts midpoints for a Polygon", () => {
      const polygon = new Feature(
        new Polygon([
          [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 0]
          ]
        ])
      );

      const result = getCoordinatesOfFeatureWithMiddlePoints(polygon);

      expect(result.length).toBe(6);
      expect(result[0]).toEqual([0, 0]);
      expect(result[1]).toEqual([5, 0]);
      expect(result[2]).toEqual([10, 0]);
      expect(result[3]).toEqual([10, 5]);
      expect(result[4]).toEqual([10, 10]);
      expect(result[5]).toEqual([5, 5]);
    });
  });

  describe("distance utilities", () => {
    it("pixel distance", () => {
      expect(calculateDistanceOfPixels([0, 0], [3, 4])).toBe(5);
    });

    it("coordinate distance", () => {
      expect(calculateDistanceOfCoordinates([0, 0], [3, 4])).toBe(5);
    });
  });

  describe("getClosestVertex", () => {
    it("returns nearest vertex", () => {
      const f1 = new Feature(
        new LineString([
          [0, 0],
          [10, 0]
        ])
      );
      const f2 = new Feature(
        new LineString([
          [100, 100],
          [110, 110]
        ])
      );

      const result = getClosestVertex([f1, f2], [3, 0]);

      expect(result?.coordinate).toEqual([0, 0]);
    });
  });

  describe("getClosestSegmentCoordinate", () => {
    it("returns nearest point on nearest segment", () => {
      const f1 = new Feature(
        new LineString([
          [0, 0],
          [10, 0]
        ])
      );
      const f2 = new Feature(
        new LineString([
          [100, 0],
          [110, 0]
        ])
      );

      const result = getClosestSegmentCoordinate([f1, f2], [4, 5]);
      expect(result?.coordinate).toEqual([4, 0]);
    });
  });
});
