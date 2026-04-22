import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import { Type } from "ol/geom/Geometry";
import RenderFeature from "ol/render/Feature";
import { Circle } from "ol/style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style, { StyleFunction } from "ol/style/Style";

export const customFinishDrawStyle: StyleFunction = (
  feature: Feature<Geometry> | RenderFeature
): Style | Style[] | void => {
  const width = 1;
  const styles: Map<Type, Style[] | undefined> = new Map();

  styles.set("Polygon", [
    new Style({
      fill: new Fill({
        color: [200, 200, 200, 0.5],
      }),
    }),
    new Style({
      stroke: new Stroke({
        color: "#424447",
        width,
      }),
    }),
  ]);
  styles.set("MultiPolygon", styles.get("Polygon"));

  styles.set("LineString", [
    new Style({
      stroke: new Stroke({
        color: "white",
        width: width + 2,
      }),
    }),
    new Style({
      stroke: new Stroke({
        color: "green",
        width,
      }),
    }),
  ]);
  styles.set("MultiLineString", styles.get("LineString"));

  styles.set("Point", [
    new Style({
      image: new Circle({
        radius: width * 2,
        fill: new Fill({
          color: "green",
        }),
        stroke: new Stroke({
          color: "white",
          width: width / 2,
        }),
      }),
      zIndex: Infinity,
    }),
  ]);
  styles.set("MultiPoint", styles.get("Point"));
  styles.set("GeometryCollection", [
    ...(styles.get("Polygon") as Style[]),
    ...(styles.get("LineString") as Style[]),
    ...(styles.get("Point") as Style[]),
  ]);

  const fill = new Fill({
    color: "white",
  });
  const stroke = new Stroke({
    color: "blue",
    width: 1.25,
  });

  styles.set("Circle", [
    new Style({
      image: new Circle({
        fill,
        stroke,
        radius: 5,
      }),
      fill,
      stroke,
    }),
  ]);

  const type = feature.getGeometry()?.getType();
  if (type) {
    return styles.get(type);
  }
};

export const customDrawStyle: StyleFunction = (
  feature: Feature<Geometry> | RenderFeature
) => {
  const width = 3;
  const styles: Map<Type, Style[] | undefined> = new Map();

  styles.set("Polygon", [
    new Style({
      fill: new Fill({
        color: [255, 255, 255, 0.5],
      }),
    }),
    new Style({
      stroke: new Stroke({
        color: "#008296",
        width: width + 2,
      }),
    }),
  ]);
  styles.set("MultiPolygon", styles.get("Polygon"));

  styles.set("LineString", [
    new Style({
      stroke: new Stroke({
        color: "#008296",
        width: width + 2,
      }),
    }),
    new Style({
      stroke: new Stroke({
        color: "#008296",
        width,
      }),
    }),
  ]);
  styles.set("MultiLineString", styles.get("LineString"));

  styles.set("Point", [
    new Style({
      image: new Circle({
        radius: width * 2,
        fill: new Fill({
          color: "red",
        }),
        stroke: new Stroke({
          color: "white",
          width: width / 2,
        }),
      }),
      zIndex: Infinity,
    }),
  ]);
  styles.set("MultiPoint", styles.get("Point"));

  const fill = new Fill({
    color: "red",
  });
  const stroke = new Stroke({
    color: "red",
    width: 1.25,
  });

  styles.set("Circle", [
    new Style({
      image: new Circle({
        fill,
        stroke,
        radius: 5,
      }),
      fill,
      stroke,
    }),
  ]);

  const type = feature.getGeometry()?.getType();
  if (type) {
    return styles.get(type);
  }
};


const getPattern = (color: string) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    return undefined;
  }
  const SIZE = 24;
  canvas.width = SIZE;
  canvas.height = SIZE;
  context.fillStyle = `${color}22`;
  context.fillRect(0, 0, SIZE, SIZE);

  context.fillStyle = `${color}FF`;
  context.beginPath();
  context.moveTo(0.25 * SIZE, 0);
  context.lineTo(0.5 * SIZE, 0);
  context.lineTo(0, 0.5 * SIZE);
  context.lineTo(0, 0.25 * SIZE);
  context.lineTo(0.25 * SIZE, 0);
  context.fill();

  context.beginPath();
  context.moveTo(0.25 * SIZE, SIZE);
  context.lineTo(0.5 * SIZE, SIZE);
  context.lineTo(SIZE, 0.5 * SIZE);
  context.lineTo(SIZE, 0.25 * SIZE);
  context.lineTo(0.25 * SIZE, SIZE);
  context.fill();
  return context.createPattern(canvas, "repeat") || undefined;
};

