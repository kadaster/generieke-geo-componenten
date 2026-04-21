import { inject, Injectable } from "@angular/core";
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
 * Service die gedelegeerde laagbewerkingen uitvoert op basis van het ServiceType.
 *
 * Deze service bepaalt welke specifieke laagservice moet worden aangeroepen
 * voor het verversen of verwijderen van lagen.
 */
@Injectable({
  providedIn: "root"
})
export class GgcSharedLayerService {
  private readonly layerConfigurations: Webservice[] = [];

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

  loadWebservices(services: Webservice[]) {
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
        eventTrigger: LayerChangedEventTrigger.LAYER_ADDED
      });
      return updatedLayer;
    });
  }

  getLayerChangedObservable(): Observable<CesiumLayerChangedEvent> {
    return merge(
      this.geoJsonLayerService.getLayerChangedObservable(),
      this.tiles3dLayerService.getLayerChangedObservable(),
      this.wmtsLayerService.getLayerChangedObservable(),
      this.layerChangedSubject
    );
  }

  getLegendAddedObservable() {
    return this.legendAddedSubject.asObservable();
  }

  getLegendRemovedObservable() {
    return this.legendRemovedSubject.asObservable();
  }

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

  addLayer(type: Webservice3DType, layer: LayerConfig) {
    this.determineLayerServiceFromType(type).addLayer(layer.url!, layer);
  }

  removeLayer(layerId: string): void {
    const service = this.determineLayerService(layerId);
    if (service) {
      service.removeLayer(layerId);
    }
  }

  toggleVisibility(layerId: string): boolean {
    if (this.isVisible(layerId)) {
      this.removeLayer(layerId);
    } else {
      this.addLayerFromLayersConfig(layerId);
    }
    return this.isVisible(layerId);
  }

  isVisible(layerId: string): boolean {
    return (
      this.wmtsLayerService.isVisible(layerId) ||
      this.geoJsonLayerService.isVisible(layerId) ||
      this.tiles3dLayerService.isVisible(layerId)
    );
  }

  getTitle(layerId: string): string | undefined {
    return this.getLayerConfig(layerId)?.title;
  }

  getEnabled(layerId: string): boolean | undefined {
    return this.determineLayerService(layerId)?.getEnabled(layerId);
  }

  getTypeOfLayer(layerId: string): Webservice3DType | undefined {
    return this.layerConfigurations.find((service) => {
      return service.layers.some((layer) => {
        return layer.layerId === layerId;
      });
    })?.type;
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
