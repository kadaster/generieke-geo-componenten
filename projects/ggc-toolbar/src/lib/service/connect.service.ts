import { inject, Injectable, Injector } from "@angular/core";

/**
 * Service die verantwoordelijk is voor het leggen van de verbinding tussen de search-location-component
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
  private mapService: any;
  private drawService: any;
  private mapComponentDrawTypes: any;

  /**
   * Laadt de `GgcMapService` dynamisch vanuit de kaartmodule.
   *
   * Controleert eerst of de service al geladen is. Zo niet, dan wordt de module
   * `@kadaster/ggc-map` geïmporteerd en wordt de
   * `GgcMapService` verkregen via de `Injector`.
   *
   * @returns Een Promise die wordt afgerond zodra de poging tot laden is voltooid.
   */
  async loadMapService(): Promise<void> {
    if (!this.mapService) {
      try {
        const module = await import("@kadaster/ggc-map");
        this.mapService = this.injector.get(module.GgcMapService);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {}
    }
  }

  /**
   * Retourneert de instantie van de geladen MapService.
   *
   * @returns De `GgcMapService` instantie of `undefined` als deze nog niet is geladen via {@link loadMapService}.
   */
  getMapService(): any {
    return this.mapService;
  }

  /**
   * Laadt de `GgcDrawService` dynamisch vanuit de kaartmodule.
   *
   * Controleert eerst of de service al geladen is. Zo niet, dan wordt de module
   * `@kadaster/ggc-map` geïmporteerd en wordt de
   * `GgcDrawService` verkregen via de `Injector`.
   *
   * @returns Een Promise die wordt afgerond zodra de poging tot laden is voltooid.
   */
  async loadDrawService(): Promise<void> {
    if (!this.drawService) {
      try {
        const module = await import("@kadaster/ggc-map");
        this.drawService = this.injector.get(module.GgcDrawService);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {}
    }
  }

  /**
   * Retourneert de instantie van de geladen DrawService.
   *
   * @returns De `GgcDrawService` instantie of `undefined` als deze nog niet is geladen via {@link loadDrawService}.
   */
  getDrawService(): any {
    return this.drawService;
  }

  /**
   * Laadt de `MapComponentDrawTypes` dynamisch vanuit de kaartmodule.
   *
   * Controleert eerst of de service al geladen is. Zo niet, dan wordt de module
   * `@kadaster/ggc-map` geïmporteerd en wordt de
   * `MapComponentDrawTypes` verkregen via de `Injector`.
   *
   * @returns Een Promise die wordt afgerond zodra de poging tot laden is voltooid.
   */
  async loadMapComponentDrawTypes(): Promise<void> {
    if (!this.mapComponentDrawTypes) {
      try {
        const module = await import("@kadaster/ggc-map");
        this.mapComponentDrawTypes = module.MapComponentDrawTypes;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {}
    }
  }

  /**
   * Retourneert de instantie van de geladen MapComponentDrawTypes.
   *
   * @returns De `MapComponentDrawTypes` instantie of `undefined` als deze nog niet is geladen via {@link loadMapComponentDrawTypes}.
   */
  getMapComponentDrawTypes(): any {
    return this.mapComponentDrawTypes;
  }
}
