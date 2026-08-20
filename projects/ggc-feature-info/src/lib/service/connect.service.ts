import { inject, Injectable, Injector, Type } from "@angular/core";

type GgcMapModule = {
  GgcSelectionService: Type<unknown>;
  GgcMapService: Type<unknown>;
};

type GgcCesiumModule = {
  GgcSelectionService: Type<unknown>;
};

@Injectable({ providedIn: "root" })
export class GgcFeatureInfoConnectService {
  private mapSelectionService?: unknown;
  private mapService?: unknown;
  private cesiumSelectionService?: unknown;
  private readonly injector = inject(Injector);
  private mapModulePromise?: Promise<GgcMapModule>;
  private cesiumModulePromise?: Promise<GgcCesiumModule>;

  async getMapService(): Promise<unknown> {
    try {
      if (!this.mapService) {
        const module = await this.loadMapModule();
        this.mapService = this.injector.get(module.GgcMapService);
      }
      return this.mapService;
    } catch (e) {
      return undefined;
    }
  }

  async getMapSelectionService(): Promise<unknown> {
    try {
      if (!this.mapSelectionService) {
        const module = await this.loadMapModule();
        this.mapSelectionService = this.injector.get(
          module.GgcSelectionService
        );
      }
      return this.mapSelectionService;
    } catch (e) {
      return undefined;
    }
  }

  async getCesiumSelectionService(): Promise<unknown> {
    try {
      if (!this.cesiumSelectionService) {
        const module = await this.loadCesiumModule();
        this.cesiumSelectionService = this.injector.get(
          module.GgcSelectionService
        );
      }
      return this.cesiumSelectionService;
    } catch (e) {
      return undefined;
    }
  }

  /**
   * Lazy load Map module (once)
   */
  private loadMapModule(): Promise<GgcMapModule> {
    // Dynamisch laden werkt alleen met de naam van de import in een variabele:
    const map2D = "@kadaster/ggc-map";
    this.mapModulePromise ??= import(/* @vite-ignore */ map2D).catch((e) => {
      throw e;
    });
    return this.mapModulePromise;
  }

  /**
   * Lazy load Map module (once)
   */
  private loadCesiumModule(): Promise<GgcCesiumModule> {
    // Dynamisch laden werkt alleen met de naam van de import in een variabele:
    const map3D = "@kadaster/ggc-map-3d";
    this.cesiumModulePromise ??= import(/* @vite-ignore */ map3D).catch((e) => {
      throw e;
    });
    return this.cesiumModulePromise;
  }
}
