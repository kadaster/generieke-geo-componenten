import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Coordinate } from "ol/coordinate";
import { Extent } from "ol/extent";
import { WMSCapabilities, WMTSCapabilities } from "ol/format";
import WMTS, { Options, optionsFromCapabilities } from "ol/source/WMTS";
import { TileCoord } from "ol/tilecoord";
import { Observable } from "rxjs";
import { map, shareReplay } from "rxjs/operators";
import { Capabilities } from "../model/capabilities.model";

/**
 * Service voor het ophalen en verwerken van WMS/WMTS capabilities.
 * Ondersteunt caching van capabilities per URL en het genereren van GetFeatureInfo requests.
 */
@Injectable({
  providedIn: "root"
})
export class CoreWmsWmtsCapabilitiesService {
  private httpClient = inject(HttpClient);

  private capabilitiesMap: Map<string, Observable<Record<string, any>>> =
    new Map();

  /**
   * Haalt capabilities op voor een gegeven URL en service type.
   * Ondersteunt caching en het delen van observables.
   *
   * @param baseUrl - De URL van de capabilities endpoint.
   * @param service - Het type service: `"WMTS"` of `"WMS"`.
   * @param withCredentials - Of credentials moeten worden meegestuurd.
   * @returns Observable met de capabilities data.
   */
  getCapabilitiesForUrl(
    baseUrl: string,
    service: "WMTS" | "WMS",
    withCredentials = false
  ): Observable<Record<string, any> | undefined> {
    let format: WMSCapabilities | WMTSCapabilities;
    const params: Record<string, string> = {
      request: "getCapabilities",
      service
    };
    if (service === "WMTS") {
      format = new WMTSCapabilities();
    } else {
      format = new WMSCapabilities();
      params.version = "1.3.0";
    }
    if (this.capabilitiesMap.has(baseUrl)) {
      return this.capabilitiesMap.get(baseUrl) as Observable<
        Record<string, any>
      >;
    } else {
      const observable: Observable<Capabilities> = this.httpClient
        .get(baseUrl, {
          responseType: "text",
          params,
          withCredentials
        })
        .pipe(
          map((res) => format.read(res)),
          shareReplay(1)
        );
      this.capabilitiesMap.set(baseUrl, observable);
      return observable;
    }
  }

  /**
   * Genereert WMTS opties uit capabilities en configuratie.
   *
   * @param wmtsCapabilities - De capabilities zoals gelezen met WMTSCapabilities.
   * @param config - Configuratie voor de laag.
   * @returns Options object voor WMTS.
   */
  optionsFromCapabilities(
    wmtsCapabilities: unknown,
    config: unknown
  ): Options | null {
    return optionsFromCapabilities(wmtsCapabilities, config);
  }

  /**
   * Controleert of de capabilities een GetFeatureInfo URL bevatten.
   *
   * @param capabilities - De capabilities.
   * @returns `true` als een GetFeatureInfo URL beschikbaar is.
   */
  hasFeatureInfoUrl(capabilities: Capabilities): boolean {
    return !!capabilities.getFeatureInfoUrl();
  }

  /**
   * Maakt een observable voor een GetFeatureInfo request.
   *
   * @param baseUrl - De URL van de WMTS service.
   * @param source - De WMTS bron.
   * @param coordinate - De Coordinate waarop info gewenst is.
   * @param resolution - De resolutie van de kaart.
   * @returns Observable met de response van de GetFeatureInfo request.
   */
  createGetFeatureInfoUrlObservable(
    baseUrl: string,
    source: WMTS,
    coordinate: Coordinate,
    resolution: number
  ): Observable<any> {
    const baseParams = this.constructGetFeatureInfoParams(
      source,
      coordinate,
      resolution
    );

    return this.httpClient.get(baseUrl, { params: baseParams });
  }

  /**
   * Genereert de parameters voor een GetFeatureInfo request.
   *
   * @param source - De WMTS bron.
   * @param coordinate - De Coordinate waarop info gewenst is.
   * @param resolution - De resolutie van de kaart.
   * @returns Object met query parameters.
   */
  private constructGetFeatureInfoParams(
    source: WMTS,
    coordinate: Coordinate,
    resolution: number
  ): { [p: string]: string } {
    const tileGrid = source.getTileGrid();
    const tileCoord: TileCoord = tileGrid!.getTileCoordForCoordAndResolution(
      coordinate,
      resolution
    );
    const tileCol = tileCoord[1];
    const tileRow = tileCoord[2];

    const tileExtent: Extent = tileGrid!.getTileCoordExtent(tileCoord);
    const tileResolution = tileGrid!.getResolution(tileCoord[0]);
    const zoom = tileGrid!.getZForResolution(tileResolution);
    const i = Math.floor((coordinate[0] - tileExtent[0]) / tileResolution);
    const j = Math.floor((tileExtent[3] - coordinate[1]) / tileResolution);

    return {
      SERVICE: "WMTS",
      VERSION: "1.0.0",
      REQUEST: "GetFeatureInfo",
      LAYER: source.getLayer(),
      STYLE: "",
      FORMAT: "image/png",
      TileCol: "" + tileCol,
      TileRow: "" + tileRow,
      TileMatrix: source.getMatrixSet() + ":" + zoom,
      TileMatrixSet: source.getMatrixSet(),
      I: "" + i,
      J: "" + j,
      infoformat: "application/json",
      info_format: "application/json",
      FEATURE_COUNT: "8"
    };
  }
}
