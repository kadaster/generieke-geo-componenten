import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { CoreWmsWmtsCapabilitiesMapperService } from "./core-wms-wmts-capabilities-mapper.service";
import { GgcOgcApiCapabilitiesService } from "./ggc-ogc-api-capabilities.service";
import { map } from "rxjs/operators";
import WMTS from "ol/source/WMTS";
import { Coordinate } from "ol/coordinate";
import { CoreWmsWmtsCapabilitiesService } from "./core-wms-wmts-capabilities.service";

/**
 * Service voor het ophalen en verwerken van WMS/WMTS en OGCAPI capabilities.
 */
@Injectable({
  providedIn: "root"
})
export class GgcCapabilitiesService {
  private readonly wmsWmtsCapabilitiesService = inject(
    CoreWmsWmtsCapabilitiesMapperService
  );
  private readonly coreWmsWmtsCapabilitiesService = inject(
    CoreWmsWmtsCapabilitiesService
  );
  private readonly ogcApiCapabilitiesService = inject(
    GgcOgcApiCapabilitiesService
  );

  /**
   * Geeft een CapabilitiesService Object terug voor verschillende service types
   * @param baseUrl - De URL van de capabilities endpoint van de WMS, WMTS
   * of landingspagina van een OGCAPI.
   * @param serviceType - het type van de service dit kan WMS, WMTS of OGCAPI zijn
   * @returns Observable van een CapabilitiesService Object
   */
  getServiceFromCapabilities(
    baseUrl: string,
    serviceType: "WMS" | "WMTS" | "OGCAPI"
  ): Observable<ServiceCapabilities | undefined> {
    switch (serviceType) {
      case "WMS":
        return this.wmsWmtsCapabilitiesService.getServiceCapabilitiesWMS(
          baseUrl
        );
      case "WMTS":
        return this.wmsWmtsCapabilitiesService.getServiceCapabilitiesWMTS(
          baseUrl
        );
      case "OGCAPI":
        return this.ogcApiCapabilitiesService.getServiceCapabilitiesOgcApi(
          baseUrl
        );
    }
  }

  /**
   * Geeft een array van CapabilitiesServiceLayerStyle terug voor een bepaalde
   * laag binnen een service.
   * @param baseUrl - De URL van de capabilities endpoint van de WMS, WMTS
   * of landingspagina van een OGCAPI.
   * @param serviceType - het type van de service dit kan WMS, WMTS of OGCAPI zijn
   * @param layerName - de naam van een laag of tileset
   * @returns Observable van een lijst van CapabilitiesServiceLayerStyle Objecten
   */
  getServiceLayerStyles(
    baseUrl: string,
    serviceType: "WMS" | "WMTS" | "OGCAPI",
    layerName: string
  ): Observable<CapabilitiesServiceLayerStyle[]> {
    return this.getServiceFromCapabilities(baseUrl, serviceType).pipe(
      map((s) => s?.layers.find((l) => l.name === layerName)?.styles ?? [])
    );
  }

  /**
   * Haalt de capabilities op voor een gegeven WMS of WMTS service.
   * @param baseUrl - De URL van de capabilities endpoint.
   * @param service - Het type service: `"WMTS"` of `"WMS"`.
   * @returns Observable met de capabilities data (ol capabilities).
   */
  getCapabilities(
    baseUrl: string,
    service: "WMTS" | "WMS"
  ): Observable<Record<string, any> | undefined> {
    return this.coreWmsWmtsCapabilitiesService.getCapabilitiesForUrl(
      baseUrl,
      service
    );
  }

  /**
   * Maakt een observable voor een WMTS GetFeatureInfo request.
   *
   * @param baseUrl - De URL van de WMTS service.
   * @param source - De WMTS bron.
   * @param coordinate - De Coordinate waarop info gewenst is.
   * @param resolution - De resolutie van de kaart.
   * @returns Observable met de response van de GetFeatureInfo request.
   */
  getWmtsFeatureInfo(
    baseUrl: string,
    source: WMTS,
    coordinate: Coordinate,
    resolution: number
  ): Observable<any> {
    return this.coreWmsWmtsCapabilitiesService.getWmtsFeatureInfo(
      baseUrl,
      source,
      coordinate,
      resolution
    );
  }
}
/**
 * ServiceCapabilities object bevat de layers van een WMS, WMTS of OGCAPI service.
 */
export type ServiceCapabilities = {
  /** Titel van de service */
  title?: string;
  /** Abstract, korte omschrijving van de service */
  abstract?: string;
  /** URL van de service */
  url: string;
  /** Type van de service: WMS, WMTS of OGCAPI */
  type: string;
  /** Layers van de service */
  layers: CapabilitiesServiceLayer[];
};

/**
 * CapabilitiesServiceLayer object is een enkele laag van een WMS, WMTS of
 * OGCAPI service en bevat één of meerdere Styles.
 */
export type CapabilitiesServiceLayer = {
  /** Naam van de layer */
  name: string;
  /** Titel van de layer */
  title: string;
  /** URL van de layer (optioneel)*/
  url?: string;
  /** Minimale resolutie van de layer (optioneel)*/
  minResolution?: string;
  /** Maximale resolutie van de layer (optioneel)*/
  maxResolution?: string;
  /** Stijlen van de layer */
  styles: CapabilitiesServiceLayerStyle[];
};

/**
 * CapabilitiesServiceLayerStyle object bevat de stijl die wordt getoond voor een
 * OGCAPI (vector)tileset of voor WMS en WMTS de URL van de legenda (bij de stijl)
 * als deze wordt aangeboden.
 */
export type CapabilitiesServiceLayerStyle = {
  /** Naam van de stijl */
  name: string;
  /** Titel van de stijl (optioneel) */
  title?: string;
  /** URL van de legenda afbeelding (optioneel) */
  legendURL: string;
};
