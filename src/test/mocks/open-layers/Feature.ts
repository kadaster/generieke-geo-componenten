import type { IGeometry } from "./geom/Geometry";

export interface FeatureProperties {
  [key: string]: unknown;
}

function isGeometry(obj: unknown): obj is IGeometry {
  return !!obj && typeof (obj as { getType?: unknown }).getType === "function";
}

export default class Feature<TGeom extends IGeometry = IGeometry> {
  private id: string | number | undefined;
  private properties: FeatureProperties = {};
  private geometry: TGeom | null = null;
  private style: unknown = null;

  constructor(
    geometryOrProps?:
      | TGeom
      | {
          geometry?: TGeom;
          properties?: FeatureProperties;
          id?: string | number;
        }
  ) {
    if (geometryOrProps && isGeometry(geometryOrProps)) {
      this.geometry = geometryOrProps;
    } else if (geometryOrProps) {
      const opts = geometryOrProps as {
        geometry?: TGeom;
        properties?: FeatureProperties;
        id?: string | number;
      };
      if (opts.geometry) this.geometry = opts.geometry;
      if (opts.properties) this.properties = { ...opts.properties };
      if (typeof opts.id !== "undefined") this.id = opts.id;
    }
  }

  getId(): string | number | undefined {
    return this.id;
  }
  setId(id: string | number | undefined): void {
    this.id = id;
  }

  getProperties(): FeatureProperties {
    return { ...this.properties };
  }
  get(key: string): unknown {
    return this.properties[key];
  }
  set(key: string, value: unknown): void {
    this.properties[key] = value;
  }
  setProperties(obj: FeatureProperties): void {
    Object.assign(this.properties, obj);
  }

  getGeometry(): TGeom | null {
    return this.geometry;
  }
  setGeometry(g: TGeom): void {
    this.geometry = g;
  }

  setStyle(style: unknown): void {
    this.style = style;
  }
  getStyle(): unknown {
    return this.style;
  }

  clone(): Feature<TGeom> {
    const f = new Feature<TGeom>(this.geometry || undefined);
    f.style = this.style;
    f.properties = { ...this.properties };
    f.id = this.id;
    return f;
  }
}
