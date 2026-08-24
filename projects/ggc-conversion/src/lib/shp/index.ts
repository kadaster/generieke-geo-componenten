import { Buffer } from "buffer";
import { FeatureCollection, Geometry } from "geojson";
import { LRUCache } from "lru-cache";
import parseDBF from "./parseDbf"; // @ts-ignore
import proj4 from "proj4";
import binaryAjax from "./binaryAjax";
import { ParseShp as parseShpLib } from "./parseShp";
import unzip from "./unzip";
import { defs } from "@kadaster/ggc-models";
import { register } from "ol/proj/proj4";

proj4.defs("EPSG:28992", defs);
register(proj4);

const cache = new LRUCache<string, FeatureCollection | FeatureCollection[]>({
  max: 20
});

function shp(
  base: string | ArrayBuffer,
  whiteList: string[],
  sourceProjection = "EPSG:28992",
  targetProjection = "EPSG:28992"
): Promise<FeatureCollection | FeatureCollection[]> {
  if (typeof base === "string" && cache.has(base)) {
    return Promise.resolve(cache.get(base)!);
  }
  return getShapefile(base, sourceProjection, targetProjection, whiteList).then(
    function (resp) {
      if (typeof base === "string") {
        cache.set(base, resp);
      }
      return resp;
    }
  );
}

interface Dbf {
  [x: string]: any;
}

const combine = ([shp, dbf]: [Geometry[], Dbf]): FeatureCollection => {
  const out: FeatureCollection = {
    type: "FeatureCollection",
    features: []
  };
  let i = 0;
  const len = shp.length;
  if (!dbf) {
    dbf = [];
  }

  while (i < len) {
    out.features.push({
      type: "Feature",
      geometry: shp[i],
      properties: dbf[i] || {}
    });
    i++;
  }
  return out;
};

const parseZip = async (
  buffer: ArrayBuffer,
  sourceProjection: string,
  targetProjection: string,
  whiteList?: string[]
): Promise<FeatureCollection | FeatureCollection[]> => {
  let key: string;
  const zip: Record<string, string | Buffer> = await unzip(buffer);
  const names: string[] = [];
  whiteList = whiteList || [];
  for (key in zip) {
    if (key.indexOf("__MACOSX") !== -1) {
      continue;
    }
    if (key.slice(-3).toLowerCase() === "shp") {
      names.push(key.slice(0, -4));
      zip[key.slice(0, -3) + key.slice(-3).toLowerCase()] = zip[key];
      // het is lastig om de EPSG uit de prj file te halen
      /*    } else if (key.slice(-3).toLowerCase() === "prj") {
      zip[key.slice(0, -3) + key.slice(-3).toLowerCase()] = proj4(
        zip[key] as string
      );*/
    } else if (
      key.slice(-4).toLowerCase() === "json" ||
      whiteList.includes(key.split(".").pop() as string)
    ) {
      names.push(key.slice(0, -3) + key.slice(-3).toLowerCase());
    } else if (
      key.slice(-3).toLowerCase() === "dbf" ||
      key.slice(-3).toLowerCase() === "cpg"
    ) {
      zip[key.slice(0, -3) + key.slice(-3).toLowerCase()] = zip[key];
    }
  }
  if (!names.length) {
    throw new Error("no layers found");
  }
  const geoJsons: FeatureCollection[] = names.map((name: string) => {
    let dbf: Dbf | undefined;
    if (zip[name + ".dbf"]) {
      const buffer = zip[name + ".dbf"] as Buffer;
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );
      const dataView = new DataView(arrayBuffer);
      dbf = parseDBF(dataView, zip[name + ".cpg"] as string);
    }
    //we halen de sourceprojection niet uit de .prj file, deze kan wel meegegeven worden
    const shapeParser = new parseShpLib(zip[name + ".shp"] as Buffer);
    shapeParser.shpFunctions(sourceProjection, targetProjection);
    shapeParser.getRows();

    return combine([shapeParser.getRows(), dbf!]);
  });
  if (geoJsons.length === 1) {
    return geoJsons[0];
  } else {
    return geoJsons;
  }
};

async function getZip(
  base: string,
  sourceProjection: string,
  targetProjection: string,
  whiteList?: string[]
): Promise<FeatureCollection | FeatureCollection[]> {
  const a = await binaryAjax(base);
  if (a instanceof ArrayBuffer) {
    return parseZip(a, sourceProjection, targetProjection, whiteList);
  }
  throw new Error("failed to get zip");
}

const checkSuffix = (base: string, suffix: string): boolean => {
  const url = new URL(base);
  return url.pathname.slice(-4).toLowerCase() === suffix;
};

const getShapefile = async (
  base: string | ArrayBuffer,
  sourceProjection: string,
  targetProjection: string,
  whiteList?: string[]
): Promise<FeatureCollection | FeatureCollection[]> => {
  if (typeof base !== "string") {
    return parseZip(base, sourceProjection, targetProjection);
  }
  if (checkSuffix(base, ".zip")) {
    return getZip(base, sourceProjection, targetProjection, whiteList);
  }
  throw new Error("failed to get zip");
};

export { shp };
