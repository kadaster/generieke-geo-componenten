import { Viewer } from "@cesium/widgets";
import {
  CameraOptions,
  CameraPosition,
  CameraValues,
  LookAtPosition,
  Position
} from "../model/interfaces";
import {
  Camera,
  Cartesian2,
  Cartesian3,
  Cartographic,
  HeadingPitchRange,
  Math as CesiumMath,
  Matrix4,
  sampleTerrainMostDetailed,
  TerrainProvider
} from "@cesium/engine";

export const MIN_VIEWDISTANCE = 400;
export const MAX_VIEWDISTANCE = 2000;
export const DEFAULT_RANGE = 734;
export const DEFAULT_ORIENTATION = {
  heading: 360,
  pitch: -29,
  roll: 360
};
export const DEFAULT_POSITIONSHIFT = {
  lat: 0.0,
  lon: 0.0,
  alt: MIN_VIEWDISTANCE
};

export const cameraUtils = {
  getCameraValues,
  getLookAtPositionAndRange,
  createFlyToOptions,
  getLookAtCartesian,
  flyToLookAtPosition,
  getTerrainHeight,
  sampleTerrainMostDetailedUtils
};

export function getCameraValues(camera: Camera, viewer: Viewer) {
  const lon = CesiumMath.toDegrees(camera.positionCartographic.longitude);
  const lat = CesiumMath.toDegrees(camera.positionCartographic.latitude);
  const alt = camera.positionCartographic.height;
  const heading = Math.round(CesiumMath.toDegrees(camera.heading));
  const pitch = Math.round(CesiumMath.toDegrees(camera.pitch));
  const roll = Math.round(CesiumMath.toDegrees(camera.roll));
  const lookAtPositionAndRange = getLookAtPositionAndRange(camera, viewer);
  const cameraValues: CameraValues = {
    cameraPosition: { lon, lat, alt },
    orientation: { heading, pitch, roll },
    lookAtPosition: lookAtPositionAndRange?.position,
    range: lookAtPositionAndRange?.range
  };
  return cameraValues;
}

export function getLookAtPositionAndRange(
  camera: Camera,
  viewer: Viewer
): { position: Position; range: number } | undefined {
  const lookAtCartesian = getLookAtCartesian(camera, viewer);
  if (lookAtCartesian) {
    const cartographic = Cartographic.fromCartesian(lookAtCartesian);
    const range = Cartesian3.distance(lookAtCartesian, camera.position);
    const position: Position = {
      lon: CesiumMath.toDegrees(cartographic.longitude),
      lat: CesiumMath.toDegrees(cartographic.latitude),
      alt: cartographic.height
    };
    return { position, range };
  }
  return undefined;
}

export function createFlyToOptions(cameraOptions: CameraPosition) {
  return {
    destination: Cartesian3.fromDegrees(
      cameraOptions.cameraPosition.lon + DEFAULT_POSITIONSHIFT.lon,
      cameraOptions.cameraPosition.lat - DEFAULT_POSITIONSHIFT.lat,
      cameraOptions.cameraPosition.alt ?? DEFAULT_POSITIONSHIFT.alt
    ),
    orientation: {
      heading: CesiumMath.toRadians(
        cameraOptions.orientation?.heading ?? DEFAULT_ORIENTATION.heading
      ),
      pitch: CesiumMath.toRadians(
        cameraOptions.orientation?.pitch ?? DEFAULT_ORIENTATION.pitch
      ),
      roll: CesiumMath.toRadians(
        cameraOptions.orientation?.roll ?? DEFAULT_ORIENTATION.roll
      )
    }
  };
}

export function getLookAtCartesian(
  camera: Camera,
  viewer: Viewer
): Cartesian3 | undefined {
  const windowPosition = new Cartesian2(
    viewer.canvas.width / 2,
    viewer.canvas.height / 2
  );
  const ray = camera.getPickRay(windowPosition);
  if (ray) {
    return viewer.scene.globe.pick(ray, viewer.scene);
  }
  return undefined;
}

export async function flyToLookAtPosition(
  cameraOptions: CameraOptions,
  viewer: Viewer
) {
  const camops = cameraOptions as LookAtPosition;

  const height = await getTerrainHeight(
    camops.lookAtPosition,
    viewer.terrainProvider
  );
  const lookAtPosition = Cartesian3.fromDegrees(
    camops.lookAtPosition.lon,
    camops.lookAtPosition.lat,
    height
  );
  const h = camops.orientation?.heading
    ? CesiumMath.toRadians(camops.orientation?.heading)
    : 0;
  const p = camops.orientation?.pitch
    ? CesiumMath.toRadians(camops.orientation?.pitch)
    : -Math.PI / 8;
  const r = camops.range ?? 500;
  viewer.camera.lookAt(lookAtPosition, new HeadingPitchRange(h, p, r));
  viewer.camera.lookAtTransform(Matrix4.IDENTITY);
}

async function getTerrainHeight(
  position: Position,
  terrainProvider: TerrainProvider | undefined
): Promise<number> {
  let height = position.alt ?? 0;
  if (terrainProvider) {
    const positions = [
      Cartographic.fromDegrees(position.lon, position.lat, position.alt)
    ];
    const updatedPositions = await cameraUtils.sampleTerrainMostDetailedUtils(
      terrainProvider,
      positions
    );
    height = updatedPositions[0].height;
  }
  return height;
}

async function sampleTerrainMostDetailedUtils(
  terrainProvider: TerrainProvider,
  positions: Cartographic[]
) {
  return await sampleTerrainMostDetailed(terrainProvider, positions);
}
