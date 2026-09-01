import { MapfishStyleV2 } from "../../model/print-request/mapfish-style-v2";

export const basicMeasureStyle: MapfishStyleV2 = {
  version: "2",
  olBlue: "#3399cc",
  olHaloBlue: "#123456",
  olHaloGrey: "#666666",
  wit: "#ffffff",
  "[type = 'Point' AND areaOrLength = '']": {
    symbolizers: [
      {
        type: "point",
        strokeColor: "${olBlue}",
        fillColor: "${wit}",
        fillOpacity: "0.01",
        pointRadius: 5,
        strokeWidth: 2
      }
    ]
  },
  "[type = 'Point' AND areaOrLength <> '']": {
    symbolizers: [
      {
        type: "text",
        fontColor: "${wit}",
        fontFamily: "sans-serif",
        fontSize: "12px",
        fontStyle: "normal",
        fontWeight: "bold",
        haloColor: "${olHaloGrey}",
        haloOpacity: "1",
        haloRadius: "3.0",
        label: "[areaOrLength]",
        labelAlign: "ct",
        labelYOffset: "15.0"
      }
    ]
  },
  "[type = 'LineString']": {
    symbolizers: [
      {
        strokeWidth: 2,
        type: "line",
        strokeColor: "${olBlue}",
        fillColor: "${wit}",
        fillOpacity: "0.01"
      }
    ]
  },
  "[type = 'Polygon']": {
    symbolizers: [
      {
        type: "polygon",
        strokeColor: "${olBlue}",
        fillColor: "${wit}",
        fillOpacity: "0.01",
        strokeWidth: 2
      }
    ]
  }
};

// basicGeojsonStyle bevat filters op basis van geometry type.
// Dit is nodig omdat alle symbolizers worden toegepast, bijvoorbeeld bij het printen van
// polygonen zullen ook de line en point symbolizers worden toegepast. Zie TMS-9947.
// Het filter op basis van geometry type werkt wel, maar is niet gedocumenteerd. Zie
// https://mapfish.github.io/mapfish-print-doc/styles.html en
// https://docs.geoserver.org/stable/en/user/filter/ecql_reference.html#ecql-expr.
export const basicGeojsonStyle: MapfishStyleV2 = {
  version: "2",
  olBlue: "#3399cc",
  wit: "#ffffff",
  "[GeometryType(geometry)='Point'] OR [GeometryType(geometry)='MultiPoint']": {
    symbolizers: [
      {
        type: "point",
        strokeColor: "${olBlue}",
        fillColor: "${wit}",
        fillOpacity: "0.01",
        pointRadius: 5,
        strokeWidth: 2
      }
    ]
  },
  "[GeometryType(geometry)='LineString'] OR [GeometryType(geometry)='MultiLineString']":
    {
      symbolizers: [
        {
          type: "line",
          strokeColor: "${olBlue}",
          fillColor: "${wit}",
          fillOpacity: "0.01",
          strokeWidth: 2
        }
      ]
    },
  "[GeometryType(geometry)='Polygon'] OR [GeometryType(geometry)='MultiPolygon']":
    {
      symbolizers: [
        {
          type: "polygon",
          strokeColor: "${olBlue}",
          fillColor: "${wit}",
          fillOpacity: "0.01",
          strokeWidth: 2
        }
      ]
    }
};
