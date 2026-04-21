import {
  Cartesian2,
  Cartesian3,
  Cartographic,
  HeadingPitchRange,
  Matrix4,
  Ray,
  TerrainProvider
} from "@cesium/engine";
import {
  cameraUtils,
  createFlyToOptions,
  flyToLookAtPosition,
  getCameraValues,
  getLookAtCartesian,
  getLookAtPositionAndRange
} from "./camera-utils";
import { Viewer } from "@cesium/widgets";
import { createCesiumMock } from "../viewer/viewer-mock.spec";
import { LookAtPosition, Position } from "../model/interfaces";
import Spy = jasmine.Spy;

describe("getCameraValues", () => {
  it("should return cameraPosition", () => {
    const viewer = createCesiumMock({ cameraPitch: -Math.PI / 8 });

    const expectedValues = {
      cameraPosition: { lon: 4.0, lat: 45.0, alt: undefined },
      lookAtPosition: undefined,
      orientation: { heading: 45, pitch: -22, roll: 0 },
      range: undefined
    };
    const cameraValues = getCameraValues(viewer.camera!, viewer as Viewer);

    expect(cameraValues).toEqual(expectedValues);
  });
});

describe("createFlyToOptions", () => {
  it("should use provided values when provided", () => {
    const cameraOptions = {
      cameraPosition: {
        lon: 4.5,
        lat: 45.9,
        alt: 300
      },
      orientation: {
        heading: 45,
        pitch: -15,
        roll: 0
      }
    };
    const expectedValues = {
      destination: new Cartesian3(
        4432810.494103013,
        348869.7519159874,
        4557734.853763895
      ),
      orientation: {
        heading: 0.7853981633974483,
        pitch: -0.2617993877991494,
        roll: 0
      }
    };
    const values = createFlyToOptions(cameraOptions);
    expect(values).toEqual(expectedValues);
  });

  it("should use default values when not provided", () => {
    const cameraOptions = {
      cameraPosition: {
        lon: 4.5,
        lat: 45.9
      }
    };
    const expectedValues = {
      destination: new Cartesian3(
        4432879.8708559815,
        348875.21198486,
        4557806.666393671
      ),
      orientation: {
        heading: 6.283185307179586,
        pitch: -0.5061454830783556,
        roll: 6.283185307179586
      }
    };
    const values = createFlyToOptions(cameraOptions);
    expect(values).toEqual(expectedValues);
  });
});

describe("getLookAtPositionAndRange", () => {
  it("it should return a position and range when looking at a position", () => {
    const viewer = createCesiumMock({ cameraPitch: -Math.PI / 8 });
    (viewer.camera?.getPickRay as Spy).and.returnValue({} as Ray);
    (viewer.scene?.globe.pick as Spy).and.returnValue(
      Cartesian3.fromDegrees(4.6, 52.5, 10)
    );
    const value = getLookAtPositionAndRange(viewer.camera!, viewer as Viewer);
    expect(round(value?.position.lat as number, 1)).toBe(52.5);
    expect(round(value?.position.lon as number, 1)).toBe(4.6);
    expect(round(value?.position.alt as number, 0)).toBe(10);
    expect(round(value?.range as number, 0)).toBe(90);
  });
  it("it should return undefined when not looking at a position", () => {
    const viewer = createCesiumMock({ cameraPitch: -Math.PI / 8 });
    (viewer.camera?.getPickRay as Spy).and.returnValue({} as Ray);
    (viewer.scene?.globe.pick as Spy).and.returnValue(undefined);
    const value = getLookAtPositionAndRange(viewer.camera!, viewer as Viewer);
    expect(value).toBe(undefined);
  });
});

describe("getLookAtCartesian", () => {
  it("should get the camera towards a cartesian", () => {
    const viewer = createCesiumMock({ cameraPitch: -Math.PI / 8 });
    const cameraSpy = (viewer.camera?.getPickRay as Spy).and.returnValue(
      new Ray()
    );
    const resultSpy = (viewer.scene?.globe.pick as Spy).and.returnValue(
      new Cartesian3()
    );

    getLookAtCartesian(viewer.camera!, viewer as Viewer);

    expect(cameraSpy).toHaveBeenCalledWith(new Cartesian2(100, 50));
    expect(resultSpy).toHaveBeenCalledWith(new Ray(), viewer.scene!);
  });
});

describe("flyToLookAtPosition", () => {
  let viewer: Partial<Viewer>;
  let cameraLookAtSpy: Spy<jasmine.Func>;
  let cameraLookAtTransformSpy: Spy<jasmine.Func>;

  beforeEach(() => {
    viewer = createCesiumMock({ cameraPitch: -Math.PI / 8 });
    cameraLookAtSpy = (viewer.camera?.lookAt as Spy).and.returnValue({});
    cameraLookAtTransformSpy = (
      viewer.camera?.lookAtTransform as Spy
    ).and.returnValue({});
  });

  it("should fly to look at the position with given orientation and range", async () => {
    const camops: LookAtPosition = {
      lookAtPosition: { lon: -115, lat: 37 },
      orientation: { heading: 90, pitch: 120 },
      range: 75
    };

    await flyToLookAtPosition(camops, viewer as Viewer);

    const lookAtPositionResult = new Cartesian3(
      -2155350.226166898,
      -4622163.476136757,
      3817393.160348164
    );
    const headingPitchRangeResult = new HeadingPitchRange(
      1.5707963267948966,
      2.0943951023931953,
      75
    );
    expect(cameraLookAtSpy).toHaveBeenCalledWith(
      lookAtPositionResult,
      headingPitchRangeResult
    );
    expect(cameraLookAtTransformSpy).toHaveBeenCalledWith(Matrix4.IDENTITY);
  });

  it("should fly to look at the position without given orientation and range", async () => {
    const camops: LookAtPosition = {
      lookAtPosition: { lon: -115, lat: 37 }
    };

    await flyToLookAtPosition(camops, viewer as Viewer);

    const lookAtPositionResult = new Cartesian3(
      -2155350.226166898,
      -4622163.476136757,
      3817393.160348164
    );
    const headingPitchRangeResult = new HeadingPitchRange(0, -Math.PI / 8, 500);

    expect(cameraLookAtSpy).toHaveBeenCalledWith(
      lookAtPositionResult,
      headingPitchRangeResult
    );
    expect(cameraLookAtTransformSpy).toHaveBeenCalledWith(Matrix4.IDENTITY);
  });
});

describe("getTerrainHeight", () => {
  const position: Position = { lat: -115, lon: 37, alt: 30 };

  it("should get the correct terrain height", async () => {
    const terrainProviderMock = {
      availability: {
        computeHeight: 50
      }
    } as unknown as TerrainProvider;
    const sampleTerrainMostDetailedUtilsSpy = spyOn(
      cameraUtils as any,
      "sampleTerrainMostDetailedUtils"
    ).and.returnValue(Promise.resolve([{ height: 100 } as Cartographic]));

    const result = await (cameraUtils as any).getTerrainHeight(
      position,
      terrainProviderMock
    );

    expect(sampleTerrainMostDetailedUtilsSpy).toHaveBeenCalledWith(
      terrainProviderMock,
      [new Cartographic(0.6457718232379019, -2.007128639793479, 30)]
    );
    expect(result).toEqual(100);
  });

  it("should return the default height when no terrainProvider is given", async () => {
    const result = await (cameraUtils as any).getTerrainHeight(
      position,
      undefined
    );
    expect(result).toEqual(30);
  });
});

function round(value: number, fixed: number) {
  const fixedValue = fixed === 0 ? value : value * Math.abs(fixed) * 10;
  const roundedFixedValue = Math.round(fixedValue);
  return fixed === 0
    ? roundedFixedValue
    : roundedFixedValue / (Math.abs(fixed) * 10);
}
