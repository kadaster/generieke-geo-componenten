import { inject, Injectable } from "@angular/core";
import { EMPTY, map, Observable, Subject } from "rxjs";
import { GgcDatasetTreeConnectService } from "./connect.service";
import {
  CesiumLayerChangedEvent,
  DEFAULT_CESIUM_MAPINDEX,
  LayerChangedEvent,
  ViewerType,
  Webservice2DType,
  Webservice3DType
} from "@kadaster/ggc-models";
import { filter } from "rxjs/operators";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";

/**
 * De dataset-tree gebruikt deze service om met de kaarten te communiceren en de benodigde
 * informatie op te halen van layerIds.
 */

@Injectable({
  providedIn: "root"
})
export class DatasetTreeMapConnectService {
  private readonly connectService = inject(GgcDatasetTreeConnectService);

  /**
   * Interne event-bus voor custom triggers.
   */
  private readonly triggerSubject = new Subject<string>();

  /**
   * Stuur een custom event (trigger).
   */
  emitTrigger(viewerType: ViewerType, mapIndex: string): void {
    if (viewerType === ViewerType.TWEE_D) {
      this.triggerSubject.next(mapIndex);
    } else if (viewerType === ViewerType.DRIE_D) {
      // Not implemented for 3D
    }
  }

  /**
   * Subscribe op custom triggers.
   *
   * @param mapIndex - filter op mapIndex
   */
  getTriggerObservable(mapIndex = DEFAULT_MAPINDEX): Observable<string> {
    return this.triggerSubject
      .asObservable()
      .pipe(filter((eventMapIndex) => eventMapIndex === mapIndex));
  }

  /**
   * Returns de Observable die informatie geeft als layers worden geupdatet.
   * @param viewerType - geeft aan of een 2D service (ggc-map) of een 3D service (ggc-cesium) moet worden aangeroepen
   */
  async getLayerChangedObservable(
    viewerType: ViewerType
  ): Promise<Observable<LayerChangedEvent>> {
    if (viewerType === ViewerType.DRIE_D) {
      return (await this.getCesiumSharedLayerService())
        .getLayerChangedObservable()
        .pipe(
          map(
            (event: CesiumLayerChangedEvent) =>
              ({
                layerId: event.layerId,
                mapIndex: DEFAULT_CESIUM_MAPINDEX,
                eventTrigger: event.eventTrigger
              }) as LayerChangedEvent
          )
        );
    }
    return (await this.getMapLayerService()).getLayerChangedObservable();
  }

  /**
   * Returns de Observable die informatie geeft als er wordt gezoomd in de kaart.
   * @param mapIndex - de naam van de Map waar de Observable informatie van teruggeeft.
   * @param viewerType - geeft aan of een 2D service (ggc-map) of een 3D service (ggc-cesium) moet worden aangeroepen
   */
  async getZoomendObservableForMap(
    mapIndex: string,
    viewerType: ViewerType
  ): Promise<Observable<any>> {
    if (viewerType === ViewerType.DRIE_D) {
      // Not implemented for 3D
      return EMPTY;
    }
    return (await this.getMapEventsService()).getZoomendObservableForMap(
      mapIndex
    );
  }

  /**
   * Returns de title van de opgegeven layer.
   * @param layerId - de layerId van de layer.
   * @param mapIndex - de mapIndex van de layer.
   * @param viewerType - geeft aan of een 2D service (ggc-map) of een 3D service (ggc-cesium) moet worden aangeroepen
   */
  async getTitle(
    layerId: string,
    mapIndex: string,
    viewerType: ViewerType
  ): Promise<string | undefined> {
    if (viewerType === ViewerType.DRIE_D) {
      return (await this.getCesiumSharedLayerService()).getTitle(layerId);
    }
    return (await this.getMapLayerService()).getTitle(layerId, mapIndex);
  }

  /**
   * Returns de zichtbaarheid van de opgegeven layer.
   * @param layerId - de layerId van de layer.
   * @param mapIndex - de mapIndex van de layer.
   * @param viewerType - geeft aan of een 2D service (ggc-map) of een 3D service (ggc-cesium) moet worden aangeroepen
   */
  async isVisible(
    layerId: string,
    mapIndex: string,
    viewerType: ViewerType
  ): Promise<boolean | undefined> {
    if (viewerType === ViewerType.DRIE_D) {
      return (await this.getCesiumSharedLayerService()).isVisible(layerId);
    }
    return (await this.getMapLayerService()).isVisible(layerId, mapIndex);
  }

  /**
   * Wisselt/toggeld de zichtbaarheid van de opgegeven layer en returned de nieuwe waarde van de visibility.
   * @param layerId - de layerId van de layer.
   * @param mapIndex - de mapIndex van de layer.
   * @param viewerType - geeft aan of een 2D service (ggc-map) of een 3D service (ggc-cesium) moet worden aangeroepen
   */

  async toggleVisibility(
    layerId: string,
    mapIndex: string,
    viewerType: ViewerType
  ): Promise<boolean | undefined> {
    if (viewerType === ViewerType.DRIE_D) {
      return (await this.getCesiumSharedLayerService()).toggleVisibility(
        layerId
      );
    }
    return (await this.getMapLayerService()).toggleVisibility(
      layerId,
      mapIndex
    );
  }

  /**
   * Returns layer is enabled (actief) in de huidige resolutie
   * @param layerId - de layerId van de layer.
   * @param mapIndex - de mapIndex van de layer.
   * @param viewerType - geeft aan of een 2D service (ggc-map) of een 3D service (ggc-cesium) moet worden aangeroepen
   */
  async getEnabled(layerId: string, mapIndex: string, viewerType: ViewerType) {
    if (viewerType === ViewerType.DRIE_D) {
      return (await this.getCesiumSharedLayerService()).getEnabled(layerId);
    }
    return (await this.getMapLayerService()).getEnabled(layerId, mapIndex);
  }

  /**
   * Returns het type van de laag (WMS, WMTS etc.)
   * @param layerId - de layerId van de layer.
   * @param mapIndex - de mapIndex van de layer.
   * @param viewerType - geeft aan of een 2D service (ggc-map) of een 3D service (ggc-cesium) moet worden aangeroepen
   */
  async getTypeOfLayer(
    layerId: string,
    mapIndex: string,
    viewerType: ViewerType
  ): Promise<Webservice2DType | Webservice3DType> {
    if (viewerType === ViewerType.DRIE_D) {
      return (await this.getCesiumSharedLayerService()).getTypeOfLayer(layerId);
    }
    return (await this.getMapLayerService()).getTypeOfLayer(layerId, mapIndex);
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
