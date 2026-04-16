import { inject, Injectable } from "@angular/core";
import {
  CoreOgcApiCapabilitiesService,
  OGCAPILink,
  OGCAPIStyle,
  OGCAPITile,
  OGCAPITileset
} from "./core-ogc-api-capabilities.service";
import { forkJoin, Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import {
  ServiceCapabilities,
  CapabilitiesServiceLayerStyle,
  CapabilitiesServiceLayer
} from "./ggc-capabilities.service";
import { epsg28992, zoomlevelToResolution } from "../../utils/epsg28992";

/**
 * Service voor het ophalen en vertalen van OGCAPI capabilities naar GGC objecten.
 */

@Injectable({
  providedIn: "root"
})
export class GgcOgcApiCapabilitiesService {
  private readonly coreOgcApiCapabilitiesService = inject(
    CoreOgcApiCapabilitiesService
  );

  /*
   * Haalt de serviceinformatie op voor OGCAPI met behulp van een basis url en
   * vertaald deze naar een CapabilitiesService object met layers (Tiles) en
   * styles.
   * NB alleen Tiles en Styles in het Rijksdriehoekstelsel(EPSG28992) worden meegenomen.
   * @param baseUrl - De URL van de capabilities endpoint.
   * @returns Observable met een ServiceCapabilities object
   */
  getServiceCapabilitiesOgcApi(
    baseUrl: string
  ): Observable<ServiceCapabilities> {
    return this.coreOgcApiCapabilitiesService.getLandingPageInfo(baseUrl).pipe(
      switchMap((landingPageInfo) => {
        // styles + tiles parallel ophalen
        return forkJoin({
          styles: this.getRDStyles(baseUrl).pipe(
            map((ogcApiStyles: OGCAPIStyle[]) => {
              const styles: CapabilitiesServiceLayerStyle[] = ogcApiStyles.map(
                (s) => {
                  const legendURL = this.getmapBoxLinkFromOGCAPIStyle(s)!.href;
                  return { name: s.id, title: s.title, legendURL };
                }
              );
              return styles;
            })
          ),
          tiles: this.getRDTiles(baseUrl) // gebruikt de gecachte variant hierboven
        }).pipe(
          map(({ styles, tiles }) => {
            const layers: CapabilitiesServiceLayer[] = [];
            for (const tileset of tiles.tilesets ?? ([] as OGCAPITileset[])) {
              layers.push({
                name: tiles.title,
                title: tiles.title,
                url: this.getTileUrlFromTileset(tileset),
                styles: styles || [],
                maxResolution: String(
                  this.getResolutionsFromTileset(tileset).maxResolution
                ),
                minResolution: String(
                  this.getResolutionsFromTileset(tileset).minResolution
                )
              });
            }
            const service: ServiceCapabilities = {
              title: landingPageInfo.title,
              abstract: landingPageInfo.description,
              url: baseUrl,
              type: "OGCAPI",
              layers
            };
            return service;
          })
        );
      })
    );
  }

  /*
   * Filtered uit een lijst van OGCAPIStyle objecten de stylen voor
   * het Rijksdriehoekstelsel(EPSG28992)
   * @param baseUrl - De URL van de capabilities endpoint.
   * @returns Observable met een OGCAPIStyle objecten
   */
  private getRDStyles(baseUrl: string): Observable<OGCAPIStyle[]> {
    return this.coreOgcApiCapabilitiesService
      .getStyles(baseUrl)
      .pipe(
        map((styles) =>
          styles.filter((s) =>
            s.id.toLowerCase().includes("netherlandsrdnewquad")
          )
        )
      );
  }

  /*
   * Filtered uit een lijst van OGCAPITile objecten de tilesets in
   * het Rijksdriehoekstelsel(EPSG28992)
   * @param baseUrl - De URL van de capabilities endpoint.
   * @returns Observable met een OGCAPITile objecten
   */
  private getRDTiles(baseUrl: string): Observable<OGCAPITile> {
    return this.coreOgcApiCapabilitiesService.getTiles(baseUrl).pipe(
      map((tiles) => {
        // Verdedigende checks
        const filteredTilesets = (tiles?.tilesets ?? []).filter(
          (t) => t.crs === "https://www.opengis.net/def/crs/EPSG/0/28992"
        );
        // Retourneer een nieuw OGCAPITiles object met gefilterde tilesets
        return {
          ...tiles, // behoud alle andere properties
          tilesets: filteredTilesets
        } as OGCAPITile;
      })
    );
  }

  /*
   * Berekend een min- en maxresolutie uit de limits van een OGCAPITileset
   * @param tileset - een OGCAPITileset Object.
   * @returns een object met min- en maxresolution
   */
  private getResolutionsFromTileset(tileset: OGCAPITileset): {
    maxResolution: number;
    minResolution: number;
  } {
    let minlevel = 0;
    let maxlevel = 16;
    for (const limits of tileset.tileMatrixSetLimits ?? []) {
      const level = Number(limits.tileMatrix);
      // Clamp naar het toegestane bereik 0..16
      const clamped = Math.max(0, Math.min(16, level));
      // Werk min/max bij
      if (clamped > minlevel) minlevel = clamped;
      if (clamped < maxlevel) maxlevel = clamped;
    }
    return {
      // Tel voor de maxresolutie er 1 level bij op, zodat de laag zichtbaar
      // wordt van...tot (bij bijv alleen tilelevel 12 van 12 tot 13)
      minResolution: zoomlevelToResolution(maxlevel),
      maxResolution: zoomlevelToResolution(minlevel - 1)
    };
  }

  /*
   * Extracts een tileurl uit een OGCAPITileset object
   * @param tileset - een OGCAPITileset Object.
   * @returns url
   */
  private getTileUrlFromTileset(tileset: OGCAPITileset): string | undefined {
    const tilesetItemLink = tileset.links.find(
      (l: any) => l?.rel === "item"
    )?.href;
    if (tilesetItemLink) {
      return tilesetItemLink.replace(
        "{tileMatrix}/{tileRow}/{tileCol}",
        "{z}/{x}/{y}"
      );
    }
    return tileset.tileMatrixSetURI + "/{z}/{x}/{y}?f=mvt";
  }

  /*
   * Extracts een mapbox styleurl uit een OGCAPIStyle object
   * @param styl - een OGCAPIStyle Object.
   * @returns een OGCAPILink object
   */
  private getmapBoxLinkFromOGCAPIStyle(
    style: OGCAPIStyle
  ): OGCAPILink | undefined {
    return style.links?.find(
      (l: any) =>
        l.rel === "stylesheet" &&
        (l.type?.includes("application/vnd.mapbox.style+json") ?? true)
    );
  }
}
