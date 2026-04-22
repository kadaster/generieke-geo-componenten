import { CenterModify, CenterModifyOptions } from "./center-modify";
import VectorSource from "ol/source/Vector";
import OlMap from "ol/Map";
import View from "ol/View";
import Feature from "ol/Feature";
import { LineString } from "ol/geom";
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
});
