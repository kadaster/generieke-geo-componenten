import { inject, Injectable, Injector, Type } from "@angular/core";

type CesiumModule = {
  GgcSharedLayerService: Type<unknown>;
};

type GgcMapModule = {
  GgcLayerService: Type<unknown>;
  GgcMapEventsService: Type<unknown>;
};

@Injectable({ providedIn: "root" })
export class GgcLegendConnectService {
  private readonly injector = inject(Injector);

  private cesiumModulePromise?: Promise<CesiumModule>;
  private mapModulePromise?: Promise<GgcMapModule>;

  private ggcCesiumSharedLayerService?: unknown;
  private ggcOLLayerService?: unknown;
  private ggcOLMapEventsService?: unknown;

  /**
   * Lazy load Cesium module (once)
   */
  private loadCesiumModule(): Promise<CesiumModule> {
    this.cesiumModulePromise ??= import(
      /* @vite-ignore */ "@kadaster/ggc-map-3d"
    ).catch((e) => {
      throw e;
    });
    return this.cesiumModulePromise;
  }

  /**
   * Lazy load Map module (once)
   */
  private loadMapModule(): Promise<GgcMapModule> {
    this.mapModulePromise ??= import(
      /* @vite-ignore */ "@kadaster/ggc-map"
    ).catch((e) => {
      throw e;
    });
    return this.mapModulePromise;
  }

  async getGgcCesiumSharedLayerService(): Promise<unknown> {
    try {
      if (!this.ggcCesiumSharedLayerService) {
        const module = await this.loadCesiumModule();
        this.ggcCesiumSharedLayerService = this.injector.get(
          module.GgcSharedLayerService
        );
      }
      return this.ggcCesiumSharedLayerService;
    } catch (e) {
      return undefined;
    }
  }

  async getGgcOLLayerService(): Promise<unknown> {
    try {
      if (!this.ggcOLLayerService) {
        const module = await this.loadMapModule();
        this.ggcOLLayerService = this.injector.get(module.GgcLayerService);
      }
      return this.ggcOLLayerService;
    } catch (e) {
      return undefined;
    }
  }

  async getGgcOLMapEventsService(): Promise<unknown> {
    try {
      if (!this.ggcOLMapEventsService) {
        const module = await this.loadMapModule();
        this.ggcOLMapEventsService = this.injector.get(
          module.GgcMapEventsService
        );
      }
      return this.ggcOLMapEventsService;
    } catch (e) {
      return undefined;
    }
  }
}
