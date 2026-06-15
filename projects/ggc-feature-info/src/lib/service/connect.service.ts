import { inject, Injectable, Injector, Type } from "@angular/core";

type GgcMapModule = {
  GgcSelectionService: Type<unknown>;
  GgcMapService: Type<unknown>;
};

@Injectable({ providedIn: "root" })
export class GgcFeatureInfoConnectService {
  private mapSelectionService?: unknown;
  private mapService?: unknown;
  private readonly injector = inject(Injector);
  private mapModulePromise?: Promise<GgcMapModule>;

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
}
