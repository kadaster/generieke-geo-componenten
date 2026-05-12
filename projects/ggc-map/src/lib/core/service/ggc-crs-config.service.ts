import { Injectable } from "@angular/core";
import {
  epsg28992,
  extent,
  matrixIds,
  matrixSizes,
  resolutions
} from "../../utils/epsg28992";
import { CrsConfig } from "../model/crs-config.model";

/**
 * Service die configuratie levert voor het RD New
 * coördinatenreferentiesysteem (EPSG:28992).
 *
 * Deze service bouwt en cachet een {@link CrsConfig} die wordt gebruikt
 * voor kaartprojectie, resoluties en WMTS-matrixinstellingen.
 */

@Injectable({
  providedIn: "root"
})
export class GgcCrsConfigService {
  /**
   * Maximale ondersteunde zoomlevel voor RD New.
   */
  public static MAX_ZOOMLEVEL = 25;

  /**
   * Interne cache van de RD New CRS-configuratie.
   */
  rdNewCrsConfig: CrsConfig;

  /**
   * Geeft de configuratie voor het RD New coördinatenreferentiesysteem (EPSG:28992).
   *
   * De configuratie wordt lazy geïnitialiseerd en hergebruikt bij volgende aanroepen.
   *
   * @returns {@link CrsConfig} voor RD New
   */
  getRdNewCrsConfig(): CrsConfig {
    if (this.rdNewCrsConfig === undefined) {
      this.rdNewCrsConfig = {
        projectionCode: epsg28992,
        extent,
        resolutions,
        matrixSet: epsg28992,
        matrixIds,
        matrixSizes,
        units: "m"
      };
    }
    return this.rdNewCrsConfig;
  }
}
