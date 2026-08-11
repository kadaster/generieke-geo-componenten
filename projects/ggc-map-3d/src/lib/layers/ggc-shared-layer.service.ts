import { inject, Injectable } from "@angular/core";
import { Entity } from "@cesium/engine";
import { GeoJsonLayerService } from "./geojson-layer.service";
import { Tiles3dLayerService } from "./tiles3d-layer.service";
import { WmtsLayerService } from "./wmts-layer.service";
import { LayerConfig, Webservice } from "../model/interfaces";
import { merge, Observable, Subject } from "rxjs";
import { BaseLayerService } from "./base-layer.service";
import {
  CesiumLayerChangedEvent,
  DEFAULT_CESIUM_MAPINDEX,
  LayerChangedEventTrigger,
  LayerLegend,
  LegendAddedEvent,
  LegendRemovedEvent,
  Webservice3DType
} from "@kadaster/ggc-models";

/**
 *
 *  Service die als centrale entrypoint fungeert voor alle laag-gerelateerde acties
 *  binnen de 3D viewer.
 *
 *  Deze service:
 *  - Verdeelt acties naar de juiste concrete layer services (GeoJSON, 3D Tiles, WMTS);
 *  - Houdt configuraties van alle geladen webservices bij;
 *  - Combineert layer change events uit alle onderliggende services;
 *  - Beheert zichtbaarheid van lagen;
 *  - Emit legend events bij toevoegen/verwijderen van lagen;
 *  - Biedt utility functies om layer metadata op te halen (titel, type, legend, enabled status).
 * Deze service bepaalt welke specifieke laagservice moet worden aangeroepen
 * voor het verversen of verwijderen van lagen.
 */
@Injectable({
  providedIn: "root"
})
export class GgcSharedLayerService {
  private layerConfigurations: Webservice[] = [];

  private readonly geoJsonLayerService = inject(GeoJsonLayerService);
  private readonly tiles3dLayerService = inject(Tiles3dLayerService);
  private readonly wmtsLayerService = inject(WmtsLayerService);

  private readonly layerChangedSubject: Subject<CesiumLayerChangedEvent> =
    new Subject();
  private readonly legendAddedSubject: Subject<LegendAddedEvent> =
    new Subject();
  private readonly legendRemovedSubject: Subject<LegendRemovedEvent> =
    new Subject();

  constructor() {
    this.getLayerChangedObservable().subscribe((event) => {
      if (event.eventTrigger == LayerChangedEventTrigger.LAYER_ADDED) {
        this.emitLegendAddedEvent(event.layerId);
      } else if (event.eventTrigger == LayerChangedEventTrigger.LAYER_REMOVED) {
        this.emitLegendRemovedEvent(event.layerId);
      }
    });
  }

  /**
   * Laadt een lijst van webservices en initialiseert hun lagen.
   *
   * @param services Array van {@link Webservice}
   */
  loadWebservices(services: Webservice[]) {
    this.removeCurrentLayers();
    this.layerConfigurations = [];
    for (const service of services) {
      this.layerConfigurations.push(service);
      this.loadWebservice(service);
    }
  }

  private loadWebservice(service: Webservice) {
    service.layers = service.layers.map((layerOptions) => {
      const updatedLayer = {
        ...layerOptions,
        url: service.url,
        visible: layerOptions.visible ?? true
      } as LayerConfig;

      if (updatedLayer.visible) {
        this.addLayer(service.type, updatedLayer);
      }
      this.layerChangedSubject.next({
        layerId: layerOptions.layerId,
        eventTrigger: LayerChangedEventTrigger.LAYER_INITIALIZED
      });
      return updatedLayer;
    });
  }

  private removeCurrentLayers() {
    const configuration = this.layerConfigurations;
    if (configuration) {
      configuration.forEach((service) => {
        service.layers.forEach((layer) => {
          if (layer.layerId) {
            this.removeLayer(layer.layerId);
          }
        });
      });
    }
  }

  /**
   * Geeft een observable die alle layer change events emit.
   *
   * @returns Observable met {@link CesiumLayerChangedEvent}
   */
  getLayerChangedObservable(): Observable<CesiumLayerChangedEvent> {
    return merge(
      this.geoJsonLayerService.getLayerChangedObservable(),
      this.tiles3dLayerService.getLayerChangedObservable(),
      this.wmtsLayerService.getLayerChangedObservable(),
      this.layerChangedSubject
    );
  }

  /**
   * Observable voor legend toegevoegd events.
   *
   * @returns Observable met {@link LegendAddedEvent}
   */
  getLegendAddedObservable() {
    return this.legendAddedSubject.asObservable();
  }

  /**
   * Observable voor legend verwijderd events.
   *
   * @returns Observable met {@link LegendRemovedEvent}
   */
  getLegendRemovedObservable() {
    return this.legendRemovedSubject.asObservable();
  }

  /**
   * Haalt alle actieve legendes op van zichtbaar gemaakte lagen.
   *
   * @returns Array van {@link LayerLegend}
   */
  getCurrentActiveLegends(): LayerLegend[] {
    const result: LayerLegend[] = [];
    this.layerConfigurations.forEach((service) => {
      service.layers.forEach((layer) => {
        const layerId = layer.layerId;
        if (layerId && this.isVisible(layerId)) {
          result.push(this.getLayerLegend(layerId));
        }
      });
    });
    return result;
  }

  /**
   * Voegt een laag toe.
   *
   * @param type Type van de service ({@link Webservice3DType})
   * @param layer Layer configuratie
   */
  addLayer(type: Webservice3DType, layer: LayerConfig) {
    if (layer.url) {
      this.determineLayerServiceFromType(type).addLayer(layer.url, layer);
    }
  }

  /**
   * Verwijdert een laag op basis van layerId.
   *
   * @param layerId ID van de laag
   */
  removeLayer(layerId: string): void {
    const service = this.determineLayerService(layerId);
    if (service) {
      service.removeLayer(layerId);
    }
  }

  /**
   * Reload the provided layer; it will remove and add the layer.
   * Useful if there are known changes in the data of the url.
   * @param layerId The layerId to reload
   */
  reloadLayer(layerId: string) {
    this.removeLayer(layerId);
    this.addLayerFromLayersConfig(layerId);
  }

  /**
   * Toggle de zichtbaarheid van een laag.
   * Een laag wordt verwijderd als deze niet meer zichtbaar is en opnieuw toegevoegd mocht deze weer zichtbaar zijn.
   *
   * @param layerId ID van de laag
   * @returns `true` indien zichtbaar na togglen
   */
  toggleVisibility(layerId: string): boolean {
    if (this.isVisible(layerId)) {
      this.removeLayer(layerId);
    } else {
      this.addLayerFromLayersConfig(layerId);
    }
    return this.isVisible(layerId);
  }

  /**
   * Controleert of een laag zichtbaar is.
   *
   * @param layerId ID van de laag
   * @returns `true` indien zichtbaar
   */
  isVisible(layerId: string): boolean {
    return (
      this.wmtsLayerService.isVisible(layerId) ||
      this.geoJsonLayerService.isVisible(layerId) ||
      this.tiles3dLayerService.isVisible(layerId)
    );
  }

  /**
   * Haalt de titel van een laag op.
   *
   * @param layerId ID van de laag
   * @returns Titel of undefined
   */
  getTitle(layerId: string): string | undefined {
    return this.getLayerConfig(layerId)?.title;
  }

  /**
   * Haalt de enabled status van een laag op.
   * Enabled werkt momenteel alleen met {@link cameraValuesShowFunction} op een {@link TilesetConfig}
   *
   * @param layerId ID van de laag
   * @returns Boolean of undefined
   */
  getEnabled(layerId: string): boolean | undefined {
    return this.determineLayerService(layerId)?.getEnabled(layerId);
  }

  public getGeoJsonFeatures(layerId: string): Entity[] {
    return this.geoJsonLayerService.getGeoJsonFeatures(layerId);
  }

  /**
   * Bepaalt het type van een laag.
   *
   * @param layerId ID van de laag
   * @returns {@link Webservice3DType} of undefined
   */
  getTypeOfLayer(layerId: string): Webservice3DType | undefined {
    return this.layerConfigurations.find((service) => {
      return service.layers.some((layer) => {
        return layer.layerId === layerId;
      });
    })?.type;
  }

  /**
   * Zet de zichtbaarheid van meerdere lagen tegelijkertijd.
   * De methode is idempotent: er worden geen dubbele add/remove acties uitgevoerd.
   *
   * @param layerIds Lijst met layerIds
   * @param visible Geeft aan of de lagen zichtbaar moeten zijn
   */
  setVisibilityLayers(layerIds: string[], visible: boolean): void {
    layerIds
      .filter((layerId: string) => layerId !== undefined)
      .forEach((layerId: string) => {
        if (visible && !this.isVisible(layerId)) {
          this.addLayerFromLayersConfig(layerId);
        } else if (!visible && this.isVisible(layerId)) {
          this.removeLayer(layerId);
        }
      });
  }

  private determineLayerService(layerId: string): BaseLayerService | undefined {
    const layerType = this.getTypeOfLayer(layerId);
    if (!layerType) {
      return undefined;
    }
    return this.determineLayerServiceFromType(layerType);
  }

  private determineLayerServiceFromType(
    type: Webservice3DType
  ): BaseLayerService {
    switch (type) {
      case Webservice3DType.GEOJSON:
        return this.geoJsonLayerService;
      case Webservice3DType.TILES3D:
        return this.tiles3dLayerService;
      case Webservice3DType.WMTS:
        return this.wmtsLayerService;
    }
  }

  private addLayerFromLayersConfig(layerId: string) {
    const layerOptions = this.getLayerConfig(layerId);
    const layerType = this.getTypeOfLayer(layerId);
    if (!layerOptions || !layerType) {
      return;
    }
    this.addLayer(layerType, layerOptions);
  }

  private getLayerConfig(layerId: string): LayerConfig | undefined {
    return this.layerConfigurations
      .flatMap((service) => service.layers)
      .find((layer) => layer.layerId === layerId);
  }

  private emitLegendAddedEvent(layerId: string) {
    this.legendAddedSubject.next({
      mapIndex: DEFAULT_CESIUM_MAPINDEX,
      legend: this.getLayerLegend(layerId)
    });
  }

  private emitLegendRemovedEvent(layerId: string) {
    this.legendRemovedSubject.next({
      mapIndex: DEFAULT_CESIUM_MAPINDEX,
      layerId: layerId
    });
  }

  private getLayerLegend(layerId: string): LayerLegend {
    return {
      layerId: layerId,
      legend: this.getLayerConfig(layerId)?.activeLegend,
      serviceTitle: this.getServiceTitleOfLayer(layerId),
      layerTitle: this.getTitle(layerId),
      layerEnabled: this.getEnabled(layerId)
    };
  }

  private getServiceTitleOfLayer(layerId: string): string | undefined {
    return this.layerConfigurations.find((service) => {
      return service.layers.some((layer) => {
        return layer.layerId === layerId;
      });
    })?.title;
  }
}
