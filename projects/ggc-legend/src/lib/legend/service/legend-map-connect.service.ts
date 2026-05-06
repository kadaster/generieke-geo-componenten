import {inject, Injectable} from "@angular/core";
import {GgcLegendConnectService} from "./connect.service";
import {
  LayerLegend,
  LegendAddedEvent,
  LegendRemovedEvent
} from "@kadaster/ggc-models";
import {EMPTY, merge, Observable, of} from "rxjs";

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
      (
        (await this.connectService.getGgcOLLayerService()) as any
      )?.getLegendAddedObservable() ?? of();
    const cesiumObservable: Observable<LegendAddedEvent> =
      (
        (await this.connectService.getGgcCesiumSharedLayerService()) as any
      )?.getLegendAddedObservable() ?? of();
    return merge(mapObservable, cesiumObservable);
  }

  /**
   * Returns the observable die events emit als een legenda is weggehaald van een 2D of 2D kaart.
   */
  async getLegendRemovedObservable(): Promise<Observable<LegendRemovedEvent>> {
    const mapObservable: Observable<LegendRemovedEvent> =
      (
        (await this.connectService.getGgcOLLayerService()) as any
      )?.getLegendRemovedObservable() ?? of();
    const cesiumObservable: Observable<LegendRemovedEvent> =
      (
        (await this.connectService.getGgcCesiumSharedLayerService()) as any
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
      (
        (await this.connectService.getGgcOLMapEventsService()) as any
      )?.getZoomendObservableForMap(mapIndex) ?? EMPTY
    );
  }

  /**
   * Returns een lijst van actieve legena's voor de kaart met de opgegeven mapIndex. Let op, de mapIndex is alleen relevant voor een 2D kaart.
   * @param mapIndex De mapIndex waarvoor alle legenda's worden teruggegeven.
   */
  async getCurrentActiveLegends(mapIndex: string): Promise<LayerLegend[]> {
    const mapLegends: LayerLegend[] =
      (
        (await this.connectService.getGgcOLLayerService()) as any
      )?.getCurrentActiveLegends(mapIndex) ?? [];
    const cesiumLegends: LayerLegend[] =
      (
        (await this.connectService.getGgcCesiumSharedLayerService()) as any
      )?.getCurrentActiveLegends() ?? [];
    return mapLegends.concat(cesiumLegends);
  }

  /**
   * Returns layer is enabled (actief) in de huidige resolutie
   * @param layerId - de layerId van de layer.
   * @param mapIndex - de mapIndex van de layer.
   */
  async getEnabled(layerId: string, mapIndex: string) {
    const enabledCesium =
      (
        (await this.connectService.getGgcCesiumSharedLayerService()) as any
      )?.getEnabled(layerId) ?? true;
    const enabledMap =
      ((await this.connectService.getGgcOLLayerService()) as any)?.getEnabled(
        layerId,
        mapIndex
      ) ?? true;
    return enabledCesium && enabledMap;
  }
}
