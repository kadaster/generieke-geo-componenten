import { StyleLike } from "ol/style/Style";
import { Fill, Style } from "ol/style";
import Stroke from "ol/style/Stroke";
import CircleStyle from "ol/style/Circle";
import { FeatureLike } from "ol/Feature";
import { Geometry, LineString, MultiPoint } from "ol/geom";
import Polygon from "ol/geom/Polygon";
import { getCoordinatesOfGeometry } from "./center-coordinate-utils";

const modifyBlue = "#0adcf8";
const modifyWhite = "#ffffff";

export const defaultHighlightStyle: StyleLike = [
  // Dikke witte lijn
  new Style({
    stroke: new Stroke({ color: modifyWhite, width: 5 })
  }),
  // Dunne blauwe lijn
  new Style({
    stroke: new Stroke({ color: modifyBlue, width: 3 })
  }),
  // Bolletjes op elk punt van de lijn
  new Style({
    image: new CircleStyle({
      radius: 5,
      fill: new Fill({ color: modifyWhite }),
      stroke: new Stroke({ color: modifyBlue, width: 2 })
    }),
    geometry: (feature: FeatureLike): Geometry => {
      const geom = feature.getGeometry();

      if (geom instanceof LineString || geom instanceof Polygon) {
        return new MultiPoint(getCoordinatesOfGeometry(geom));
      }

      return null as any;
    }
  })
];

export const defaultSelectedPointStyle: Style = new Style({
  image: new CircleStyle({
    radius: 6,
    fill: new Fill({ color: modifyBlue }),
    stroke: new Stroke({ color: modifyWhite, width: 2 })
  })
});
