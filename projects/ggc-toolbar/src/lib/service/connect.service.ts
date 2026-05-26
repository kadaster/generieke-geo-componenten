import { inject, Injectable, Injector, Type } from "@angular/core";

type GgcMapModule = {
  GgcMapService: Type<unknown>;
  GgcDrawService: Type<unknown>;
  MapComponentDrawTypes: unknown;
};

/**
 * Service die verantwoordelijk is voor het leggen van de verbinding tussen de toolbar
 * en de kaartfunctionaliteit (@kadaster/ggc-map).
 *
 * Deze service laadt de MapService dynamisch om circulaire afhankelijkheden te voorkomen
 * en biedt toegang tot kaartgerelateerde acties zoals zoomen en markeren.
 */
@Injectable({
  providedIn: "root"
})
export class GgcToolbarConnectService {
  private readonly injector = inject(Injector);

  private modulePromise?: Promise<GgcMapModule>;

  private mapService?: unknown;
  private drawService?: unknown;

  /**
   * Zorgt dat de module slechts één keer geladen wordt.
   */
  private loadMapModule(): Promise<GgcMapModule> {
    this.modulePromise ??= import(/* @vite-ignore */ "@kadaster/ggc-map").catch(
      (e) => {
        console.debug(
          `Autoconnect ggc-toolbar met ggc-map is niet gelukt: ${e}`
        );
        throw e;
      }
    );
    return this.modulePromise;
  }

  async getMapService(): Promise<unknown> {
    try {
      if (!this.mapService) {
        const module = await this.loadMapModule();
        this.mapService = this.injector.get(module.GgcMapService);
      }
      return this.mapService;
    } catch (e) {
      console.debug("getMapService mislukt:", e);
      return undefined;
    }
  }

  async getDrawService(): Promise<unknown> {
    try {
      if (!this.drawService) {
        const module = await this.loadMapModule();
        this.drawService = this.injector.get(module.GgcDrawService);
      }
      return this.drawService;
    } catch (e) {
      console.debug("getDrawService mislukt:", e);
      return undefined;
    }
  }
}
