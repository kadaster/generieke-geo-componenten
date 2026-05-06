import { inject, Injectable, Injector, Type } from "@angular/core";

type GgcMapModule = {
  GgcMapService: Type<unknown>;
};

@Injectable({
  providedIn: "root"
})
export class GgcSearchLocationConnectService {
  private readonly injector = inject(Injector);

  private mapModulePromise?: Promise<GgcMapModule>;
  private mapService?: unknown;

  private loadMapModule(): Promise<GgcMapModule> {
    this.mapModulePromise ??= import(
      /* @vite-ignore */ "@kadaster/ggc-map"
    ).catch((e) => {
      console.debug(
        `Autoconnect ggc-search-location met ggc-map is niet gelukt: ${e}`,
        e
      );
      throw e;
    });
    return this.mapModulePromise;
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
