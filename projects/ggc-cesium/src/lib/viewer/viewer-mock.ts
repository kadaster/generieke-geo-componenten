import { Viewer } from "@cesium/widgets";
import { Cartesian3 } from "@cesium/engine";
import { Mocked, vi } from "vitest";

export const createCesiumMock = (options?: { cameraPitch?: number }) => {
  const camera = {
    flyTo: vi.fn().mockName("Camera.flyTo"),
    getPickRay: vi.fn().mockName("Camera.getPickRay"),
    lookAtTransform: vi.fn().mockName("Camera.lookAtTransform"),
    lookAt: vi.fn().mockName("Camera.lookAt"),
    moveForward: vi.fn().mockName("Camera.moveForward"),
    moveBackward: vi.fn().mockName("Camera.moveBackward"),
    rotateUp: vi.fn().mockName("Camera.rotateUp"),
    rotateLeft: vi.fn().mockName("Camera.rotateLeft"),
    rotateRight: vi.fn().mockName("Camera.rotateRight"),
    rotateDown: vi.fn().mockName("Camera.rotateDown"),
    changed: {
      addEventListener: vi.fn().mockName("Event.addEventListener")
    },
    moveEnd: {
      addEventListener: vi.fn().mockName("Event.addEventListener")
    },
    directionWC: new Cartesian3(0.4, 0.5, 0.6),
    pitch: options?.cameraPitch,
    position: Cartesian3.fromDegrees(4.6, 52.5, 100),
    positionCartographic: {
      longitude: Math.PI / 45,
      latitude: Math.PI / 4
    },
    heading: Math.PI / 4,
    roll: 0
  };
  return {
    camera,
    entities: {
      add: vi.fn().mockName("Entities.add"),
      removeById: vi.fn().mockName("Entities.removeById"),
      remove: vi.fn().mockName("Entities.remove")
    },
    scene: {
      imageryLayers: vi.fn().mockName("Scene.imageryLayers"),
      primitives: vi.fn().mockName("Scene.primitives"),
      pick: vi.fn().mockName("Scene.pick"),
      globe: {
        pick: vi.fn().mockName("Globe.pick")
      },
      camera,
      preRender: {
        addEventListener: vi.fn().mockName("Event.addEventListener")
      },
      context: {
        depthTexture: {}
      },
      postProcessStages: {
        removeAll: vi.fn().mockName("PostProcessStageCollection.removeAll"),
        add: vi.fn().mockName("PostProcessStageCollection.add")
      }
    },
    canvas: { width: 200, height: 100 } as HTMLCanvasElement
  } as any as Mocked<Viewer>;
};
