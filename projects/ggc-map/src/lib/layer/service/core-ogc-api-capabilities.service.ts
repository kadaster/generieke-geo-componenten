import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import { TileMatrixSetLimit } from "ol/source/ogcTileUtil";

/**
 * Service voor het ophalen van capabilities van een OgcApiService.
 * Ondersteunt caching van capabilities per URL.
 */
@Injectable({
  providedIn: "root"
})
@Injectable({ providedIn: "root" })
export class CoreOgcApiCapabilitiesService {
  private readonly httpClient = inject(HttpClient);
  private readonly httpHeaders = new HttpHeaders({
    Accept: "application/json"
  });
  private readonly landingPagesMap = new Map<
    string,
    Observable<OGCAPILandingPageInfo>
  >();
  private readonly stylesMap = new Map<string, Observable<OGCAPIStyle[]>>();
  private readonly tilesMap = new Map<string, Observable<OGCAPITile>>();

  /*
   * Haalt informatie op van een OGCAPI landingspagina
   * @param baseUrl - De URL naar de landingspagina van een OGCAPI service.
   * @returns Observable met een OGCLandingPageInfo
   */
  getLandingPageInfo(baseUrl: string): Observable<OGCAPILandingPageInfo> {
    // 1) Als 'ie al bestaat: direct teruggeven (géén nieuwe request)
    const cached = this.landingPagesMap.get(baseUrl);
    if (cached) {
      return cached;
    }
    // 2) Opbouw URL + headers
    const url = baseUrl.endsWith("/")
      ? `${baseUrl}?f=json`
      : `${baseUrl}/?f=json`;

    // 3) Nieuwe Observable maken, mappen en cachen
    const stream$ = this.httpClient
      .get<any>(url, { headers: this.httpHeaders })
      .pipe(
        map((landing) => {
          const title = landing?.title ?? "(zonder titel)";
          const description = landing?.description ?? "";

          const getLink = (rel: string): OGCAPILink | undefined =>
            Array.isArray(landing?.links)
              ? landing.links.find((l: any) => l?.rel === rel)
              : undefined;

          return {
            title,
            description,
            links: {
              apiDef: getLink("service-desc"),
              apiDoc: getLink("service-doc"),
              conformance: getLink("conformance"),
              collections: getLink(
                "http://www.opengis.net/def/rel/ogc/1.0/data"
              ),
              tilesetsVector: getLink(
                "http://www.opengis.net/def/rel/ogc/1.0/tilesets-vector"
              ),
              styles: getLink("http://www.opengis.net/def/rel/ogc/1.0/styles")
            }
          } as OGCAPILandingPageInfo;
        })
      );
    // 4) In cache stoppen vóór we hem teruggeven
    this.landingPagesMap.set(baseUrl, stream$);
    return stream$;
  }

  /*
   * Haalt informatie op van OGCAPI tiles
   * @param baseUrl - De URL naar de landingspagina van een OGCAPI service.
   * @returns Observable met een OGCAPITile object
   */
  getTiles(baseUrl: string): Observable<OGCAPITile> {
    return this.getTileLink(baseUrl).pipe(
      switchMap((tilesLink) => {
        if (!tilesLink?.href) {
          return throwError(
            () => new Error("Tiles-link niet gevonden in landing page.")
          );
        }
        const tilesUrl = tilesLink.href;
        const cached = this.tilesMap.get(tilesUrl);
        if (cached) {
          return cached;
        }
        const stream$ = this.httpClient
          .get<any>(tilesUrl, { headers: this.httpHeaders })
          .pipe(
            map((json) => this.parseTileJson(json)),
            catchError((err) => {
              // Voeg context toe, maar laat de fout door naar de caller.
              console.error(`Fout bij ophalen tile info van ${tilesUrl}`, err);
              throw err;
            })
          );
        this.tilesMap.set(baseUrl, stream$);
        return stream$;
      })
    );
  }
  /*
   * Haalt informatie op van OGCAPI styles
   * @param baseUrl - De URL naar de landingspagina van een OGCAPI service.
   * @returns Observable met een OGCAPIStyle array
   */
  getStyles(baseUrl: string): Observable<OGCAPIStyle[]> {
    return this.getStyleLink(baseUrl).pipe(
      switchMap((stylesLink) => {
        if (!stylesLink?.href) {
          return throwError(
            () => new Error("Styles-link niet gevonden in landing page.")
          );
        }
        const stylesUrl = stylesLink.href;
        const cached = this.stylesMap.get(stylesUrl);
        if (cached) {
          return cached;
        }
        const stream$ = this.httpClient
          .get<any>(stylesUrl, { headers: this.httpHeaders })
          .pipe(
            map((json) => this.parseStylesList(json)),
            catchError((err) => {
              // Voeg context toe, maar laat de fout door naar de caller.
              console.error(`Fout bij ophalen styles van ${stylesUrl}`, err);
              throw err;
            })
          );
        this.stylesMap.set(baseUrl, stream$);
        return stream$;
      })
    );
  }

  getSourcesForStyle(styleUrl: string): Observable<MapboxStyleSource> {
    /* Deze methode wordt momenteel niet gebruikt, wellicht is deze in de toekomst relevant
    om mapbox stylesheets aan vectorstylesets te koppelen. Voor nu gaan we er vanuit
    dat alle (RD)mapboxstylesheets kunnen worden toegepast op alle RD Tilesets */
    const headers = new HttpHeaders({
      Accept: "application/vnd.mapbox.style+json, application/json"
    });
    return this.httpClient
      .get<any>(styleUrl, { headers })
      .pipe(map((style) => style.sources));
  }

  private getStyleLink(baseUrl: string): Observable<OGCAPILink | undefined> {
    return this.getLandingPageInfo(baseUrl).pipe(
      map((landingPageInfo) => landingPageInfo.links.styles ?? undefined)
    );
  }

  private getTileLink(baseUrl: string): Observable<OGCAPILink | undefined> {
    return this.getLandingPageInfo(baseUrl).pipe(
      map(
        (landingPageInfo) => landingPageInfo.links.tilesetsVector ?? undefined
      )
    );
  }

  private parseStylesList(json: any): OGCAPIStyle[] {
    return Array.isArray(json?.styles)
      ? json.styles.map((s: any) => ({
          id: String(s?.id ?? ""),
          title: s?.title,
          description: s?.description,
          links: Array.isArray(s?.links) ? s.links : []
        }))
      : [];
  }

  private parseTileJson(json: any): OGCAPITile {
    const title = json.title;
    const description = json.description;
    return {
      title,
      description,
      tilesets: json?.tilesets
    };
  }
}

export type OGCAPILandingPageInfo = {
  title: string;
  description?: string;
  links: {
    apiDef?: OGCAPILink;
    apiDoc?: OGCAPILink;
    conformance?: OGCAPILink;
    collections?: OGCAPILink;
    tilesetsVector?: OGCAPILink;
    styles?: OGCAPILink;
  };
};

export type OGCAPIStyle = {
  id: string; // unieke identifier
  title?: string; // optionele naam
  description?: string; // optionele omschrijving
  links?: OGCAPILink[]; // links naar representaties/documentatie
};

export type OGCAPITile = {
  title: string;
  description?: string; // optionele omschrijving
  tilesets: OGCAPITileset[];
};

export type OGCAPITileset = {
  dataType: string;
  crs: string;
  links: OGCAPILink[];
  tileMatrixSetId: string;
  tileMatrixSetDefinition: string;
  tileMatrixSetURI: string;
  tileMatrixSetLimits: TileMatrixSetLimit[];
};

export type OGCAPILink = {
  href: string;
  rel: string;
  type?: string;
  title?: string;
};

export type MapboxStyleSource = {
  key: string;
  value: MapboxStyleSourceProperties;
};

export type MapboxStyleSourceProperties = {
  type: string;
  url?: string;
  tiles?: string[];
  minzoom?: number;
  maxzoom?: number;
  attribution?: string;
};
