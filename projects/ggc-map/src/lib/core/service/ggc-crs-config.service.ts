import { Injectable } from "@angular/core";
import {
  epsg28992,
  extent,
  matrixIds,
  matrixSizes,
  resolutions
} from "../../utils/epsg28992";
import { CrsConfig } from "../model/crs-config.model";

@Injectable({
  providedIn: "root"
})
export class GgcCrsConfigService {
  public static MAX_ZOOMLEVEL = 25;
  rdNewCrsConfig: CrsConfig;

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
