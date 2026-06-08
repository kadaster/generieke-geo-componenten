export interface IGeometry {
  getType(): string;
  getExtent(): [number, number, number, number];
  getCoordinates(): unknown;
  setCoordinates(coords: unknown): void;
}

export class Geometry implements IGeometry {
  protected _coords: unknown = null;

  getType(): string {
    return "Geometry";
  }

  getExtent(): [number, number, number, number] {
    return [0, 0, 0, 0];
  }

  getCoordinates(): unknown {
    return this._coords;
  }

  setCoordinates(coords: unknown): void {
    this._coords = coords;
  }
}

export class GeometryCollection extends Geometry {}
export class Point extends Geometry {}
export class LineString extends Geometry {}
export class MultiPoint extends Geometry {}
export class MultiLineString extends Geometry {}
export class MultiPolygon extends Geometry {}
export class LinearRing extends Geometry {}

export class Polygon extends Geometry {
  getType(): string {
    return "Polygon";
  }
}
