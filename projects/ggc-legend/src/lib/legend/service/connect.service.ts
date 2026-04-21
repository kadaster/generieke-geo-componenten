import { inject, Injectable, Injector } from "@angular/core";

/**
 * Service die verantwoordelijk is voor het leggen van de verbinding tussen de legenda
 * en de kaartfunctionaliteit (@kadaster/ggc-map en @kadaster/ggc-cesium).
 *
 * Deze service laadt de MapService dynamisch om circulaire afhankelijkheden te voorkomen
 * en biedt toegang tot kaartgerelateerde acties zoals de legendaUpdate/Remove events.
 */
@Injectable({ providedIn: "root" })
export class GgcLegendConnectService {
  private readonly injector = inject(Injector);
  private ggcCesiumSharedLayerService: any;
  private ggcOLLayerService: any;
  private ggcOLMapEventsService: any;

  /**
   * Laadt de Cesium `GgcSharedLayerService` dynamisch vanuit de cesiummodule.
   *
   * Controleert eerst of de service al geladen is. Zo niet, dan wordt de module
   * `@kadaster/ggc-cesium` geïmporteerd en wordt de
   * `GgcSharedLayerService` verkregen via de `Injector`.
   *
   * @returns Een Promise die wordt afgerond zodra de poging tot laden is voltooid.
   */
  async loadGgcCesiumSharedLayerService(): Promise<void> {
    if (!this.ggcCesiumSharedLayerService) {
      try {
        const module = await import("@kadaster/ggc-cesium");
        this.ggcCesiumSharedLayerService = this.injector.get(
          module.GgcSharedLayerService
        );
      } catch (e) {
        console.log(
          `Autoconnect ggc-legend met ggc-cesium is niet gelukt (GgcSharedLayerService): ${e}`
        );
      }
    }
  }

  /**
   * Laadt de OpenLayers `GgcLayerService` dynamisch vanuit de ggc-map.
   *
   * Controleert eerst of de service al geladen is. Zo niet, dan wordt de module
   * `@kadaster/ggc-map` geïmporteerd en wordt de
   * `GgcLayerService` verkregen via de `Injector`.
   *
   * @returns Een Promise die wordt afgerond zodra de poging tot laden is voltooid.
   */
  async loadGgcOLLayerService(): Promise<void> {
    if (!this.ggcOLLayerService) {
      try {
        const module = await import("@kadaster/ggc-map");
        this.ggcOLLayerService = this.injector.get(module.GgcLayerService);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        console.warn(
          `Autoconnect ggc-legend met ggc-map is niet gelukt (GgcLayerService): ${e}`
        );
      }
    }
  }

  /**
   * Laadt de OpenLayers `GgcMapEventsService` dynamisch vanuit de ggc-map.
   *
   * Controleert eerst of de service al geladen is. Zo niet, dan wordt de module
   * `@kadaster/ggc-map` geïmporteerd en wordt de
   * `GgcMapEventsService` verkregen via de `Injector`.
   *
   * @returns Een Promise die wordt afgerond zodra de poging tot laden is voltooid.
   */
  async loadGgcOLMapEventsService(): Promise<void> {
    if (!this.ggcOLMapEventsService) {
      try {
        const module = await import("@kadaster/ggc-map");
        this.ggcOLMapEventsService = this.injector.get(
          module.GgcMapEventsService
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        console.warn(
          `Autoconnect ggc-legend met ggc-map is niet gelukt (GgcMapEventsService): ${e}`
        );
      }
    }
  }

  /**
   * Retourneert de instantie van de geladen GgcSharedLayerService van Cesium.
   *
   * @returns De `GgcSharedLayerService` instantie of `undefined` als deze nog niet is geladen via {@link loadGgcCesiumSharedLayerService}.
   */
  getGgcCesiumSharedLayerService(): any {
    return this.ggcCesiumSharedLayerService;
  }

  /**
   * Retourneert de instantie van de geladen GgcLayerService van ggc-map.
   *
   * @returns De `GgcLayerService` instantie of `undefined` als deze nog niet is geladen via {@link loadGgcOLLayerService}.
   */
  getGgcOLLayerService(): any {
    return this.ggcOLLayerService;
  }

  /**
   * Retourneert de instantie van de geladen GgcMapEventsService van ggc-map.
   *
   * @returns De `GgcMapEventsService` instantie of `undefined` als deze nog niet is geladen via {@link loadGgcOLLayerService}.
   */
  getGgcOLMapEventsService(): any {
    return this.ggcOLMapEventsService;
  }
}
