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
      console.debug(`Autoconnect ggc-feature-info met ggc-map: ${e}`, e);
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
      console.debug(`Autoconnect ggc-feature-info met ggc-map: ${e}`, e);
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
      console.debug(
        `Autoconnect ggc-feature-info met ggc-map is niet gelukt: ${e}`,
        e
      );
      throw e;
    });
    return this.mapModulePromise;
  }
}
