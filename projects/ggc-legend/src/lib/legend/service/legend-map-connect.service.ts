import { inject, Injectable } from "@angular/core";
import { GgcLegendConnectService } from "./connect.service";
import {
  LayerLegend,
  LegendAddedEvent,
  LegendRemovedEvent
} from "@kadaster/ggc-models";
import { EMPTY, merge, Observable, of } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class GgcLegendMapConnectService {
  private readonly connectService = inject(GgcLegendConnectService);

  /**
   * Returns the observable die events emit als een legenda is toegevoegd aan een 2D of 2D kaart.
   */
  async getLegendAddedObservable(): Promise<Observable<LegendAddedEvent>> {
    const mapObservable: Observable<LegendAddedEvent> =
      (await this.getMapLayerService())?.getLegendAddedObservable() ?? of();
    const cesiumObservable: Observable<LegendAddedEvent> =
      (await this.getCesiumSharedLayerService())?.getLegendAddedObservable() ??
      of();
    return merge(mapObservable, cesiumObservable);
  }

  /**
   * Returns the observable die events emit als een legenda is weggehaald van een 2D of 2D kaart.
   */
  async getLegendRemovedObservable(): Promise<Observable<LegendRemovedEvent>> {
    const mapObservable: Observable<LegendRemovedEvent> =
      (await this.getMapLayerService())?.getLegendRemovedObservable() ?? of();
    const cesiumObservable: Observable<LegendRemovedEvent> =
      (
        await this.getCesiumSharedLayerService()
      )?.getLegendRemovedObservable() ?? of();
    return merge(mapObservable, cesiumObservable);
  }

  /**
   * Returns de Observable die informatie geeft als er wordt gezoomd in de kaart.
   * @param mapIndex - de index van de Map waar de Observable informatie van teruggeeft.
   */
  async getZoomendObservableForMap(mapIndex: string): Promise<Observable<any>> {
    // Not implemented for Cesium 3D
    return (
      (await this.getMapEventsService())?.getZoomendObservableForMap(
        mapIndex
      ) ?? EMPTY
    );
  }

  /**
   * Returns een lijst van actieve legena's voor de kaart met de opgegeven mapIndex. Let op, de mapIndex is alleen relevant voor een 2D kaart.
   * @param mapIndex De mapIndex waarvoor alle legenda's worden teruggegeven.
   */
  async getCurrentActiveLegends(mapIndex: string): Promise<LayerLegend[]> {
    const mapLegends: LayerLegend[] =
      (await this.getMapLayerService())?.getCurrentActiveLegends(mapIndex) ??
      [];
    const cesiumLegends: LayerLegend[] =
      (await this.getCesiumSharedLayerService())?.getCurrentActiveLegends() ??
      [];
    return mapLegends.concat(cesiumLegends);
  }

  /**
   * Returns layer is enabled (actief) in de huidige resolutie
   * @param layerId - de layerId van de layer.
   * @param mapIndex - de mapIndex van de layer.
   */
  async getEnabled(layerId: string, mapIndex: string) {
    const enabledCesium =
      (await this.getCesiumSharedLayerService())?.getEnabled(layerId) ?? true;
    const enabledMap =
      (await this.getMapLayerService())?.getEnabled(layerId, mapIndex) ?? true;
    return enabledCesium && enabledMap;
  }

  private async getCesiumSharedLayerService() {
    await this.connectService.loadGgcCesiumSharedLayerService();
    return this.connectService.getGgcCesiumSharedLayerService();
  }

  private async getMapLayerService() {
    await this.connectService.loadGgcOLLayerService();
    return this.connectService.getGgcOLLayerService();
  }

  private async getMapEventsService() {
    await this.connectService.loadGgcOLMapEventsService();
    return this.connectService.getGgcOLMapEventsService();
  }
}
