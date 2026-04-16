import {
  ApplicationRef,
  createComponent,
  inject,
  Injectable
} from "@angular/core";
import { GgcGeojsonLayerComponent } from "../../layer/geojson-layer/ggc-geojson-layer.component";
import { GeojsonLayerOptions } from "../../layer/model/geojson-layer.model";
import { ImageLayerOptions } from "../../layer/model/image-layer.model";
import { GgcImageLayerComponent } from "../../layer/image-layer/ggc-image-layer.component";
import { VectorTileLayerOptions } from "../../layer/model/vector-tile-layer.model";
import { GgcVectorTileLayerComponent } from "../../layer/vector-tile-layer/ggc-vector-tile-layer.component";
import { WmsLayerOptions } from "../../layer/model/wms-layer.model";
import { WmtsLayerOptions } from "../../layer/model/wmts-layer.model";
import { GgcWmtsLayerComponent } from "../../layer/wmts-layer/ggc-wmts-layer.component";
import { GgcWmsLayerComponent } from "../../layer/wms-layer/ggc-wms-layer.component";
import { GgcMapService } from "../../map/service/ggc-map.service";
import { AbstractConfigurableLayerOptions } from "../../layer/model/abstract-layer.model";
import { GgcLayerBrtAchtergrondkaartComponent } from "../../layer/layer-brt-achtergrondkaart/ggc-layer-brt-achtergrondkaart.component";
import { Webservice } from "../../layer/model/webservice.model";
import BaseLayer from "ol/layer/Base";
import { viewResolutionIsInLayerResolutionRange } from "../../layer/utils/viewResolutionIsInLayerResolutionRange";
import { Observable, Subject } from "rxjs";
import {
  DEFAULT_MAPINDEX,
  LayerChangedEvent,
  LayerChangedEventTrigger,
  LayerLegend,
  LegendAddedEvent,
  LegendRemovedEvent,
  Webservice2DType
} from "@kadaster/ggc-models";

@Injectable({
  providedIn: "root"
})
export class GgcLayerService {
  private readonly mapService = inject(GgcMapService);
  private readonly appRef = inject(ApplicationRef);

  private readonly layerChangedSubject: Subject<LayerChangedEvent> =
    new Subject();
  private readonly legendAddedSubject: Subject<LegendAddedEvent> =
    new Subject();
  private readonly legendRemovedSubject: Subject<LegendRemovedEvent> =
    new Subject();
  private readonly mapConfigurations: Map<string, Webservice[]> = new Map();

  constructor() {
    this.mapService
      .getLayerChangedObservable()
      .subscribe((event: LayerChangedEvent) => {
        this.emitLayerChanged(
          event.layerId,
          event.mapIndex,
          event.eventTrigger
        );
      });
  }

  getLayerChangedObservable(): Observable<LayerChangedEvent> {
    return this.layerChangedSubject.asObservable();
  }

  getLegendAddedObservable(): Observable<LegendAddedEvent> {
    return this.legendAddedSubject.asObservable();
  }

  getLegendRemovedObservable(): Observable<LegendRemovedEvent> {
    return this.legendRemovedSubject.asObservable();
  }

  getCurrentActiveLegends(mapIndex: string): LayerLegend[] {
    const result: LayerLegend[] = [];
    const services = this.mapConfigurations.get(mapIndex) ?? [];
    services.forEach((service) => {
      service.layers.forEach((layer) => {
        const layerId = layer.layerId;
        if (layerId && this.isVisible(layerId, mapIndex)) {
          result.push(this.buildLayerLegend(layerId, mapIndex));
        }
      });
    });
    return result;
  }

  loadWebservices(services: Webservice[], mapIndex: string) {
    this.mapConfigurations.set(mapIndex, services);
    for (const service of services) {
      this.loadWebservice(service, mapIndex);
    }
  }

  private loadWebservice(service: Webservice, mapIndex: string) {
    service.layers = service.layers.map((layerOptions) => {
      const updatedLayer = {
        ...layerOptions,
        url: service.url,
        mapIndex: mapIndex,
        visible: layerOptions.visible ?? true
      } as AbstractConfigurableLayerOptions;
      if (updatedLayer.visible) {
        this.addLayer(updatedLayer, service.type);
      }

      return updatedLayer;
    });
  }

  addBrtAchtergrondkaartLayer(
    layerOptions: AbstractConfigurableLayerOptions
  ): string | undefined {
    if (layerOptions.mapIndex) {
      if (!layerOptions.layerId) {
        //default layerId
        layerOptions.layerId = "brt-achtergrondkaart";
      }
      const componentRef = createComponent(
        GgcLayerBrtAchtergrondkaartComponent,
        {
          environmentInjector: this.appRef.injector
        }
      );
      componentRef.instance.mapIndex = layerOptions.mapIndex;
      componentRef.instance.ngOnInit();
      componentRef.instance["olLayer"].set(
        "ggc-layer-id",
        layerOptions.layerId
      );
      return layerOptions.layerId;
    }
  }

  addLayer(
    layerOptions: AbstractConfigurableLayerOptions,
    webserviceType: Webservice2DType
  ): string | undefined {
    switch (webserviceType) {
      case Webservice2DType.GEOJSON:
        return this.addGeojsonLayer(layerOptions as GeojsonLayerOptions);
      case Webservice2DType.IMAGE:
        return this.addImageLayer(layerOptions as ImageLayerOptions);
      case Webservice2DType.VECTOR:
        return this.addVectorTileLayer(layerOptions as VectorTileLayerOptions);
      case Webservice2DType.WMS:
        return this.addWmsLayer(layerOptions as WmsLayerOptions);
      case Webservice2DType.WMTS:
        return this.addWmtsLayer(layerOptions as WmtsLayerOptions);
      default:
        return undefined;
    }
  }

  addGeojsonLayer(layerOptions: GeojsonLayerOptions): string | undefined {
    if (layerOptions.mapIndex) {
      const componentRef = createComponent(GgcGeojsonLayerComponent, {
        environmentInjector: this.appRef.injector
      });
      componentRef.instance.options = layerOptions;
      componentRef.instance.ngOnInit();
      return componentRef.instance.options.layerId;
    }
  }

  addImageLayer(layerOptions: ImageLayerOptions): string | undefined {
    if (layerOptions.mapIndex) {
      const componentRef = createComponent(GgcImageLayerComponent, {
        environmentInjector: this.appRef.injector
      });
      componentRef.instance.options = layerOptions;
      componentRef.instance.ngOnInit();
      return componentRef.instance.options.layerId;
    }
  }

  addVectorTileLayer(layerOptions: VectorTileLayerOptions): string | undefined {
    if (layerOptions.mapIndex) {
      const componentRef = createComponent(GgcVectorTileLayerComponent, {
        environmentInjector: this.appRef.injector
      });
      componentRef.instance.options = layerOptions;
      componentRef.instance.ngOnInit();
      return componentRef.instance.options.layerId;
    }
  }

  addWmsLayer(layerOptions: WmsLayerOptions): string | undefined {
    if (layerOptions.mapIndex) {
      const componentRef = createComponent(GgcWmsLayerComponent, {
        environmentInjector: this.appRef.injector
      });
      componentRef.instance.options = layerOptions;
      componentRef.instance.ngOnInit();
      return componentRef.instance.options.layerId;
    }
  }

  addWmtsLayer(layerOptions: WmtsLayerOptions): string | undefined {
    if (layerOptions.mapIndex) {
      const componentRef = createComponent(GgcWmtsLayerComponent, {
        environmentInjector: this.appRef.injector
      });
      componentRef.instance.options = layerOptions;
      componentRef.instance.ngOnInit();
      return componentRef.instance.options.layerId;
    }
  }

  removeLayer(mapIndex: string, layerId: string) {
    const layer = this.mapService.getLayer(layerId, mapIndex);
    if (layer) {
      this.mapService.getMap(mapIndex).removeLayer(layer);
      this.emitLayerChanged(
        layerId,
        mapIndex,
        LayerChangedEventTrigger.LAYER_REMOVED
      );
    }
  }

  getLayer(
    layerId: string,
    mapIndex = DEFAULT_MAPINDEX
  ): BaseLayer | undefined {
    return this.mapService.getLayer(layerId, mapIndex);
  }

  getTitle(layerId: string, mapIndex = DEFAULT_MAPINDEX): string | undefined {
    return this.getLayerConfig(layerId, mapIndex)?.title;
  }

  getLegendIndex(
    layerId: string,
    mapIndex = DEFAULT_MAPINDEX
  ): number | undefined {
    return this.getLayerConfig(layerId, mapIndex)?.legendIndex;
  }

  isVisible(layerId: string, mapIndex = DEFAULT_MAPINDEX): boolean {
    return this.mapService.getLayer(layerId, mapIndex) !== undefined;
  }

  toggleVisibility(layerId: string, mapIndex = DEFAULT_MAPINDEX): boolean {
    if (this.isVisible(layerId, mapIndex)) {
      this.removeLayer(mapIndex, layerId);
    } else {
      this.addLayerFromMapConfig(layerId, mapIndex);
    }
    return this.isVisible(layerId, mapIndex);
  }

  getEnabled(layerId: string, mapIndex = DEFAULT_MAPINDEX) {
    let minResolution;
    let maxResolution;
    const layer = this.getLayer(layerId, mapIndex);

    if (layer) {
      minResolution = layer.getMinResolution();
      maxResolution = layer.getMaxResolution();
    } else {
      const layerConfig = this.getLayerConfig(layerId, mapIndex);

      if (!layerConfig) {
        return undefined;
      }

      minResolution = layerConfig.minResolution ?? 0;
      maxResolution = layerConfig.maxResolution ?? Infinity;
    }
    const viewResolution = this.mapService
      .getMap(mapIndex)
      .getView()
      .getResolution();
    if (viewResolution) {
      return viewResolutionIsInLayerResolutionRange(
        viewResolution,
        minResolution,
        maxResolution
      );
    } else {
      return undefined;
    }
  }

  setVisibilityLayers(
    layerIds: string[],
    visible: boolean,
    mapIndex = DEFAULT_MAPINDEX
  ): void {
    layerIds
      .filter((layerId: string) => layerId !== undefined)
      .forEach((layerId: string) => {
        if (visible && !this.isVisible(layerId, mapIndex)) {
          this.addLayerFromMapConfig(layerId, mapIndex);
        } else if (!visible && this.isVisible(layerId, mapIndex)) {
          this.removeLayer(mapIndex, layerId);
        }
      });
  }

  getTypeOfLayer(
    layerId: string,
    mapIndex: string
  ): Webservice2DType | undefined {
    return this.mapConfigurations.get(mapIndex)?.find((service) => {
      return service.layers.some((layer) => {
        return layer.layerId === layerId;
      });
    })?.type;
  }

  getLayerConfig(
    layerId: string,
    mapIndex: string
  ): AbstractConfigurableLayerOptions | undefined {
    return this.mapConfigurations
      .get(mapIndex)
      ?.flatMap((service) => service.layers)
      .find((layer) => layer.layerId === layerId);
  }

  private emitLegendAddedEvent(layerId: string, mapIndex: string) {
    this.legendAddedSubject.next({
      mapIndex: mapIndex,
      legend: this.buildLayerLegend(layerId, mapIndex)
    });
  }

  private buildLayerLegend(layerId: string, mapIndex: string): LayerLegend {
    return {
      layerId: layerId,
      legend: this.getLayerConfig(layerId, mapIndex)?.activeLegend,
      serviceTitle: this.getServiceTitleOfLayer(layerId, mapIndex),
      layerTitle: this.getTitle(layerId, mapIndex),
      layerEnabled: this.getEnabled(layerId, mapIndex),
      legendIndex: this.getLegendIndex(layerId, mapIndex)
    };
  }

  private getServiceTitleOfLayer(
    layerId: string,
    mapIndex: string
  ): string | undefined {
    return this.mapConfigurations.get(mapIndex)?.find((service) => {
      return service.layers.some((layer) => {
        return layer.layerId === layerId;
      });
    })?.title;
  }

  private emitLegendRemovedEvent(layerId: string, mapIndex: string) {
    this.legendRemovedSubject.next({
      mapIndex: mapIndex,
      layerId: layerId
    });
  }

  private addLayerFromMapConfig(layerId: string, mapIndex: string) {
    const layerOptions = this.getLayerConfig(layerId, mapIndex);
    const layerType = this.getTypeOfLayer(layerId, mapIndex);
    if (!layerOptions || !layerType) {
      return;
    }
    this.addLayer(layerOptions, layerType);
  }

  private emitLayerChanged(
    layerId: string,
    mapIndex: string,
    eventTrigger: LayerChangedEventTrigger
  ) {
    this.layerChangedSubject.next({ layerId, mapIndex, eventTrigger });
    if (eventTrigger == LayerChangedEventTrigger.LAYER_ADDED) {
      this.emitLegendAddedEvent(layerId, mapIndex);
    } else if (eventTrigger == LayerChangedEventTrigger.LAYER_REMOVED) {
      this.emitLegendRemovedEvent(layerId, mapIndex);
    }
  }
}
