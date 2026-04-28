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

/**
 * Centrale service voor het beheren van kaartlagen binnen GGC.
 *
 * Verantwoordelijkheden:
 * - Laden en configureren van webservices en lagen
 * - Dynamisch toevoegen/verwijderen van kaartlagen
 * - Synchroniseren van layer‑wijzigingen en legenda‑events
 * - Bieden van query‑API’s voor zichtbaarheid, status en metadata
 *
 * Deze service fungeert als orchestrator tussen:
 * - configuratie (Webservice / LayerOptions)
 * - OpenLayers Map
 * - UI‑componenten (legenda, toggles)
 */
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

  /**
   * Initialiseert de service en luistert naar
   * layer changes vanuit de GgcMapService.
   */
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

  /**
   * Observable voor layer change events.
   */
  getLayerChangedObservable(): Observable<LayerChangedEvent> {
    return this.layerChangedSubject.asObservable();
  }

  /**
   * Observable die wordt getriggerd
   * wanneer een legenda wordt toegevoegd.
   */
  getLegendAddedObservable(): Observable<LegendAddedEvent> {
    return this.legendAddedSubject.asObservable();
  }

  /**
   * Observable die wordt getriggerd
   * wanneer een legenda wordt verwijderd.
   */
  getLegendRemovedObservable(): Observable<LegendRemovedEvent> {
    return this.legendRemovedSubject.asObservable();
  }

  /**
   * Geeft alle actieve legenda‑items terug voor de opgegeven kaart.
   */
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

  /**
   * Laadt een lijst van webservices
   * en voegt hun zichtbare lagen toe aan de kaart.
   */
  loadWebservices(services: Webservice[], mapIndex: string) {
    this.mapConfigurations.set(mapIndex, services);
    for (const service of services) {
      this.loadWebservice(service, mapIndex);
    }
  }

  /**
   * Initialiseert lagen van één webservice en voegt deze toe aan de kaart
   */
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

  /**
   * Voegt een BRT achtergrondkaart toe aan de kaart.
   */
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

  /**
   * Voegt een laag toe aan de kaart op basis van het webservice‑type.
   */
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

  /**
   * Voegt een geojson laag toe aan de kaart.
   */
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

  /**
   * Voegt een image laag toe aan de kaart.
   */
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

  /**
   * Voegt een vector tile laag toe aan de kaart.
   */
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

  /**
   * Voegt een wms laag toe aan de kaart.
   */
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

  /**
   * Voegt een wmts laag toe aan de kaart.
   */
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

  /**
   * Verwijdert een laag van de kaart en triggert een layer removed event.
   */
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

  /**
   * Vraagt een laag op van de kaart.
   */
  getLayer(
    layerId: string,
    mapIndex = DEFAULT_MAPINDEX
  ): BaseLayer | undefined {
    return this.mapService.getLayer(layerId, mapIndex);
  }

  /**
   * Geeft de titel van een laag terug op basis van de configuratie.
   */
  getTitle(layerId: string, mapIndex = DEFAULT_MAPINDEX): string | undefined {
    return this.getLayerConfig(layerId, mapIndex)?.title;
  }

  /**
   * Geeft de legenda‑index van een laag terug.
   *
   * De legenda‑index bepaalt de volgorde waarin legenda‑items
   * worden weergegeven in de gebruikersinterface.
   */
  getLegendIndex(
    layerId: string,
    mapIndex = DEFAULT_MAPINDEX
  ): number | undefined {
    return this.getLayerConfig(layerId, mapIndex)?.legendIndex;
  }

  /**
   * Controleert of een laag zichtbaar is.
   */
  isVisible(layerId: string, mapIndex = DEFAULT_MAPINDEX): boolean {
    return this.mapService.getLayer(layerId, mapIndex) !== undefined;
  }

  /**
   * Wisselt de zichtbaarheid van een laag.
   */
  toggleVisibility(layerId: string, mapIndex = DEFAULT_MAPINDEX): boolean {
    if (this.isVisible(layerId, mapIndex)) {
      this.removeLayer(mapIndex, layerId);
    } else {
      this.addLayerFromMapConfig(layerId, mapIndex);
    }
    return this.isVisible(layerId, mapIndex);
  }

  /**
   * Bepaalt of een laag momenteel *enabled* is op basis van resolutie.
   *
   * Een laag wordt als enabled beschouwd wanneer de huidige kaartresolutie
   * binnen de minimale en maximale resolutiegrenzen van de laag valt.
   *
   * De resolutiegrenzen worden:
   * - bij voorkeur gehaald uit de actieve OpenLayers layer
   * - anders uit de laagconfiguratie
   */
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

  /**
   * Zet de zichtbaarheid van meerdere lagen tegelijkertijd.
   *
   * Per laag wordt gecontroleerd of:
   * - deze toegevoegd moet worden (visible = true)
   * - of verwijderd moet worden (visible = false)
   *
   * De methode is idempotent: er worden geen dubbele add/remove acties uitgevoerd.
   */
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

  /**
   * Geeft het webservice‑type van een laag terug.
   *
   * Het type wordt bepaald aan de hand van de configuratie
   * van de webservice waarin de laag is gedefinieerd.
   */
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

  /**
   * Haalt de configuratie van een laag op.
   *
   * De configuratie bevat metadata zoals:
   * - titel
   * - legendainformatie
   * - resolutie‑instellingen
   */
  getLayerConfig(
    layerId: string,
    mapIndex: string
  ): AbstractConfigurableLayerOptions | undefined {
    return this.mapConfigurations
      .get(mapIndex)
      ?.flatMap((service) => service.layers)
      .find((layer) => layer.layerId === layerId);
  }

  /**
   * Emit een event dat aangeeft dat een legenda is toegevoegd.
   */
  private emitLegendAddedEvent(layerId: string, mapIndex: string) {
    this.legendAddedSubject.next({
      mapIndex: mapIndex,
      legend: this.buildLayerLegend(layerId, mapIndex)
    });
  }

  /**
   * Bouwt een legenda‑object op basis van de actuele laagstatus.
   *
   * Het resultaat combineert configuratie‑informatie
   * met runtime‑status (enabled / zichtbaar).
   */
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

  /**
   * Geeft de titel terug van de webservice waartoe een laag behoort.
   */
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

  /**
   * Emit een event dat aangeeft dat een legenda is verwijderd.
   */
  private emitLegendRemovedEvent(layerId: string, mapIndex: string) {
    this.legendRemovedSubject.next({
      mapIndex: mapIndex,
      layerId: layerId
    });
  }

  /**
   * Voegt een laag toe op basis van de kaartconfiguratie.
   *
   * Wordt gebruikt bij:
   * - togglen van zichtbaarheid
   * - batch‑operaties
   */
  private addLayerFromMapConfig(layerId: string, mapIndex: string) {
    const layerOptions = this.getLayerConfig(layerId, mapIndex);
    const layerType = this.getTypeOfLayer(layerId, mapIndex);
    if (!layerOptions || !layerType) {
      return;
    }
    this.addLayer(layerOptions, layerType);
  }

  /**
   * Emit een layer changed event
   * en synchroniseert legenda‑events.
   */
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
