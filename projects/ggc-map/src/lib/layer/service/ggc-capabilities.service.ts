import { inject, Service } from "@angular/core";
import { Observable, of } from "rxjs";
import { CoreWmsWmtsCapabilitiesService } from "./core-wms-wmts-capabilities.service";
import { GgcOgcApiCapabilitiesService } from "./ggc-ogc-api-capabilities.service";
import { map } from "rxjs/operators";
import WMTS from "ol/source/WMTS";
import { Coordinate } from "ol/coordinate";
import { Webservice2DType } from "@kadaster/ggc-models";
import { AbstractConfigurableLayerOptions } from "../model/abstract-layer.model";
import { WmsLayerOptions } from "../model/wms-layer.model";
import { WmtsLayerOptions } from "../model/wmts-layer.model";
import { scaleToResolution } from "../../utils/epsg28992";

/**
 * Service voor het ophalen en verwerken van WMS/WMTS en OGCAPI capabilities.
 */
@Service()
export class GgcCapabilitiesService {
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
        return this.coreWmsWmtsCapabilitiesService.getServiceCapabilitiesWMS(
          baseUrl
        );
      case "WMTS":
        return this.coreWmsWmtsCapabilitiesService.getServiceCapabilitiesWMTS(
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

  /**
   * Haalt de capabilities op voor de url van de laag en mapt de `title`,
   * `minResolution` en `maxResolution` van de bijbehorende capabilities-laag op
   * de layerOptions. Waarden die al in de layerOptions zijn ingesteld, worden
   * niet overschreven.
   *
   * - WMS: de laag wordt gezocht op basis van `layerName`, of anders de eerste
   *   naam uit `layers`. De schaalgetallen (ScaleDenominators) uit de
   *   capabilities worden omgerekend naar resoluties.
   * - WMTS: de laag wordt gezocht op basis van `layerName`, of anders `layer`.
   *   WMTS capabilities bevatten geen resoluties, daarom wordt alleen de
   *   `title` gemapt.
   * - Vector: de capabilities worden opgehaald van de OGC API landingspagina
   *   (het deel van de url vóór `/tiles/`); de eerste tileset wordt gebruikt.
   * - GeoJSON en image: deze functie doet niets en geeft de layerOptions
   *   ongewijzigd terug.
   *
   * Wanneer de layerOptions geen `url` hebben of er geen passende laag in de
   * capabilities wordt gevonden, worden de layerOptions ongewijzigd teruggegeven.
   * @param layerOptions - De opties van de laag waarop de capabilities worden gemapt.
   * @param layerType - Het type van de laag.
   * @returns Observable met een kopie van de layerOptions, aangevuld met de
   * waarden uit de capabilities.
   */
  mapCapabilitiesOnLayerOptions<T extends AbstractConfigurableLayerOptions>(
    layerOptions: T,
    layerType: Webservice2DType
  ): Observable<T> {
    const serviceType = this.getServiceType(layerType);
    if (!serviceType || !layerOptions.url) {
      return of(layerOptions);
    }

    const baseUrl = this.getBaseUrl(layerOptions.url, layerType);
    return this.getServiceFromCapabilities(baseUrl, serviceType).pipe(
      map((serviceCapabilities) => {
        const capabilitiesServiceLayer = this.findCapabilitiesServiceLayer(
          serviceCapabilities,
          layerOptions,
          layerType
        );
        if (!capabilitiesServiceLayer) {
          return layerOptions;
        }

        const toResolution = (value?: string): number | undefined => {
          const numberValue = Number(value);
          if (value === undefined || !Number.isFinite(numberValue)) {
            return undefined;
          }
          return layerType === Webservice2DType.WMS
            ? scaleToResolution(numberValue)
            : numberValue;
        };

        return {
          ...layerOptions,
          title: layerOptions.title ?? capabilitiesServiceLayer.title,
          minResolution:
            layerOptions.minResolution ??
            toResolution(capabilitiesServiceLayer.minResolution),
          maxResolution:
            layerOptions.maxResolution ??
            toResolution(capabilitiesServiceLayer.maxResolution)
        };
      })
    );
  }

  /*
   * Bepaalt de base url voor het ophalen van de capabilities. Het deel na het
   * vraagteken wordt verwijderd; voor vector lagen wordt daarnaast alles vanaf
   * `/tiles/` verwijderd, zodat de OGC API landingspagina overblijft.
   */
  private getBaseUrl(url: string, layerType: Webservice2DType): string {
    const baseUrl = url.split("?")[0];
    if (layerType === Webservice2DType.VECTOR) {
      return baseUrl.split("/tiles/")[0];
    }
    return baseUrl;
  }

  private getServiceType(
    layerType: Webservice2DType
  ): "WMS" | "WMTS" | "OGCAPI" | undefined {
    switch (layerType) {
      case Webservice2DType.WMS:
        return "WMS";
      case Webservice2DType.WMTS:
        return "WMTS";
      case Webservice2DType.VECTOR:
        return "OGCAPI";
      default:
        return undefined;
    }
  }

  /**
   * Zoekt de bijbehorende capabilities-laag voor de gegeven layerOptions, gezien er meerdere layers in de capabilities kunnen zitten en de weergeven laag gekoppeld moet worden.
   * Returnt de bijbehorende CapabilitiesServiceLayer of undefined als er geen match is gevonden.
   * @param serviceCapabilities De opgehaalde capabilities van de service
   * @param layerOptions De layerOptions van de laag waarvoor de capabilities gezocht worden
   * @param layerType Het type van de layer
   * @private
   */
  private findCapabilitiesServiceLayer(
    serviceCapabilities: ServiceCapabilities | undefined,
    layerOptions: AbstractConfigurableLayerOptions,
    layerType: Webservice2DType
  ): CapabilitiesServiceLayer | undefined {
    const capabilitiesServiceLayers = serviceCapabilities?.layers ?? [];
    switch (layerType) {
      case Webservice2DType.WMS: {
        const wmsLayers = (layerOptions as WmsLayerOptions).layers;
        const wmsLayerName =
          layerOptions.layerName ??
          (Array.isArray(wmsLayers) ? wmsLayers[0] : wmsLayers);
        // In de WMS ServiceCapabilities bevat title de Name van de laag.
        return capabilitiesServiceLayers.find(
          (layer) => layer.title === wmsLayerName
        );
      }
      case Webservice2DType.WMTS: {
        const wmtsLayerName =
          layerOptions.layerName ?? (layerOptions as WmtsLayerOptions).layer;
        return capabilitiesServiceLayers.find(
          (layer) => layer.name === wmtsLayerName
        );
      }
      default:
        return capabilitiesServiceLayers[0];
    }
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
