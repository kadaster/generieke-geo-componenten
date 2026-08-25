import { Injectable } from "@angular/core";
import { fromGeoJSONFeatures } from "@kadaster/ggc-map";
import { FeatureCollection } from "geojson";
import Feature from "ol/Feature";
import { GeoJSON } from "ol/format";
import GML3 from "ol/format/GML3";
import GML32 from "ol/format/GML32";
import { Geometry } from "ol/geom";

export interface ExtendedGeoJson extends FeatureCollection {
  crs?: {
    type: string;
    properties: {
      name: string;
    };
  };
}

@Injectable({
  providedIn: "root"
})
export class GgcConversionService {
  async convertToFeatures(
    file: File,
    shapefileProjection = "EPSG:28992"
  ): Promise<Feature<Geometry>[]> {
    if (file.name.endsWith(".gml")) {
      return this.convertGmlToFeatures(file);
    } else if (file.name.endsWith(".geojson") || file.name.endsWith(".json")) {
      return this.convertGeoJsonToFeatures(file);
    } else if (file.name.endsWith(".zip")) {
      return this.convertShapefileToFeatures(file, shapefileProjection);
    } else {
      throw new Error(
        "Invalid file type. Only .zip (shapefile), .gml and .geojson files are supported"
      );
    }
  }

  convertFeaturesToGeoJson(
    features: Feature<Geometry>[],
    filename: string
  ): File {
    return new File(
      [this.convertFeaturesToGeoJsonAsString(features)],
      filename,
      {
        type: "text/plain"
      }
    );
  }

  convertFeaturesToGeoJsonAsString(features: Feature<Geometry>[]): string {
    const geoJson = new GeoJSON().writeFeaturesObject(features, {
      dataProjection: "EPSG:28992",
      featureProjection: "EPSG:28992"
    });
    const extendedGeojson: ExtendedGeoJson = geoJson;
    extendedGeojson.crs = {
      type: "name",
      properties: {
        name: "urn:ogc:def:crs:EPSG::28992"
      }
    };
    return JSON.stringify(extendedGeojson, null, 2);
  }

  convertFeaturesToGML(features: Feature<Geometry>[], filename: string) {
    return new File([this.convertFeaturesToGMLAsString(features)], filename, {
      type: "text/xml"
    });
  }

  convertFeaturesToGMLAsString(features: Feature<Geometry>[]): string {
    // The basic GML32 converter (writeFeatures) does not create a usable GML File,
    // so we use the writeFeaturesNode, and process it in our own XML file
    const gml = new GML32({
      featureNS: "https://www.kadaster.nl",
      featureType: "feature",
      srsName: "EPSG:28992"
    }).writeFeaturesNode(features, {
      featureProjection: "EPSG:28992"
    });
    const baseString = `<?xml version="1.0" encoding="UTF-8"?>
<gml:FeatureCollection xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                       xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:gml="http://www.opengis.net/gml/3.2"></gml:FeatureCollection>`;
    const parser = new DOMParser();
    // Create the basic .xml files
    const xml = parser.parseFromString(baseString, "text/xml");
    // Get all features from the GML32 converter
    const xmlfeatures = gml.getElementsByTagName("feature");

    // Iterate over the features, create a <gml:featureMember> wrapper tag
    // and inject the xml feature in that tag. Then add the wrapper tag to our output document.
    Array.from(xmlfeatures).forEach((f) => {
      const featureMember = xml.createElement("gml:featureMember");
      featureMember.appendChild(f);
      xml.querySelector("FeatureCollection")!.appendChild(featureMember);
    });

    const serializer = new XMLSerializer();
    return serializer.serializeToString(xml);
  }

  private async convertGmlToFeatures(file: File): Promise<Feature<Geometry>[]> {
    const content = await file.text();
    return this.convertGmlStringToFeatures(content);
  }

  convertGmlStringToFeatures(gmlString: string): Feature<Geometry>[] {
    const xml = new DOMParser().parseFromString(gmlString, "application/xml");
    const gmlVersion = xml.lookupNamespaceURI("gml") || "";
    console.log(xml);
    const content = this.fixNamespaces(xml);
    console.log(content);
    const options = {
      srsName: "EPSG:28992",
      multiSurface: false
    };
    const format = gmlVersion.endsWith("3.2")
      ? new GML32(options)
      : new GML3(options);

    return format.readFeatures(content, { featureProjection: "EPSG:28992" });
  }

  private async convertGeoJsonToFeatures(
    file: File
  ): Promise<Feature<Geometry>[]> {
    const json = await file.text();
    return this.convertGeoJsonStringToFeatures(json);
  }

  convertGeoJsonStringToFeatures(geoJsonString: string): Feature<Geometry>[] {
    return new GeoJSON().readFeatures(geoJsonString, {
      featureProjection: "EPSG:28992"
    });
  }

  private async convertShapefileToFeatures(
    file: File,
    sourceProjection: string
  ): Promise<Feature<Geometry>[]> {
    const buffer = await file.arrayBuffer();
    const { shp } = await import("./shp");
    const features = await shp(buffer, [], sourceProjection, "EPSG:28992");
    let featureArray: Feature<Geometry>[] = [];
    if (Array.isArray(features)) {
      features.forEach((f) => {
        featureArray = [
          ...featureArray,
          ...fromGeoJSONFeatures(f, "EPSG:28992")
        ];
      });
    } else {
      return fromGeoJSONFeatures(features, "EPSG:28992");
    }
    return featureArray;
  }

  private fixNamespaces(xml: Document): string {
    // These tags are prefixed with the wrong namespace by QGis, we will correct them to the gml namespace
    const invalidTags = "featureMember,geometryProperty";

    // Can't use querySelectorAll / foreach since we're changing the DOM while traversing
    while (xml.querySelector(invalidTags)) {
      console.log("invalid tags");
      const tag = xml.querySelector(invalidTags) as Element;

      // Remove incorrect namespace and add gml:, then create a new node with the correct namespace
      let tagName: string = tag.nodeName.split(":").pop() || tag.nodeName;
      tagName = `gml:${tagName}`;
      const clone = xml.createElement(tagName);

      // Get all attributes from the source tag and add it to the clone
      tag.getAttributeNames().forEach((attr) => {
        clone.setAttribute(attr, tag.getAttribute(attr) as string);
      });

      // Add all content from the source tag
      clone.innerHTML = tag.innerHTML;

      // Insert clone to the DOM and remove original source tag
      (tag.parentNode as Node).insertBefore(clone, tag);
      tag.remove();
    }

    // Write updated XML to the content
    return new XMLSerializer().serializeToString(xml);
  }
}
