import { Coordinate } from "ol/coordinate";
import Feature from "ol/Feature";
import { Geometry, Point } from "ol/geom";
import LineString from "ol/geom/LineString";
import Polygon from "ol/geom/Polygon";
import RenderFeature from "ol/render/Feature";
import { Icon, Text } from "ol/style";
import Fill from "ol/style/Fill";
import Style, {
  createDefaultStyle,
  createEditingStyle,
  StyleFunction,
  StyleLike
} from "ol/style/Style";

const white = [255, 255, 255, 1];
const svgColorWhite = "#fff";
const svgColorGrey = "#666666";

export const labelTextStyle = new Text({
  fill: new Fill({
    color: white
  }),
  padding: [5, 6, 5, 5], // [top, right, bottom, left]
  offsetY: -25
});

export const segmentLabelTextStyle = new Text({
  fill: new Fill({
    color: svgColorGrey
  }),
  padding: [5, 6, 5, 5], // [top, right, bottom, left]
  offsetY: -25
});

export const labelImageStyle: Icon = new Icon({
  src: URL.createObjectURL(
    new Blob([getLabelSvg(svgColorGrey, svgColorGrey)], {
      type: "image/svg+xml"
    })
  )
});

export const crossHairImageStyle: StyleLike = new Style({
  image: new Icon({
    src: URL.createObjectURL(
      new Blob([getCrosshairSvg()], {
        type: "image/svg+xml"
      })
    )
  })
});

export const segmentLabelImageStyle: Icon = new Icon({
  src: URL.createObjectURL(
    new Blob([getLabelSvg(svgColorWhite, svgColorGrey)], {
      type: "image/svg+xml"
    })
  )
});

export const segmentLengthStyle = new Style({
  text: segmentLabelTextStyle.clone(),
  image: segmentLabelImageStyle.clone()
});

export const lengthStyle = new Style({
  text: labelTextStyle.clone(),
  image: labelImageStyle.clone()
});

export const areaStyle = new Style({
  text: labelTextStyle.clone(),
  image: labelImageStyle.clone()
});

export const styleLabelFunction = (
  feature: Feature<Geometry> | RenderFeature,
  measureStyle: Style,
  areaM2ToTextFunction?: (area: number) => string
): Style => {
  const point: Point =
    feature.getGeometry()?.getType() === "Polygon"
      ? new Point(
          (feature.getGeometry() as Polygon).getInteriorPoint().getCoordinates()
        )
      : new Point((feature.getGeometry() as LineString).getLastCoordinate());
  let labelText;
  if (areaM2ToTextFunction && feature.getGeometry() instanceof Polygon) {
    labelText = areaM2ToTextFunction!(
      (feature.getGeometry() as Polygon).getArea()
    );
  } else {
    labelText = calculateAreaOrLength(feature);
  }
  const style = measureStyle.clone();
  style.getText()?.setText(labelText);
  style.setGeometry(point);
  return style;
};

export const styleLengthLabelFunction = (
  feature: Feature<Geometry> | RenderFeature,
  measureStyle: Style
): Style => {
  const geom: LineString | Polygon = feature.getGeometry() as
    | LineString
    | Polygon;
  let coord: Coordinate = geom.getLastCoordinate();
  let labelText: string;
  if (geom.getType() === "Polygon") {
    let length = 0;
    const coords = (geom as Polygon).getCoordinates()[0];
    coord = coords.reduce((previousValue: number[], currentValue: number[]) => {
      if (previousValue) {
        const line = new LineString([previousValue, currentValue]);
        length += line.getLength();
      }
      return currentValue;
    }, coords[0]);
    if (coords.length > 1) {
      coord = coords[coords.length - 2];
    }
    labelText = lengthToString(length);
  } else {
    labelText = calculateLength(geom as LineString);
  }

  const point: Point = new Point(coord);
  const style = measureStyle.clone();
  style.getText()?.setText(labelText);
  style.setGeometry(point);

  return style;
};

export const styleAreaLabelFunction = (
  feature: Feature<Geometry> | RenderFeature,
  measureStyle: Style,
  areaM2ToTextFunction?: (area: number) => string
): Style => {
  const point: Point = new Point([0, 0]);
  let labelText = "";
  if (feature.getGeometry()?.getType() === "Polygon") {
    const poly = feature.getGeometry() as Polygon;
    point.setCoordinates(poly.getInteriorPoint().getCoordinates());
    labelText = areaM2ToTextFunction
      ? areaM2ToTextFunction!(poly.getArea())
      : calculateArea(poly);
  } else {
    point.setCoordinates(
      (feature.getGeometry() as LineString).getLastCoordinate()
    );
  }
  const style = measureStyle.clone();
  style.getText()?.setText(labelText);
  style.setGeometry(point);

  return style;
};

export const measuringStyleFunction: StyleFunction = (
  feature: Feature<Geometry> | RenderFeature
): void | Style | Style[] => {
  const defaultStyles = createEditingStyle();
  return defaultStyles[(feature.getGeometry() as Geometry).getType()];
};

export const finishedStyleFunction: StyleFunction = (
  feature: Feature<Geometry> | RenderFeature,
  resolution: number
): void | Style | Style[] => {
  return createDefaultStyle(feature, resolution);
};

export const styleSegmentLabelFunction = (
  feature: Feature<Geometry> | RenderFeature,
  segmentStyle: Style
): Style[] => {
  const geom = feature.getGeometry();
  const labels: Style[] = [];
  if (geom instanceof LineString) {
    geom.forEachSegment((start, end) => {
      labels.push(getSegmentLabel(start, end, segmentStyle));
    });
  } else if (geom instanceof Polygon) {
    geom
      .getCoordinates()[0]
      .forEach((current: number[], index: number, array: number[][]) => {
        if (index > 0) {
          labels.push(getSegmentLabel(array[index - 1], current, segmentStyle));
        }
      });
  }
  return labels;
};

export function calculateAreaOrLength(
  feature: Feature<Geometry> | RenderFeature
): string {
  const drawingGeometry = feature.getGeometry();
  if (drawingGeometry instanceof LineString) {
    return calculateLength(drawingGeometry);
  } else if (drawingGeometry instanceof Polygon) {
    return calculateArea(drawingGeometry);
  }
  return "";
}

export function calculateArea(drawingGeometry: Polygon): string {
  const area = drawingGeometry.getArea();
  let areaText: string;
  if (area > 10000) {
    areaText = `${Math.round((area / 1000000) * 100) / 100} km2`;
  } else {
    areaText = `${Math.round(area * 100) / 100} m2`;
  }
  return areaText;
}

export function calculateLength(drawingGeometry: LineString): string {
  return lengthToString(drawingGeometry.getLength());
}

function getLabelSvg(fillColor: string, strokeColor: string | null): string {
  return `<svg width="80" height="75" xmlns="http://www.w3.org/2000/svg">
        <rect opacity="0.9" rx="5" id="svg_1" height="21.25" width="78" y="0" x="1" stroke="${strokeColor}" stroke-width="1" fill="${fillColor}"/>
        <path opacity="0.9" transform="rotate(-180, 40, 27.332)" id="svg_5"
          d="m33.12426,33.08272l6.87567,-11.50139l6.87567,11.50139l-13.75134,0z" fill-opacity="null" stroke-opacity="null"
          stroke-width="1" stroke="${strokeColor}" fill="${fillColor}"/>
       </svg>`;
}

function getSegmentLabel(
  start: number[],
  end: number[],
  segmentStyle: Style
): Style {
  const segment = new LineString([start, end]);
  const style = segmentStyle.clone();

  style.getText()?.setText(calculateLength(segment));
  style.setGeometry(new Point(segment.getFlatMidpoint()));
  return style;
}

function lengthToString(length = 0): string {
  let lengthText: string;
  if (length > 1000) {
    lengthText = `${Math.round((length / 1000) * 100) / 100} km`;
  } else {
    lengthText = `${Math.round(length * 100) / 100} m`;
  }
  return lengthText;
}

function getCrosshairSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="75" height="75" viewBox="-643.33 -643.33 300 300"><rect width="100%" height="100%" fill="transparent"/><path stroke-linecap="round" d="M50 92.875C26.358 92.875 7.125 73.642 7.125 50S26.358 7.125 50 7.125 92.875 26.358 92.875 50 73.642 92.875 50 92.875zm0-83.75C27.461 9.125 9.125 27.461 9.125 50c0 22.538 18.336 40.875 40.875 40.875 22.538 0 40.875-18.337 40.875-40.875C90.875 27.461 72.538 9.125 50 9.125z" style="stroke:#000;stroke-width:1.75;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#656565;fill-rule:nonzero;opacity:1" transform="matrix(1.48 0 0 1.48 -569.13 -566.6)" vector-effect="non-scaling-stroke"/><path d="M94.75 50c0 6.213-5.236 11.25-11.696 11.25H16.946C10.486 61.25 5.25 56.213 5.25 50s5.236-11.25 11.696-11.25h66.107c6.461 0 11.697 5.037 11.697 11.25z" style="stroke:#000;stroke-width:0;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#000;fill-rule:nonzero;opacity:1" transform="matrix(.65 0 0 .44 -465.34 -513.59)" vector-effect="non-scaling-stroke"/><path d="M94.75 50c0 6.213-5.236 11.25-11.696 11.25H16.946C10.486 61.25 5.25 56.213 5.25 50s5.236-11.25 11.696-11.25h66.107c6.461 0 11.697 5.037 11.697 11.25z" style="stroke:#000;stroke-width:0;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#000;fill-rule:nonzero;opacity:1" transform="matrix(.65 0 0 .44 -589.66 -513.59)" vector-effect="non-scaling-stroke"/><path d="M94.75 50c0 6.213-5.236 11.25-11.696 11.25H16.946C10.486 61.25 5.25 56.213 5.25 50s5.236-11.25 11.696-11.25h66.107c6.461 0 11.697 5.037 11.697 11.25z" style="stroke:#000;stroke-width:0;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#000;fill-rule:nonzero;opacity:1" transform="matrix(0 .65 -.44 0 -473.14 -585.61)" vector-effect="non-scaling-stroke"/><path d="M94.75 50c0 6.213-5.236 11.25-11.696 11.25H16.946C10.486 61.25 5.25 56.213 5.25 50s5.236-11.25 11.696-11.25h66.107c6.461 0 11.697 5.037 11.697 11.25z" style="stroke:#000;stroke-width:0;stroke-dasharray:none;stroke-linecap:butt;stroke-dashoffset:0;stroke-linejoin:miter;stroke-miterlimit:4;fill:#000;fill-rule:nonzero;opacity:1" transform="matrix(0 .65 -.44 0 -473.14 -462.21)" vector-effect="non-scaling-stroke"/></svg>`;
}
