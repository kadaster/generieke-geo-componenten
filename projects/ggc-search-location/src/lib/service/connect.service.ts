import { inject, Injectable, Injector, Type } from "@angular/core";

type CesiumModule = {
  GgcLocationService: Type<unknown>;
};

type GgcMapModule = {
  GgcMapService: Type<unknown>;
};

@Injectable({
  providedIn: "root"
})
export class GgcSearchLocationConnectService {
  private readonly injector = inject(Injector);

  private cesiumModulePromise?: Promise<CesiumModule>;
  private mapModulePromise?: Promise<GgcMapModule>;

  private ggcCesiumLocationService?: unknown;
  private mapService?: unknown;

  /**
   * Lazy load Cesium module (once)
   */
  private loadCesiumModule(): Promise<CesiumModule> {
    // Dynamisch laden werkt alleen met de naam van de import in een variabele:
    const map3D = "@kadaster/ggc-map-3d";
    this.cesiumModulePromise ??= import(/* @vite-ignore */ map3D).catch((e) => {
      console.debug(
        `Autoconnect ggc-dataset-tree met ggc-map-3d is niet gelukt: ${e}`,
        e
      );
      throw e;
    });
    return this.cesiumModulePromise;
  }

  private loadMapModule(): Promise<GgcMapModule> {
    // Dynamisch laden werkt alleen met de naam van de import in een variabele:
    const map2D = "@kadaster/ggc-map";
    this.mapModulePromise ??= import(/* @vite-ignore */ map2D).catch((e) => {
      console.debug(
        `Autoconnect ggc-search-location met ggc-map is niet gelukt: ${e}`,
        e
      );
      throw e;
    });
    return this.mapModulePromise;
  }

  async getGgcLocationService(): Promise<unknown> {
    try {
      if (!this.ggcCesiumLocationService) {
        const module = await this.loadCesiumModule();
        this.ggcCesiumLocationService = this.injector.get(
          module.GgcLocationService
        );
      }
      return this.ggcCesiumLocationService;
    } catch (e) {
      console.debug(
        `Autoconnect ggc-search-location met ggc-map-3d is niet gelukt (GgcLocationService): ${e}`,
        e
      );
      return undefined;
    }
  }

  async getMapService(): Promise<unknown> {
    try {
      if (!this.mapService) {
        const module = await this.loadMapModule();
        this.mapService = this.injector.get(module.GgcMapService);
      }
      return this.mapService;
    } catch (e) {
      console.debug(
        `Autoconnect ggc-search-location met ggc-map is niet gelukt (GgcMapService): ${e}`,
        e
      );
      return undefined;
    }
  }
}
