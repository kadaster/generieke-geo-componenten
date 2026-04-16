import { inject, Injectable } from "@angular/core";
import { CoreWmsWmtsCapabilitiesService } from "./core-wms-wmts-capabilities.service";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import {
  ServiceCapabilities,
  CapabilitiesServiceLayer,
  CapabilitiesServiceLayerStyle
} from "./ggc-capabilities.service";

@Injectable({
  providedIn: "root"
})
export class GgcWmsWmtsCapabilitiesService {
  private readonly coreCapabilitiesService = inject(
    CoreWmsWmtsCapabilitiesService
  );

  /*
   * Haalt de capabilities op voor een gegeven URL en service type.
   * @param baseUrl - De URL van de capabilities endpoint.
   * @param service - Het type service: `"WMTS"` of `"WMS"`.
   * @returns Observable met de capabilities data.
   */
  getCapabilities(
    baseUrl: string,
    service: "WMTS" | "WMS"
  ): Observable<Record<string, any> | undefined> {
    return this.coreCapabilitiesService.getCapabilitiesForUrl(baseUrl, service);
  }

  /*
   * Haalt de WMS capabilities op voor een gegeven URL en vertaald deze naar
   * een ServiceCapabilities Object.
   * @param baseUrl - De URL van de capabilities endpoint.
   * @returns Observable met de Capabilities vertaald naar een CapabilitiesService Object
   */
  getServiceCapabilitiesWMS(
    baseUrl: string
  ): Observable<ServiceCapabilities | undefined> {
    return this.getCapabilities(baseUrl, "WMS").pipe(
      map((capabilities) => {
        if (!capabilities) {
          return undefined;
        }
        return this.extractServiceCapabilitiesWMS(capabilities);
      })
    );
  }

  /*
   * Creëert een ServiceCapabilities uit de capabilities van een WMS service.
   * @param capabilities - De capabilities van een WMS service.
   * @returns ServiceCapabilities Object met de informatie uit de capabilities.
   */
  extractServiceCapabilitiesWMS(
    capabilities: Record<string, any>
  ): ServiceCapabilities {
    const wmsLayers = capabilities?.Capability?.Layer?.Layer;
    const layers: CapabilitiesServiceLayer[] = [];
    const service: ServiceCapabilities = {
      title: capabilities?.Service?.Title,
      abstract: capabilities?.Service?.Abstract,
      type: "WMS",
      url: capabilities.Request?.GetCapabilities?.DCPType?.HTTP?.Get
        ?.OnlineResource,
      layers: layers
    };
    if (wmsLayers === undefined) {
      console.warn("Geen layers gevonden in WMS capabilities");
    } else {
      for (const layer of wmsLayers) {
        const ggcLayerStyles: CapabilitiesServiceLayerStyle[] =
          this.extractStylesFromWMSLayer(layer);
        const datasetLayer: CapabilitiesServiceLayer = {
          name: crypto.randomUUID(),
          title: layer.Name,
          maxResolution: layer.MaxScaleDenominator,
          minResolution: layer.MinScaleDenominator,
          styles: ggcLayerStyles
        };
        layers.push(datasetLayer);
      }
    }
    return service;
  }

  /*
   * Haalt de styles uit een WMS layer.
   * @param layer - De WMS layer.
   * @returns Array met CapabilitiesServiceLayerStyle objecten.
   */
  extractStylesFromWMSLayer(
    layer: Record<string, any>
  ): CapabilitiesServiceLayerStyle[] {
    const styles: CapabilitiesServiceLayerStyle[] = [];
    if (!layer.Style) {
      console.warn("Geen stijlen gevonden in WMS layer: " + layer.Name);
      return styles;
    }
    for (const style of layer.Style) {
      const wmsStyle: CapabilitiesServiceLayerStyle = {
        name: style.Name,
        legendURL: style.LegendURL[0].OnlineResource
      };
      styles.push(wmsStyle);
    }
    return styles;
  }

  /*
   * Haalt de WMTS capabilities op voor een gegeven URL en vertaald deze naar
   * een ServiceCapabilitiesObject.
   * @param baseUrl - De URL van de capabilities endpoint.
   * @returns Observable met de Capabilities vertaald naar een ServiceCapabilities Object.
   */
  getServiceCapabilitiesWMTS(
    baseUrl: string
  ): Observable<ServiceCapabilities | undefined> {
    return this.getCapabilities(baseUrl, "WMTS").pipe(
      map((capabilities) => {
        if (!capabilities) {
          return undefined;
        }
        return this.extractServiceCapabilitiesWMTS(capabilities);
      })
    );
  }

  /*
   * Creëert een ServiceCapabilities uit de capabilities van een WMTS service.
   * @param capabilities - De capabilities van een WMTS service.
   * @returns ServiceCapabilities Object met de informatie uit de capabilities.
   */
  extractServiceCapabilitiesWMTS(
    capabilities: Record<string, any>
  ): ServiceCapabilities {
    const wmtsLayers = capabilities?.Contents?.Layer;
    const layers: CapabilitiesServiceLayer[] = [];
    const mapSource: ServiceCapabilities = {
      title: capabilities?.ServiceIdentification?.Title,
      url: capabilities?.OperationsMetadata?.DCP?.HTTP?.Get[0]?.href,
      type: "WMTS",
      layers: layers
    };
    if (wmtsLayers === undefined) {
      console.warn("Geen layers gevonden in WMTS capabilities");
    } else {
      for (const layer of wmtsLayers) {
        const styles: CapabilitiesServiceLayerStyle[] =
          this.extractStylesFromWMTSLayer(layer);
        layers.push({
          name: layer.Identifier,
          title: layer.Title,
          styles: styles
        });
      }
    }
    return mapSource;
  }

  /*
   * Haalt de styles uit een WMTS layer.
   * @param layer - De WMTS layer.
   * @returns Array met CapabilitiesServiceLayerStyle objecten.
   */
  extractStylesFromWMTSLayer(
    layer: Record<string, any>
  ): CapabilitiesServiceLayerStyle[] {
    const styles: CapabilitiesServiceLayerStyle[] = [];
    if (!layer.Style) {
      console.warn("Geen stijlen gevonden in WMTS layer: " + layer.Name);
      return styles;
    }
    for (const style of layer.Style) {
      const wmtsStyle: CapabilitiesServiceLayerStyle = {
        name: style.Identifier,
        legendURL: style?.LegendURL?.[0]?.href
      };
      styles.push(wmtsStyle);
    }
    return styles;
  }
}
