import { CenterModify, CenterModifyOptions } from "./center-modify";
import VectorSource from "ol/source/Vector";
import OlMap from "ol/Map";
import View from "ol/View";
import Feature from "ol/Feature";
import { LineString, Point, Polygon } from "ol/geom";
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
    spyOn(mockMap, "getPixelFromCoordinate").and.returnValue([5, 8]);

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
    spyOn(mockMap, "getPixelFromCoordinate").and.returnValue([5, 8]);

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
    spyOn(mockMap, "getPixelFromCoordinate").and.returnValue([5, 8]);

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

  it("skip point of selected feature, next en prev", () => {
    const centerModify = new CenterModify(centerModifyOptions);
    centerModify["calculatePixelDistanceOfCoordinates"] = featureNear;
    centerModify.setMap(mockMap);

    // no selecte feature
    expect(centerModify["highlightedFeature"]).toBeDefined();
    // default index
    expect(
      centerModify["selectedFeatureCurrentCoordinateIndex"]
    ).not.toBeDefined();

    // jump to first
    centerModify["handleKeyPress"]({ code: "BracketRight" } as KeyboardEvent);

    // feature selected
    expect(centerModify["highlightedFeature"]).toBeDefined();
    expect(centerModify["selectedFeatureCurrentCoordinateIndex"]).toEqual(0);

    // jump to next
    centerModify["handleKeyPress"]({ code: "BracketRight" } as KeyboardEvent);
    expect(centerModify["selectedFeatureCurrentCoordinateIndex"]).toEqual(1);
    centerModify["handleKeyPress"]({ code: "BracketRight" } as KeyboardEvent);
    expect(centerModify["selectedFeatureCurrentCoordinateIndex"]).toEqual(2);
    centerModify["selectedFeatureCurrentCoordinateIndex"] = 4;
    centerModify["handleKeyPress"]({ code: "BracketRight" } as KeyboardEvent);
    expect(centerModify["selectedFeatureCurrentCoordinateIndex"]).toEqual(0);
    // // jump to prev
    centerModify["handleKeyPress"]({ code: "BracketLeft" } as KeyboardEvent);
    expect(centerModify["selectedFeatureCurrentCoordinateIndex"]).toEqual(4);
    centerModify["selectedFeatureCurrentCoordinateIndex"] = 0;
    centerModify["handleKeyPress"]({ code: "BracketLeft" } as KeyboardEvent);
    expect(centerModify["selectedFeatureCurrentCoordinateIndex"]).toEqual(4);
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
        expect(coords.some((c) => c[0] === 100 && c[1] === 100)).toBeFalse();
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
        expect(coords.some((c) => c[0] === 150 && c[1] === 200)).toBeFalse();
      });
    });
  });
});
