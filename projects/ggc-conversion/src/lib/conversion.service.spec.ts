import { TestBed } from "@angular/core/testing";
import { vi, beforeAll } from "vitest";

import { Feature } from "ol";
import { Geometry, LineString, Point } from "ol/geom";
import { register } from "ol/proj/proj4";
import * as proj4x from "proj4";

import { GgcConversionService } from "./ggc-conversion.service";

const proj4 = (proj4x as any).default;
export const defs =
  "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs";

describe("ConversionService", () => {
  let service: GgcConversionService;
  const gml = `
    <?xml version="1.0" encoding="UTF-8"?>
      <gml:FeatureCollection xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:gml="http://www.opengis.net/gml/3.2">
        <gml:featureMember>
          <feature xmlns="https://www.kadaster.nl">
            <geometry>
              <gml:Point srsName="EPSG:28992">
                <gml:pos srsDimension="2">42 3</gml:pos>
              </gml:Point>
            </geometry>
            <someProperty>boink</someProperty>
          </feature>
        </gml:featureMember>
        <gml:featureMember>
          <feature xmlns="https://www.kadaster.nl">
            <geometry>
              <gml:LineString srsName="EPSG:28992">
              <gml:posList srsDimension="2">123 456 234 567</gml:posList>
            </gml:LineString></geometry>
            <someOtherProperty>boink</someOtherProperty>
          </feature>
        </gml:featureMember>
      </gml:FeatureCollection>`;
  const geoJson =
    '{"type": "FeatureCollection", "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::28992" } }, "features": [ {"type": "Feature", "geometry": { "type": "Point", "coordinates": [ 42, 3 ] }, "properties": { "someProperty": "boink" }}]}';

  beforeAll(() => {
    proj4.defs("EPSG:28992", defs);
    register(proj4);
  });

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [GgcConversionService] });
    service = TestBed.inject(GgcConversionService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
  it("should change the namespace of certain tags to the gml namespace", () => {
    const xmlFile = `<?xml version="1.0" encoding="utf-8" ?>
<ogr:FeatureCollection
     gml:id="aFeatureCollection"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:schemaLocation="http://ogr.maptools.org/ test-nop3.xsd"
     xmlns:ogr="http://ogr.maptools.org/"
     xmlns:gml="http://www.opengis.net/gml/3.2">

  <ogr:featureMember gml:id="featureMember.geom.0.0">
    <ogr:test gml:id="test_nop3.0">
      <ogr:geometryProperty>
        <gml:MultiSurface srsName="EPSG:28992" gml:id="test_nop3.geom.0">
          <gml:surfaceMember>
            <gml:Polygon gml:id="test_nop3.geom.0.0">
              <gml:exterior>
                <gml:LinearRing>
                  <gml:posList>176656.452586075 538575.571956399</gml:posList>
                </gml:LinearRing>
              </gml:exterior>
            </gml:Polygon>
          </gml:surfaceMember>
        </gml:MultiSurface>
      </ogr:geometryProperty>
      <ogr:id>1</ogr:id>
    </ogr:test>
  </ogr:featureMember>
</ogr:FeatureCollection>`;
    const xml = new DOMParser().parseFromString(xmlFile, "application/xml");
    // jsdom matches elements by local name, so querySelector("featureMember") also
    // matches gml:featureMember – causing an infinite loop in the while loop of
    // fixNamespaces. Override querySelector on this document instance to skip elements
    // already in the gml: namespace so the loop terminates correctly.
    const originalQSA = xml.querySelectorAll.bind(xml);
    (xml as any).querySelector = (selector: string) => {
      const els = Array.from(originalQSA(selector));
      return (
        (els as Element[]).find((el) => !el.nodeName.startsWith("gml:")) ?? null
      );
    };
    const updated = service["fixNamespaces"](xml);
    const updatedXML = new DOMParser().parseFromString(
      updated,
      "application/xml"
    );
    console.log(updated);
    console.log(updatedXML.querySelector("featureMember"));
    expect(updatedXML.querySelector("featureMember")?.nodeName).toEqual(
      "gml:featureMember"
    );
    expect(
      updatedXML.querySelector("featureMember")?.getAttribute("gml:id")
    ).toEqual("featureMember.geom.0.0");
    expect(updatedXML.querySelector("geometryProperty")?.nodeName).toEqual(
      "gml:geometryProperty"
    );
  });
  const feature1: Feature<Point> = new Feature({
    geometry: new Point([42, 3])
  });
  feature1.setProperties({ someProperty: "boink" });
  const feature2: Feature<LineString> = new Feature({
    geometry: new LineString([
      [123, 456],
      [234, 567]
    ])
  });
  feature2.setProperties({ someOtherProperty: "boink" });
  const expectedFC = {
    type: "FeatureCollection",
    crs: {
      type: "name",
      properties: { name: "urn:ogc:def:crs:EPSG::28992" }
    },
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [42, 3]
        },
        properties: { someProperty: "boink" }
      }
    ]
  };
  it("should convert an array of features to a GeoJSON file", async () => {
    const file = service.convertFeaturesToGeoJson(
      [feature1],
      "my-filename.geojson"
    );
    expect(file.name).toEqual("my-filename.geojson");
    const text = await file.text();
    const convertedFeature = JSON.parse(text);
    const expectation = expectedFC;
    expect(convertedFeature).toEqual(expectation);
  });
  it("should convert an array of features to a JSON file", async () => {
    const file = service.convertFeaturesToGeoJson(
      [feature1],
      "my-filename.json"
    );
    expect(file.name).toEqual("my-filename.json");
    const text = await file.text();
    const convertedFeature = JSON.parse(text);
    const expectation = expectedFC;
    expect(convertedFeature).toEqual(expectation);
  });
  it("should convert an array of features to a GeoJSON file", async () => {
    const result = JSON.parse(
      service.convertFeaturesToGeoJsonAsString([feature1])
    );

    expect(result).toEqual(JSON.parse(geoJson));
  });

  it("should convert an array of features to a GML", async () => {
    const gmlAsString = service.convertFeaturesToGMLAsString([
      feature1,
      feature2
    ]);
    // Remove newlines from expectation, added for readability
    expect(gmlAsString).toEqual(gml.replaceAll(/\n\s+/g, ""));
  });

  it("should convert a GML string to an Array of Features", () => {
    // fixNamespaces causes an infinite loop in jsdom because the input GML already uses
    // gml:featureMember, which jsdom's querySelector matches by local name. The input is
    // already correctly namespaced so mocking fixNamespaces as a no-op is correct here.
    vi.spyOn(service as any, "fixNamespaces").mockImplementation(
      (doc: unknown) => new XMLSerializer().serializeToString(doc as Document)
    );

    const replacedGmlString = gml.replaceAll(/\n\s+/g, "");

    const features: Feature<Geometry>[] =
      service.convertGmlStringToFeatures(replacedGmlString);

    expect(features.length).toBe(2);
    expect(features[0].getGeometry()?.getType()).toBe("Point");
    expect(features[0].get("someProperty")).toBe("boink");
    expect(features[1].getGeometry()?.getType()).toBe("LineString");
    expect(features[1].get("someOtherProperty")).toBe("boink");
  });

  it("should convert a GeoJSON string to an Array of Features", () => {
    const features: Feature<Geometry>[] =
      service.convertGeoJsonStringToFeatures(geoJson);

    expect(features.length).toBe(1);

    const geometry = features[0].getGeometry();
    expect(geometry?.getType()).toBe("Point");
    expect(features[0].get("someProperty")).toBe("boink");
  });

  describe("should choose the correct convert method", () => {
    it("choose GML", async () => {
      const convertSpy = vi
        .spyOn(service as any, "convertGmlToFeatures")
        .mockResolvedValue([]);
      const file = new File([{}] as BlobPart[], "bla.gml");

      await service.convertToFeatures(file);

      expect(convertSpy).toHaveBeenCalled();
    });

    it("choose GeoJSON", async () => {
      const convertSpy = vi
        .spyOn(service as any, "convertGeoJsonToFeatures")
        .mockResolvedValue([]);
      const file = new File([{}] as BlobPart[], "bla.geojson");

      await service.convertToFeatures(file);

      expect(convertSpy).toHaveBeenCalled();
    });

    it("choose Shapefile", async () => {
      const convertSpy = vi
        .spyOn(service as any, "convertShapefileToFeatures")
        .mockResolvedValue([]);
      const file = new File([{}] as BlobPart[], "bla.zip");

      await service.convertToFeatures(file);

      expect(convertSpy).toHaveBeenCalled();
    });
  });
});
