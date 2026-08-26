import { Injectable } from "@angular/core";
import { Capabilities } from "../../model/capabilities/capabilities";
import { MapAreaSizeInPixels } from "../../model/print-request/mapfish-print-properties";
import { Template } from "../../model/component/template";

@Injectable({
  providedIn: "root"
})
export class ProcessCapabilitiesService {
  getTemplatesFromCapabilities(capabilities: Capabilities): Template[] {
    const templates: Template[] = [];
    for (const layout of capabilities.layouts) {
      const mapAttribute = layout.attributes.filter(
        (attribute) =>
          attribute.name === "map" && attribute.type === "MapAttributeValues"
      );
      const extraAttributes = layout.attributes.filter(
        (attribute) =>
          attribute.clientParams === null ||
          attribute.clientParams === undefined
      );
      if (mapAttribute.length === 1) {
        const clientInfo = mapAttribute[0].clientInfo;
        if (clientInfo) {
          const mapAreaSize: MapAreaSizeInPixels = {
            width: clientInfo.width,
            height: clientInfo.height
          };
          templates.push({
            name: layout.name,
            mapAreaSize,
            attributes: extraAttributes
          });
        }
      }
    }
    return templates;
  }
}
