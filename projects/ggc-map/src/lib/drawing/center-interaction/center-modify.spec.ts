import { CenterModify, CenterModifyOptions } from "./center-modify";
import { FeatureCoordinateResult } from "./center-base";
import VectorSource from "ol/source/Vector";
import OlMap from "ol/Map";
import View from "ol/View";
import Feature from "ol/Feature";
import { LineString, Point, Polygon } from "ol/geom";
import GeometryCollection from "ol/geom/GeometryCollection";
import Projection from "ol/proj/Projection";

describe("CenterModify", () => {
  const featureNear = () => {
    return 5;
  };
  const featureFar = () => {
    return 20;
  };

  let centerModifyOptions: CenterModifyOptions;
  const center = [100, 100];
  const rdProjection = new Projection({
    code: "EPSG:28992",
    units: "m",
    extent: [0, 300000, 300000, 620000]
  });
  let mockMap: OlMap;

  beforeEach(() => {
    const targetSource = new VectorSource();
    const feature = new Feature(
      new LineString([
        [0, 0],
        [100, 100],
        [200, 200]
      ])
    );
    targetSource.addFeature(feature);

    centerModifyOptions = {
      targetSource: targetSource
    };

    mockMap = new OlMap({
      view: new View({
        projection: rdProjection,
        center: center,
        zoom: 10
      })
    });
  });

  it("should be there", () => {
    const centerModify = new CenterModify(centerModifyOptions);
    expect(centerModify).toBeDefined();
  });

  it("should not select a feature is it is to far", () => {
    const centerModify = new CenterModify(centerModifyOptions);
    centerModify["calculatePixelDistanceOfCoordinates"] = featureFar;
    centerModify.setMap(mockMap);
    vi.spyOn(mockMap, "getPixelFromCoordinate").mockReturnValue([5, 8]);

    expect(centerModify["targetSource"]?.getFeatures()[0]).toBeDefined();
    // no feature selected
    expect(
      centerModify["modifyOverlay"].getSource()?.getFeatures()[0]
    ).not.toBeDefined();
  });

  it("should select a feature and modify with moving center", () => {
    const centerModify = new CenterModify(centerModifyOptions);
    centerModify["calculatePixelDistanceOfCoordinates"] = featureNear;

    centerModify.setMap(mockMap);
    vi.spyOn(mockMap, "getPixelFromCoordinate").mockReturnValue([5, 8]);

    expect(centerModify["targetSource"]?.getFeatures()[0]).toBeDefined();
    // selected feature
    expect(
      centerModify["modifyOverlay"].getSource()?.getFeatures()[0]
    ).toBeDefined();

    // feature is selected
    expect(
      centerModify["modifyOverlay"]
        .getSource()
        ?.getFeatures()[0]
        .getGeometry()
        .getCoordinates()
    ).toEqual([
      [0, 0],
      [100, 100],
      [200, 200]
    ]);

    centerModify.startModifyCurrentPoint();

    // move center
    mockMap.getView().setCenter([5, 5]);

    // selection is modified
    expect(
      centerModify["modifyOverlay"]
        .getSource()
        ?.getFeatures()[0]
        .getGeometry()
        .getCoordinates()
    ).toEqual([
      [0, 0],
      [5, 5],
      [200, 200]
    ]);
  });

  it("moves feature from targetSource to modifyOverlay after startModifyCurrentPoint", () => {
    const centerModify = new CenterModify(centerModifyOptions);
    centerModify["calculatePixelDistanceOfCoordinates"] = featureNear;
    centerModify.setMap(mockMap);
    vi.spyOn(mockMap, "getPixelFromCoordinate").mockReturnValue([5, 8]);

    expect(centerModify["targetSource"]?.getFeatures()[0]).toBeDefined();

    // start modify and remove from targetSource
    centerModify.startModifyCurrentPoint();

    expect(centerModify["targetSource"]?.getFeatures()[0]).not.toBeDefined();

    centerModify.finishModify();
    centerModify.cleanup();

    // featre is back in targetSource
    expect(centerModify["targetSource"]?.getFeatures()[0]).toBeDefined();
  });

  it("use default keys next and prevPoint", () => {
    const centerModify = new CenterModify(centerModifyOptions);
    centerModify["calculatePixelDistanceOfCoordinates"] = () => {
      return 5;
    };

    expect(centerModify["keyNextPoint"]).toEqual("BracketRight");
    expect(centerModify["keyPrevPoint"]).toEqual("BracketLeft");
  });

  it("set optional keys next and prevPoint", () => {
    centerModifyOptions.customKeyNextPoint = "->";
    centerModifyOptions.customKeyPrevPoint = "<-";
    const centerModify = new CenterModify(centerModifyOptions);
    centerModify["calculatePixelDistanceOfCoordinates"] = () => {
      return 5;
    };

    expect(centerModify["keyNextPoint"]).toEqual("->");
    expect(centerModify["keyPrevPoint"]).toEqual("<-");
  });

  it("cycles to the next and previous point of the selected feature", () => {
    const centerModify = new CenterModify(centerModifyOptions);
    centerModify["calculatePixelDistanceOfCoordinates"] = (
      coordinate1,
      coordinate2
    ) =>
      Math.hypot(
        coordinate1[0] - coordinate2[0],
        coordinate1[1] - coordinate2[1]
      );
    centerModify.setMap(mockMap);

    expect(centerModify["highlightedFeature"]).toBeDefined();
    expect(
      centerModify["selectedFeatureCurrentCoordinateIndex"]
    ).not.toBeDefined();

    centerModify["handleKeyPress"]({ code: "BracketRight" } as KeyboardEvent);
    expect(centerModify["selectedFeatureCurrentCoordinateIndex"]).toEqual(1);
    centerModify["handleKeyPress"]({ code: "BracketRight" } as KeyboardEvent);
    expect(centerModify["selectedFeatureCurrentCoordinateIndex"]).toEqual(0);
    centerModify["handleKeyPress"]({ code: "BracketRight" } as KeyboardEvent);
    expect(centerModify["selectedFeatureCurrentCoordinateIndex"]).toEqual(4);

    centerModify["handleKeyPress"]({ code: "BracketLeft" } as KeyboardEvent);
    expect(centerModify["selectedFeatureCurrentCoordinateIndex"]).toEqual(0);
    centerModify["handleKeyPress"]({ code: "BracketLeft" } as KeyboardEvent);
    expect(centerModify["selectedFeatureCurrentCoordinateIndex"]).toEqual(1);
  });

  it("jumps to the closest point before advancing when the center is not on a point", () => {
    const centerModify = new CenterModify(centerModifyOptions);
    centerModify["calculatePixelDistanceOfCoordinates"] = (
      coordinate1,
      coordinate2
    ) =>
      Math.hypot(
        coordinate1[0] - coordinate2[0],
        coordinate1[1] - coordinate2[1]
      );
    centerModify.setMap(mockMap);
    centerModify["centerPoint"] = new Point([80, 90]);

    centerModify["handleKeyPress"]({ code: "BracketRight" } as KeyboardEvent);

    expect(centerModify["selectedFeatureCurrentCoordinateIndex"]).toEqual(2);
    expect(mockMap.getView().getCenter()).toEqual([100, 100]);
  });

  it("jumps to the closest point before going back when the center is not on a point", () => {
    const centerModify = new CenterModify(centerModifyOptions);
    centerModify["calculatePixelDistanceOfCoordinates"] = (
      coordinate1,
      coordinate2
    ) =>
      Math.hypot(
        coordinate1[0] - coordinate2[0],
        coordinate1[1] - coordinate2[1]
      );
    centerModify.setMap(mockMap);
    centerModify["centerPoint"] = new Point([80, 60]);

    centerModify["handleKeyPress"]({ code: "BracketLeft" } as KeyboardEvent);

    expect(centerModify["selectedFeatureCurrentCoordinateIndex"]).toEqual(1);
    expect(mockMap.getView().getCenter()).toEqual([50, 50]);
  });

  describe("keyboard navigation", () => {
    let centerModify: CenterModify;

    beforeEach(() => {
      centerModify = new CenterModify(centerModifyOptions);
      vi.spyOn(mockMap, "getPixelFromCoordinate").mockImplementation(
        (coordinate) => coordinate
      );
      centerModify.setMap(mockMap);
    });

    afterEach(() => {
      centerModify.cleanup();
      mockMap.dispose();
    });

    it.each([
      { center: [102, 100], key: "BracketRight", expected: [50, 50] },
      { center: [102, 100], key: "BracketLeft", expected: [150, 150] },
      { center: [52, 50], key: "BracketRight", expected: [0, 0] },
      { center: [52, 50], key: "BracketLeft", expected: [100, 100] },
      { center: [30, 32], key: "BracketRight", expected: [0, 0] },
      { center: [30, 32], key: "BracketLeft", expected: [50, 50] },
      { center: [70, 72], key: "BracketRight", expected: [50, 50] },
      { center: [70, 72], key: "BracketLeft", expected: [100, 100] }
    ])(
      "should navigate from $center with $key to $expected",
      ({ center, key, expected }) => {
        mockMap.getView().setCenter(center);

        centerModify["handleKeyPress"](
          new KeyboardEvent("keypress", { code: key })
        );

        expect(mockMap.getView().getCenter()).toEqual(expected);
      }
    );

    it.each([
      { center: [2, 20], key: "BracketRight", expected: [0, 50] },
      { center: [2, 20], key: "BracketLeft", expected: [0, 0] },
      { center: [5.999, 20], key: "BracketRight", expected: [0, 50] },
      { center: [6, 20], key: "BracketRight", expected: [0, 0] },
      { center: [6, 20], key: "BracketLeft", expected: [0, 0] }
    ])(
      "should navigate near the closing polygon segment from $center with $key",
      ({ center, key, expected }) => {
        centerModifyOptions.targetSource.clear();
        centerModifyOptions.targetSource.addFeature(
          new Feature(
            new Polygon([
              [
                [0, 0],
                [100, 0],
                [100, 100],
                [0, 100],
                [0, 0]
              ]
            ])
          )
        );
        mockMap.getView().setCenter(center);

        centerModify["handleKeyPress"](
          new KeyboardEvent("keypress", { code: key })
        );

        expect(mockMap.getView().getCenter()).toEqual(expected);
      }
    );

    it.each(["BracketRight", "BracketLeft"])(
      "should use the closest point to the center inside a highlighted polygon with %s",
      (key) => {
        centerModifyOptions.targetSource.clear();
        centerModifyOptions.targetSource.addFeature(
          new Feature(
            new Polygon([
              [
                [0, 0],
                [1000, 0],
                [1000, 90],
                [450, 90],
                [0, 90],
                [0, 0]
              ]
            ])
          )
        );
        mockMap.getView().setCenter([450, 40]);

        centerModify["handleKeyPress"](
          new KeyboardEvent("keypress", { code: key })
        );

        expect(mockMap.getView().getCenter()).toEqual([450, 90]);
      }
    );
  });

  describe("removeModifyCurrentPoint", () => {
    const rdProjection = new Projection({
      code: "EPSG:28992",
      units: "m",
      extent: [0, 300000, 300000, 620000]
    });

    function createMapWithCenter(center: number[]): OlMap {
      return new OlMap({
        view: new View({
          projection: rdProjection,
          center,
          zoom: 10
        })
      });
    }

    it("should do nothing if no feature is close enough to the center", () => {
      const targetSource = new VectorSource();
      targetSource.addFeature(new Feature(new Point([100, 100])));
      const options: CenterModifyOptions = { targetSource };
      const centerModify = new CenterModify(options);
      centerModify["calculatePixelDistanceOfCoordinates"] = () => 20; // te ver
      const map = createMapWithCenter([100, 100]);
      centerModify.setMap(map);

      const featuresBefore = targetSource.getFeatures().length;
      centerModify.removeModifyCurrentPoint();
      expect(targetSource.getFeatures().length).toBe(featuresBefore);
    });

    describe("Point geometry", () => {
      it("should remove a Point feature from the targetSource", () => {
        const targetSource = new VectorSource();
        const pointFeature = new Feature(new Point([100, 100]));
        targetSource.addFeature(pointFeature);

        const options: CenterModifyOptions = { targetSource };
        const centerModify = new CenterModify(options);
        centerModify["calculatePixelDistanceOfCoordinates"] = () => 5;
        const map = createMapWithCenter([100, 100]);
        centerModify.setMap(map);

        expect(targetSource.getFeatures().length).toBe(1);
        centerModify.removeModifyCurrentPoint();
        expect(targetSource.getFeatures().length).toBe(0);
      });

      it("should clear the modifyOverlay and reset highlightedFeature after removing a Point", () => {
        const targetSource = new VectorSource();
        targetSource.addFeature(new Feature(new Point([100, 100])));

        const options: CenterModifyOptions = { targetSource };
        const centerModify = new CenterModify(options);
        centerModify["calculatePixelDistanceOfCoordinates"] = () => 5;
        const map = createMapWithCenter([100, 100]);
        centerModify.setMap(map);

        centerModify.removeModifyCurrentPoint();

        expect(
          centerModify["modifyOverlay"].getSource()?.getFeatures().length
        ).toBe(0);
        expect(centerModify["highlightedFeature"]).toBeUndefined();
      });
    });

    describe("LineString geometry", () => {
      it("should remove a vertex from a LineString when it has more than 2 coordinates", () => {
        const targetSource = new VectorSource();
        const lineFeature = new Feature(
          new LineString([
            [100, 100],
            [200, 200],
            [300, 300]
          ])
        );
        targetSource.addFeature(lineFeature);

        const options: CenterModifyOptions = { targetSource };
        const centerModify = new CenterModify(options);
        centerModify["calculatePixelDistanceOfCoordinates"] = () => 5;
        const map = createMapWithCenter([100, 100]);
        centerModify.setMap(map);

        centerModify.removeModifyCurrentPoint();

        const geometry = lineFeature.getGeometry() as LineString;
        expect(geometry.getCoordinates()).toEqual([
          [200, 200],
          [300, 300]
        ]);
        // Feature should still be in the source
        expect(targetSource.getFeatures().length).toBe(1);
      });

      it("should remove the entire LineString feature if only 1 coordinate would remain", () => {
        const targetSource = new VectorSource();
        const lineFeature = new Feature(
          new LineString([
            [100, 100],
            [200, 200]
          ])
        );
        targetSource.addFeature(lineFeature);

        const options: CenterModifyOptions = { targetSource };
        const centerModify = new CenterModify(options);
        centerModify["calculatePixelDistanceOfCoordinates"] = () => 5;
        const map = createMapWithCenter([100, 100]);
        centerModify.setMap(map);

        centerModify.removeModifyCurrentPoint();

        expect(targetSource.getFeatures().length).toBe(0);
        expect(centerModify["highlightedFeature"]).toBeUndefined();
      });

      it("should not remove any vertex from a LineString if the selected coordinate is not on the feature", () => {
        const targetSource = new VectorSource();
        const lineFeature = new Feature(
          new LineString([
            [500, 500],
            [600, 600],
            [700, 700]
          ])
        );
        targetSource.addFeature(lineFeature);

        const options: CenterModifyOptions = { targetSource };
        const centerModify = new CenterModify(options);
        // Place center far from the feature
        centerModify["calculatePixelDistanceOfCoordinates"] = () => 20;
        const map = createMapWithCenter([500, 500]);
        centerModify.setMap(map);

        centerModify.removeModifyCurrentPoint();

        const geometry = lineFeature.getGeometry() as LineString;
        expect(geometry.getCoordinates().length).toBe(3);
      });
    });

    describe("Polygon geometry", () => {
      it("should remove a vertex from a Polygon when enough coordinates remain, keeping ring closed", () => {
        const targetSource = new VectorSource();
        // Closed polygon ring: first === last
        const polygonFeature = new Feature(
          new Polygon([
            [
              [100, 100],
              [200, 100],
              [200, 200],
              [250, 300],
              [300, 300],
              [100, 100]
            ]
          ])
        );
        targetSource.addFeature(polygonFeature);

        const options: CenterModifyOptions = { targetSource };
        const centerModify = new CenterModify(options);
        centerModify["calculatePixelDistanceOfCoordinates"] = () => 5;
        const map = createMapWithCenter([100, 100]);
        centerModify.setMap(map);

        centerModify.removeModifyCurrentPoint();

        const polygon = polygonFeature.getGeometry() as Polygon;
        const coords = polygon.getCoordinates()[0];
        // [100,100] removed; ring must stay closed: first and last equal
        expect(coords[0]).toEqual(coords[coords.length - 1]);
        expect(coords.some((c) => c[0] === 100 && c[1] === 100)).toBe(false);
      });

      it("should remove the entire Polygon feature if only 1 coordinate would remain after removal", () => {
        const targetSource = new VectorSource();
        // Minimal polygon (degenerate): 2 unique coords
        const polygonFeature = new Feature(
          new Polygon([
            [
              [100, 100],
              [200, 200],
              [100, 100]
            ]
          ])
        );
        targetSource.addFeature(polygonFeature);

        const options: CenterModifyOptions = { targetSource };
        const centerModify = new CenterModify(options);
        centerModify["calculatePixelDistanceOfCoordinates"] = () => 5;
        const map = createMapWithCenter([100, 100]);
        centerModify.setMap(map);

        centerModify.removeModifyCurrentPoint();

        expect(targetSource.getFeatures().length).toBe(0);
        expect(centerModify["highlightedFeature"]).toBeUndefined();
      });

      it("should close the Polygon ring if first and last coordinate differ after vertex removal", () => {
        const targetSource = new VectorSource();
        const polygonFeature = new Feature(
          new Polygon([
            [
              [100, 100],
              [200, 100],
              [150, 200],
              [50, 200],
              [100, 100]
            ]
          ])
        );
        targetSource.addFeature(polygonFeature);

        const options: CenterModifyOptions = { targetSource };
        const centerModify = new CenterModify(options);
        centerModify["calculatePixelDistanceOfCoordinates"] = () => 5;
        const map = createMapWithCenter([150, 200]);
        centerModify.setMap(map);

        centerModify.removeModifyCurrentPoint();

        const polygon = polygonFeature.getGeometry() as Polygon;
        const coords = polygon.getCoordinates()[0];
        expect(coords[0]).toEqual(coords[coords.length - 1]);
        expect(coords.some((c) => c[0] === 150 && c[1] === 200)).toBe(false);
      });
    });

    describe("getSketchCoordinates", () => {
      it("returns point coordinates when sketch geometry is Point", () => {
        const centerModify = new CenterModify(centerModifyOptions);
        centerModify["sketchFeature"] = new Feature(new Point([10, 20]));

        expect(centerModify.getSketchCoordinates()).toEqual([[10, 20]]);
      });

      it("returns line coordinates without the last coordinate for LineString sketches", () => {
        const centerModify = new CenterModify(centerModifyOptions);
        centerModify["sketchFeature"] = new Feature(
          new LineString([
            [0, 0],
            [10, 10],
            [20, 20]
          ])
        );

        expect(centerModify.getSketchCoordinates()).toEqual([
          [0, 0],
          [10, 10]
        ]);
      });

      it("returns polygon coordinates without second-to-last coordinate for Polygon sketches", () => {
        const centerModify = new CenterModify(centerModifyOptions);
        centerModify["sketchFeature"] = new Feature(
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

        expect(centerModify.getSketchCoordinates()).toEqual([
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 0]
        ]);
      });

      it("returns highlighted feature coordinates when there is no sketch geometry", () => {
        const centerModify = new CenterModify(centerModifyOptions);
        const highlightedFeature = new Feature(
          new LineString([
            [5, 5],
            [15, 15]
          ])
        );
        centerModify["centerPoint"] = new Point([100, 100]);
        centerModify["sketchFeature"] = undefined;
        centerModify["getClosestFeatureCoordinate"] = () =>
          ({
            feature: highlightedFeature,
            coordinate: [5, 5]
          }) as FeatureCoordinateResult;

        expect(centerModify.getSketchCoordinates()).toEqual([
          [5, 5],
          [15, 15]
        ]);
      });

      it("returns an empty array and warns for unknown sketch geometry types", () => {
        const centerModify = new CenterModify(centerModifyOptions);
        centerModify["sketchFeature"] = new Feature(new GeometryCollection([]));
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

        expect(centerModify.getSketchCoordinates()).toEqual([]);
        expect(warnSpy).toHaveBeenCalledWith("Unknown geometry type");
      });

      it("returns an empty array when there is no sketch and no highlighted feature", () => {
        const centerModify = new CenterModify(centerModifyOptions);
        centerModify["centerPoint"] = new Point([100, 100]);
        centerModify["sketchFeature"] = undefined;
        centerModify["getClosestFeatureCoordinate"] = () => undefined;

        expect(centerModify.getSketchCoordinates()).toEqual([]);
      });
    });
  });
});
