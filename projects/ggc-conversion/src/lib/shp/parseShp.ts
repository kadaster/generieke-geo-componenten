import { Buffer } from "buffer";
import {
  Geometry,
  LineString,
  MultiLineString,
  MultiPoint,
  MultiPolygon,
  Point,
  Polygon,
  Position
} from "geojson";
import { defs } from "@kadaster/ggc-models";
import { register } from "ol/proj/proj4";
import proj4 from "proj4";

proj4.defs("EPSG:28992", defs);
register(proj4);

function isClockWise(array: Position[]): boolean {
  let sum = 0;
  let i = 1;
  const len = array.length;
  let prev: Position, cur: Position;
  cur = array[0];
  while (i < len) {
    prev = cur || array[0];
    cur = array[i];
    sum += (cur[0] - prev[0]) * (cur[1] + prev[1]);
    i++;
  }
  return sum > 0;
}

function polyReduce(a: Position[][][], b: Position[]): Position[][][] {
  if (isClockWise(b) || !a.length) {
    a.push([b]);
  } else {
    a[a.length - 1].push(b);
  }
  return a;
}

enum shpFuncObj {
  parsePoint = 1,
  parsePolyline = 3,
  parsePolygon = 5,
  parseMultiPoint = 8,
  parseZPoint = 11,
  parseZPolyline = 13,
  parseZPolygon = 15,
  parseZMultiPoint = 18
}

function makeParseCoord(
  sourceProjection: string,
  targetProjection: string
): (data: Buffer, offset: number) => number[] {
  if (sourceProjection !== targetProjection) {
    return (data, offset) =>
      proj4(sourceProjection, targetProjection, [
        data.readDoubleLE(offset),
        data.readDoubleLE(offset + 8)
      ]);

    /*converter.inverse([
        data.readDoubleLE(offset),
        data.readDoubleLE(offset + 8)
      ]);*/
  } else {
    return (data, offset) => [
      data.readDoubleLE(offset),
      data.readDoubleLE(offset + 8)
    ];
  }
}

interface Row {
  id: number;
  len: number;
  data?: Buffer;
  type: number;
}

class ParseShp {
  buffer: Buffer;
  headers: {
    length: number;
    version: number;
    shpCode: shpFuncObj;
    bbox: number[];
  };
  parseFunc!: (data: Buffer) => Geometry;
  parseCoord!: (data: Buffer, offset: number) => number[];
  rows: Geometry[];

  constructor(buffer: Buffer) {
    this.buffer = buffer;
    this.headers = this.parseHeader();
    if (this.headers.length < this.buffer.byteLength) {
      this.buffer = this.buffer.slice(0, this.headers.length);
    }
  }

  shpFunctions(sourceProjection: string, targetProjection: string): void {
    let num = this.headers.shpCode;
    if (num > 20) {
      num -= 20;
    }
    if (!(num in shpFuncObj)) {
      throw new Error("Unknown shp type");
    }
    switch (num) {
      case shpFuncObj.parseMultiPoint:
        this.parseFunc = this.parseMultiPoint;
        break;
      case shpFuncObj.parsePoint:
        this.parseFunc = this.parsePoint;
        break;
      case shpFuncObj.parsePolygon:
        this.parseFunc = this.parsePolygon;
        break;
      case shpFuncObj.parsePolyline:
        this.parseFunc = this.parsePolyline;
        break;
      case shpFuncObj.parseZMultiPoint:
        this.parseFunc = this.parseZMultiPoint;
        break;
      case shpFuncObj.parseZPoint:
        this.parseFunc = this.parseZPoint;
        break;
      case shpFuncObj.parseZPolygon:
        this.parseFunc = this.parseZPolygon;
        break;
      case shpFuncObj.parseZPolyline:
        this.parseFunc = this.parseZPolyline;
        break;
    }
    this.parseCoord = makeParseCoord(sourceProjection, targetProjection);
  }

  parseHeader(): {
    length: number;
    version: number;
    shpCode: shpFuncObj;
    bbox: number[];
  } {
    const view = this.buffer.slice(0, 100);
    return {
      length: view.readInt32BE(6 << 2) << 1,
      version: view.readInt32LE(7 << 2),
      shpCode: view.readInt32LE(8 << 2),
      bbox: [
        view.readDoubleLE(9 << 2),
        view.readDoubleLE(11 << 2),
        view.readDoubleLE(13 << 2),
        view.readDoubleLE(13 << 2)
      ]
    };
  }

  getRows(): Geometry[] {
    let offset = 100;
    const len = this.buffer.byteLength;
    const out: Geometry[] = [];
    let current: Row | undefined;
    while (offset < len) {
      current = this.getRow(offset);
      if (!current) {
        break;
      }
      offset += 8;
      offset += current.len;
      if (current.type) {
        out.push(this.parseFunc(current.data!));
      } else {
        out.push(null as unknown as Geometry);
      }
    }
    return out;
  }

  getRow(offset: number): Row {
    const view = this.buffer.slice(offset, offset + 12);
    const len = view.readInt32BE(4) << 1;
    const id = view.readInt32BE(0);
    if (len === 0) {
      return {
        id: id,
        len: len,
        type: 0
      };
    }
    return {
      id: id,
      len: len,
      data: this.buffer.slice(offset + 12, offset + len + 8),
      type: view.readInt32LE(8)
    };
  }

  parsePoint(data: Buffer): Point {
    return {
      type: "Point",
      coordinates: this.parseCoord(data, 0)
    };
  }

  parseZPoint(data: Buffer): Point {
    const pointXY = this.parsePoint(data);
    pointXY.coordinates.push(data.readDoubleLE(16));
    return pointXY;
  }

  parsePointArray(data: Buffer, offset: number, num: number): number[][] {
    const out: number[][] = [];
    let done = 0;
    while (done < num) {
      out.push(this.parseCoord(data, offset));
      offset += 16;
      done++;
    }
    return out;
  }

  parseZPointArray(
    data: Buffer,
    zOffset: number,
    num: number,
    coordinates: number[][]
  ): number[][] {
    let i = 0;
    while (i < num) {
      coordinates[i].push(data.readDoubleLE(zOffset));
      i++;
      zOffset += 8;
    }
    return coordinates;
  }

  parseArrayGroup(
    data: Buffer,
    offset: number,
    partOffset: number,
    num: number,
    tot: number
  ): number[][][] {
    const out: number[][][] = [];
    let done = 0;
    let curNum: number;
    let nextNum = 0;
    let pointNumber: number;
    while (done < num) {
      done++;
      partOffset += 4;
      curNum = nextNum;
      if (done === num) {
        nextNum = tot;
      } else {
        nextNum = data.readInt32LE(partOffset);
      }
      pointNumber = nextNum - curNum;
      if (!pointNumber) {
        continue;
      }
      out.push(this.parsePointArray(data, offset, pointNumber));
      offset += pointNumber << 4;
    }
    return out;
  }

  parseZArrayGroup(
    data: Buffer,
    zOffset: number,
    num: number,
    coordinates: number[][][]
  ): number[][][] {
    let i = 0;
    while (i < num) {
      coordinates[i] = this.parseZPointArray(
        data,
        zOffset,
        coordinates[i].length,
        coordinates[i]
      );
      zOffset += coordinates[i].length << 3;
      i++;
    }
    return coordinates;
  }

  parseMultiPoint(data: Buffer): Point | MultiPoint {
    const mins = this.parseCoord(data, 0);
    const maxs = this.parseCoord(data, 16);
    const num = data.readInt32LE(32);
    const offset = 36;
    if (num === 1) {
      return {
        type: "Point",
        bbox: [mins[0], mins[1], maxs[0], maxs[1]],
        coordinates: this.parseCoord(data, offset)
      };
    }

    return {
      type: "MultiPoint",
      coordinates: this.parsePointArray(data, offset, num),
      bbox: [mins[0], mins[1], maxs[0], maxs[1]]
    };
  }

  parseZMultiPoint(data: Buffer): Point | MultiPoint {
    const geoJson = this.parseMultiPoint(data);
    let num: number;
    if (geoJson.type === "Point") {
      geoJson.coordinates.push(data.readDoubleLE(72));
      return geoJson;
    } else {
      num = geoJson.coordinates.length;
    }
    const zOffset = 52 + (num << 4);
    geoJson.coordinates = this.parseZPointArray(
      data,
      zOffset,
      num,
      geoJson.coordinates
    );
    return geoJson;
  }

  parsePolygon(data: Buffer): Polygon | MultiPolygon {
    const mins = this.parseCoord(data, 0);
    const maxs = this.parseCoord(data, 16);
    const num = data.readInt32LE(32);
    const tot = data.readInt32LE(36);
    const partOffset = 40;
    const offset = partOffset + (num << 2);
    const coordinates = this.parseArrayGroup(
      data,
      offset,
      partOffset,
      num,
      tot
    );
    if (coordinates.length === 1) {
      return {
        type: "Polygon",
        coordinates,
        bbox: [mins[0], mins[1], maxs[0], maxs[1]]
      };
    }
    const polyReduceResult: Position[][][] = [];
    for (const ring of coordinates) {
      polyReduce(polyReduceResult, ring);
    }
    return {
      type: "MultiPolygon",
      coordinates: polyReduceResult,
      bbox: [mins[0], mins[1], maxs[0], maxs[1]]
    };
  }

  parseZPolygon(data: Buffer): Polygon | MultiPolygon {
    const geoJson = this.parsePolygon(data);
    const zOffset = 52 + (data.readInt32LE(36) << 4);
    if (geoJson.type === "Polygon") {
      geoJson.coordinates = this.parseZArrayGroup(
        data,
        zOffset,
        geoJson.coordinates.length,
        geoJson.coordinates
      );
    } else {
      geoJson.coordinates = geoJson.coordinates.map((poly) =>
        this.parseZArrayGroup(data, zOffset, poly.length, poly)
      );
    }
    return geoJson;
  }

  parsePolyline(data: Buffer): LineString | MultiLineString {
    const mins = this.parseCoord(data, 0);
    const maxs = this.parseCoord(data, 16);
    const num = data.readInt32LE(32);
    const tot = data.readInt32LE(36);
    const partOffset = 40;
    const offset = partOffset + (num << 2);
    const coordinates = this.parseArrayGroup(
      data,
      offset,
      partOffset,
      num,
      tot
    );
    if (coordinates.length === 1) {
      return {
        type: "LineString",
        coordinates: coordinates[0],
        bbox: [mins[0], mins[1], maxs[0], maxs[1]]
      };
    }
    return {
      type: "MultiLineString",
      coordinates: coordinates,
      bbox: [mins[0], mins[1], maxs[0], maxs[1]]
    };
  }

  parseZPolyline(data: Buffer): LineString | MultiLineString {
    const geoJson = this.parsePolyline(data);
    const num = geoJson.type === "LineString" ? 1 : geoJson.coordinates.length;
    const zOffset = 52 + (data.readInt32LE(36) << 4);
    if (geoJson.type === "LineString") {
      geoJson.coordinates = this.parseZPointArray(
        data,
        zOffset,
        geoJson.coordinates.length,
        geoJson.coordinates
      );
    } else {
      geoJson.coordinates = this.parseZArrayGroup(
        data,
        zOffset,
        num,
        geoJson.coordinates
      );
    }
    return geoJson;
  }
}

export { ParseShp };
