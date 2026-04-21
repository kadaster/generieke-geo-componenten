import { Viewer } from "@cesium/widgets";
import { Cartesian3 } from "@cesium/engine";

export const createCesiumMock = (options?: {
  cameraPitch?: number;
}): Partial<Viewer> => {
  const camera = jasmine.createSpyObj(
    "Camera",
    [
      "flyTo",
      "getPickRay",
      "lookAtTransform",
      "lookAt",
      "moveForward",
      "moveBackward",
      "rotateUp",
      "rotateLeft",
      "rotateRight",
      "rotateDown"
    ],
    {
      changed: jasmine.createSpyObj("Event", ["addEventListener"]),
      moveEnd: jasmine.createSpyObj("Event", ["addEventListener"]),
      directionWC: new Cartesian3(0.4, 0.5, 0.6),
      pitch: options?.cameraPitch,
      position: Cartesian3.fromDegrees(4.6, 52.5, 100),
      positionCartographic: {
        longitude: Math.PI / 45,
        latitude: Math.PI / 4
      },
      heading: Math.PI / 4,
      roll: 0
    }
  );
  return {
    camera,
    entities: jasmine.createSpyObj("Entities", ["add", "removeById", "remove"]),
    scene: jasmine.createSpyObj(
      "Scene",
      ["imageryLayers", "primitives", "pick"],
      {
        globe: jasmine.createSpyObj("Globe", ["pick"]),
        camera,
        preRender: jasmine.createSpyObj("Event", ["addEventListener"]),
        context: {
          depthTexture: {}
        },
        postProcessStages: jasmine.createSpyObj("PostProcessStageCollection", [
          "removeAll",
          "add"
        ])
      }
    ),
    canvas: { width: 200, height: 100 } as HTMLCanvasElement
  };
};
