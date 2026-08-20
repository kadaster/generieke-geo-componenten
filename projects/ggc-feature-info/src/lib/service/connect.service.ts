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
    this.mapModulePromise ??= (async () => {
      const moduleName = "@kadaster/ggc-map";
      return import(moduleName);
    })();
    return this.mapModulePromise;
  }

  /**
   * Lazy load Map module (once)
   */
  private loadCesiumModule(): Promise<GgcCesiumModule> {
    this.cesiumModulePromise ??= (async () => {
      const moduleName = "@kadaster/ggc-map-3d";
      return import(moduleName);
    })();
    return this.cesiumModulePromise;
  }
}
