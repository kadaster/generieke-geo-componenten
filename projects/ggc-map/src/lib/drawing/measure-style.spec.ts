import { Feature } from "ol";
import LineString from "ol/geom/LineString";
import Point from "ol/geom/Point";
import Polygon from "ol/geom/Polygon";
import { Fill, Style, Text } from "ol/style";
import {
  calculateArea,
  calculateAreaOrLength,
  calculateLength,
  styleLabelFunction,
  styleSegmentLabelFunction
} from "./measure-styles";

describe("measureStyles", () => {
  const featureLineString = new Feature(
    new LineString([
      [0, 0],
      [100, 100],
      [200, 200]
    ])
  );

  const testStyle = new Style({
    text: new Text({ fill: new Fill({ color: "#abcdef" }) })
  });

  const featurePolygon = new Feature(
    new Polygon([
      [
        [190095.36, 483335.99],
        [-42147.84, 446349.11],
        [184504.32, 424845.11],
        [190095.36, 483335.99]
      ]
    ])
  );

  const featurePoint = new Feature(new Point([1, 2]));

  describe("calculate distance or area", () => {
    it("calculateAreaOrLength should return a string when called with a Polygon or LineString", () => {
      const lineStringResult = calculateAreaOrLength(featureLineString);
      expect(lineStringResult).toContain("m");

      const polygonResult = calculateAreaOrLength(featurePolygon);
      expect(polygonResult).toContain("km2");

      const pointResult = calculateAreaOrLength(featurePoint);
      expect(pointResult).toBe("");
    });

    it("calculateLength should return a string with length", () => {
      const calculatedLength = calculateLength(
        featureLineString.getGeometry() as LineString
      );

      expect(calculatedLength).toBe("282.84 m");
    });

    it("calculateArea should return a string with area", () => {
      const calculatedArea = calculateArea(
        featurePolygon.getGeometry() as Polygon
      );

      expect(calculatedArea).toBe("6688.66 km2");
    });
  });

  describe("styleLabelFunction and styleSegmentLabelFunction", () => {
    it("when called with polygon, styleLabelFunction should return a style where geometry is the centre of the polygon", () => {
      const polygonLabelStyle = styleLabelFunction(featurePolygon, testStyle);

      expect(
        (polygonLabelStyle.getGeometry() as Point).getCoordinates()
      ).toEqual(
        featurePolygon.getGeometry()!.getInteriorPoint().getCoordinates()
      );
    });

    it("when called with linestring, styleLabelFunction should return a style where geometry is the last point of the linestring", () => {
      const linestringLabelStyle = styleLabelFunction(
        featureLineString,
        testStyle
      );

      expect(
        (linestringLabelStyle.getGeometry() as Point).getCoordinates()
      ).toEqual(featureLineString.getGeometry()!.getLastCoordinate());
    });

    it("when called with linestring, styleSegmentLabelFunction should return an array with length 2", () => {
      const linestringSegmentLabelStyle = styleSegmentLabelFunction(
        featureLineString,
        testStyle
      );

      expect(linestringSegmentLabelStyle.length).toEqual(2);
      expect(
        (linestringSegmentLabelStyle[0].getGeometry() as Point).getCoordinates()
      ).toEqual([50, 50]);
      expect(
        (linestringSegmentLabelStyle[1].getGeometry() as Point).getCoordinates()
      ).toEqual([150, 150]);
    });
  });
});
