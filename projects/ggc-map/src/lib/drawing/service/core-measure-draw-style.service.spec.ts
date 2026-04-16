import { TestBed } from "@angular/core/testing";
import { Feature } from "ol";

import LineString from "ol/geom/LineString";
import Point from "ol/geom/Point";
import Polygon from "ol/geom/Polygon";
import Style, { StyleFunction } from "ol/style/Style";
import { CoreMeasureDrawStyleService } from "./core-measure-draw-style.service";
import { StyleLikeMap } from "../../model/draw-interaction-event.model";

describe("MeasureStylingService", () => {
  let measureDrawStyleService: CoreMeasureDrawStyleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    measureDrawStyleService = TestBed.inject(CoreMeasureDrawStyleService);
  });

  const featureLineString = new Feature(
    new LineString([
      [0, 0],
      [100, 100],
      [200, 200]
    ])
  );

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

  describe("getMeasureStyle", () => {
    describe("should return a StyleLikeMap with drawingDrawStyle and finishDrawStyle", () => {
      it("when called without measureStyleMap", () => {
        const styleLikeMap = measureDrawStyleService.getMeasureStyle(
          "Polygon",
          {}
        );

        expect(styleLikeMap.drawingDrawStyle).toBeDefined();
        expect(styleLikeMap.finishDrawStyle).toBeDefined();
      });

      it("when called with measureStyleMap with finishDrawStyle only", () => {
        const measureStyleMap: StyleLikeMap = {
          finishDrawStyle: () => {}
        };
        const styleLikeMap = measureDrawStyleService.getMeasureStyle(
          "Polygon",
          {},
          measureStyleMap
        );

        expect(styleLikeMap.drawingDrawStyle).toBeDefined();
        expect(styleLikeMap.finishDrawStyle).toBeDefined();
      });
    });

    it("should add the styling for the total length", () => {
      const styleLike = measureDrawStyleService.getMeasureStyle("Polygon", {
        showTotalLength: true
      });

      const drawingPolygon = (styleLike.drawingDrawStyle as StyleFunction)(
        featurePolygon,
        1
      ) as Style[];
      expect(drawingPolygon.length)
        .withContext("Drawing polygon should have 2 styles")
        .toBe(2);
      const drawingLineString = (styleLike.drawingDrawStyle as StyleFunction)(
        featureLineString,
        1
      ) as Style[];
      expect(drawingLineString.length)
        .withContext("Drawing linestring should have 2 styles")
        .toBe(2);
      const drawingPoint = (styleLike.drawingDrawStyle as StyleFunction)(
        featurePoint,
        1
      ) as Style[];
      expect(drawingPoint.length)
        .withContext("Drawing point should have 1 style")
        .toBe(1);

      const finishedPolygon = (styleLike.finishDrawStyle as StyleFunction)(
        featurePolygon,
        1
      ) as Style[];
      expect(finishedPolygon.length)
        .withContext("Finished polygon should have 2 styles")
        .toBe(2);
      const finishedLineString = (styleLike.finishDrawStyle as StyleFunction)(
        featureLineString,
        1
      ) as Style[];
      expect(finishedLineString.length)
        .withContext("Finished linestring should have 2 styles")
        .toBe(2);
      const finishedPoint = (styleLike.finishDrawStyle as StyleFunction)(
        featurePoint,
        1
      ) as Style[];
      expect(finishedPoint.length)
        .withContext("Finished point should have 1 style")
        .toBe(1);
    });

    it("should add the styling for the segment length", () => {
      const styleLike = measureDrawStyleService.getMeasureStyle("Polygon", {
        showSegmentLength: true
      });

      const drawingPolygon = (styleLike.drawingDrawStyle as StyleFunction)(
        featurePolygon,
        1
      ) as Style[];
      expect(drawingPolygon.length)
        .withContext("Drawing polygon should have 4 styles")
        .toBe(4);
      const drawingLineString = (styleLike.drawingDrawStyle as StyleFunction)(
        featureLineString,
        1
      ) as Style[];
      expect(drawingLineString.length)
        .withContext("Drawing linestring should have 2 styles")
        .toBe(2);
      const drawingPoint = (styleLike.drawingDrawStyle as StyleFunction)(
        featurePoint,
        1
      ) as Style[];
      expect(drawingPoint.length)
        .withContext("Drawing point should have 1 style")
        .toBe(1);

      const finishedPolygon = (styleLike.finishDrawStyle as StyleFunction)(
        featurePolygon,
        1
      ) as Style[];
      expect(finishedPolygon.length)
        .withContext("Finished polygon should have 4 styles")
        .toBe(4);
      const finishedLineString = (styleLike.finishDrawStyle as StyleFunction)(
        featureLineString,
        1
      ) as Style[];
      expect(finishedLineString.length)
        .withContext("Finished linestring should have 3 styles")
        .toBe(3);
      const finishedPoint = (styleLike.finishDrawStyle as StyleFunction)(
        featurePoint,
        1
      ) as Style[];
      expect(finishedPoint.length)
        .withContext("Finished point should have 1 style")
        .toBe(1);
    });

    it("should add the styling for the area", () => {
      const styleLike = measureDrawStyleService.getMeasureStyle("Polygon", {
        showArea: true
      });

      const drawingPolygon = (styleLike.drawingDrawStyle as StyleFunction)(
        featurePolygon,
        1
      ) as Style[];
      expect(drawingPolygon.length)
        .withContext("Drawing polygon should have 2 styles")
        .toBe(2);
      const drawingLineString = (styleLike.drawingDrawStyle as StyleFunction)(
        featureLineString,
        1
      ) as Style[];
      expect(drawingLineString.length)
        .withContext("Drawing linestring should have 2 styles")
        .toBe(2);
      const drawingPoint = (styleLike.drawingDrawStyle as StyleFunction)(
        featurePoint,
        1
      ) as Style[];
      expect(drawingPoint.length)
        .withContext("Drawing point should have 1 style")
        .toBe(1);

      const finishedPolygon = (styleLike.finishDrawStyle as StyleFunction)(
        featurePolygon,
        1
      ) as Style[];
      expect(finishedPolygon.length)
        .withContext("Finished polygon should have 2 styles")
        .toBe(2);
      const finishedLineString = (styleLike.finishDrawStyle as StyleFunction)(
        featureLineString,
        1
      ) as Style[];
      expect(finishedLineString.length)
        .withContext("Finished linestring should have 1 styles")
        .toBe(1);
      const finishedPoint = (styleLike.finishDrawStyle as StyleFunction)(
        featurePoint,
        1
      ) as Style[];
      expect(finishedPoint.length)
        .withContext("Finished point should have 1 style")
        .toBe(1);
    });
  });
});
