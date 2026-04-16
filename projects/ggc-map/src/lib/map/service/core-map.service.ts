import { inject, Injectable } from "@angular/core";
import { Collection } from "ol";
import { Control, defaults as defaultControls } from "ol/control";
import { Options as AttributionOptions } from "ol/control/Attribution";
import { Options as RotateOptions } from "ol/control/Rotate";
import { Options as ZoomOptions } from "ol/control/Zoom";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import { defaults as defaultInteractions } from "ol/interaction";
import BaseLayer from "ol/layer/Base";
import VectorLayer from "ol/layer/Vector";
import OlMap from "ol/Map";
import { addProjection } from "ol/proj";
import Projection from "ol/proj/Projection";
import VectorSource from "ol/source/Vector";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style, { StyleLike } from "ol/style/Style";
import View from "ol/View";
import {
  ATTRIBUTION_OPTIONS,
  ROTATE_OPTIONS,
  ZOOM_OPTIONS
} from "../../core/constants";
import { CrsConfig } from "../../core/model/crs-config.model";
import { GgcCrsConfigService } from "../../core/service/ggc-crs-config.service";
import {
  MapComponentEvent,
  MapComponentEventTypes
} from "../../model/map-component-event.model";
import { CoreLoadingService } from "./core-loading.service";
import { Observable, Subject } from "rxjs";
import {
  DEFAULT_MAPINDEX,
  LayerChangedEvent,
  LayerChangedEventTrigger
} from "@kadaster/ggc-models";

@Injectable({
  providedIn: "root"
})
export class CoreMapService {
  private readonly GEOLOCATION_LAYER_ID = "geolocation";
  private readonly crsConfigService = inject(GgcCrsConfigService);
  private readonly coreLoadingService = inject(CoreLoadingService);
  private readonly zoomOptions = inject<ZoomOptions | null>(ZOOM_OPTIONS, {
    optional: true
  });
  private readonly rotateOptions = inject<RotateOptions | null>(
    ROTATE_OPTIONS,
    { optional: true }
  );
  private readonly attributionOptions = inject<AttributionOptions | null>(
    ATTRIBUTION_OPTIONS,
    { optional: true }
  );

  private readonly rdNewProjection: Projection;
  private readonly olMaps: Map<string, OlMap> = new Map();
  private readonly rdNewConfig: CrsConfig;
  private extraLayers: string[] = ["selection", "highlight"];
  private readonly extraLayersMap: Map<
    string,
    VectorLayer<VectorSource<Feature<Geometry>>>
  > = new Map();

  private readonly LayerChangedSubject: Subject<LayerChangedEvent> =
    new Subject();

  getLayerChangedObservable(): Observable<LayerChangedEvent> {
    return this.LayerChangedSubject.asObservable();
  }

  constructor() {
    this.rdNewConfig = this.crsConfigService.getRdNewCrsConfig();
    this.rdNewProjection = new Projection({
      code: this.rdNewConfig.projectionCode,
      extent: this.rdNewConfig.extent,
      units: this.rdNewConfig.units,
      // workaround for showing correct scale in scaleLineComponent
      // https://github.com/openlayers/openlayers/issues/7309#issuecomment-343433613
      getPointResolution(resolution: number) {
        return resolution;
      }
    });
    addProjection(this.rdNewProjection);
  }

  createAndGetMap(
    mapIndex?: string,
    minZoomLevel = 0,
    maxZoomLevel = 14
  ): OlMap {
    // this method create a map and sets number of resolutions,
    // should only be called once from map.component.ts
    mapIndex = mapIndex ?? DEFAULT_MAPINDEX;

    if (!this.olMaps.has(mapIndex)) {
      // create a new map and drawlayer for this map
      const newMap = this.createNewOlMap();
      this.olMaps.set(mapIndex, newMap);
      newMap.getLayers().on("add", (event) => {
        this.LayerChangedSubject.next({
          layerId: event.element.get("ggc-layer-id"),
          mapIndex,
          eventTrigger: LayerChangedEventTrigger.LAYER_ADDED
        });
      });
    }
    const map = this.olMaps.get(mapIndex) as OlMap;

    map.setView(
      new View({
        projection: this.rdNewProjection,
        resolutions: this.rdNewConfig.resolutions.slice(0, maxZoomLevel + 1),
        center: [160000, 455000]
      })
    );

    // call setMinZoom after the view is created, because according to the documentation minZoom is ignored
    // if resolutions is set in ViewOptions
    // see: https://openlayers.org/en/latest/apidoc/module-ol_View-View.html
    map.getView().setMinZoom(Math.floor(minZoomLevel));
    this.coreLoadingService.addMapLoaders(mapIndex, map);
    this.createExtraLayers(mapIndex);
    return map;
  }

  createLayerAndAddToMap(
    mapIndex: string,
    style?: StyleLike
  ): VectorLayer<VectorSource<Feature<Geometry>>> {
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style
    });
    // add layer as an un-managed layer, the un-managed layer will always be on top.
    // https://openlayers.org/en/v5.3.0/apidoc/module-ol_layer_Layer-Layer.html#setMap
    const map = this.getMap(mapIndex);
    vectorLayer.setMap(map);
    return vectorLayer;
  }

  getMap(mapIndex?: string): OlMap {
    mapIndex = mapIndex ?? DEFAULT_MAPINDEX;
    if (!this.olMaps.has(mapIndex)) {
      this.olMaps.set(mapIndex, this.createNewOlMap());
    }
    return this.olMaps.get(mapIndex) as OlMap;
  }

  getLayer(
    layerId: string,
    mapIndex = DEFAULT_MAPINDEX
  ): BaseLayer | undefined {
    const map = this.getMap(mapIndex);
    return map
      .getLayers()
      .getArray()
      .find((layer) => layer.get("ggc-layer-id") === layerId);
  }

  getExtraLayer(
    layer: string,
    mapIndex = DEFAULT_MAPINDEX
  ): VectorLayer<VectorSource<Feature<Geometry>>> | undefined {
    let extraLayer = this.extraLayersMap.get(`${mapIndex}-${layer}`);
    if (!extraLayer && layer === this.GEOLOCATION_LAYER_ID) {
      extraLayer = this.createGeolocationLayer(mapIndex);
    }
    return extraLayer;
  }

  checkMapIndex(mapIndex = DEFAULT_MAPINDEX): boolean {
    mapIndex = mapIndex ?? DEFAULT_MAPINDEX;
    return this.olMaps.has(mapIndex);
  }

  destroyMap(mapIndex: string) {
    this.olMaps.delete(mapIndex);
    this.extraLayers.forEach((layer) => {
      this.extraLayersMap.delete(`${mapIndex}-${layer}`);
    });
    this.coreLoadingService.removeMapLoaders(mapIndex);
  }

  decideMapComponentEventType(
    mapExists: boolean,
    mapIndex?: string
  ): MapComponentEvent {
    mapIndex = mapIndex ?? DEFAULT_MAPINDEX;
    if (mapExists) {
      return new MapComponentEvent(
        MapComponentEventTypes.SUCCESSFUL,
        mapIndex,
        "Methode succesvol uitgevoerd"
      );
    }
    return new MapComponentEvent(
      MapComponentEventTypes.UNSUCCESSFUL,
      mapIndex,
      `Mapindex bestaat niet voor index: ${mapIndex}`
    );
  }

  addFeaturesToHighlightLayer(
    features: Feature<Geometry>[],
    mapIndex: string
  ): MapComponentEvent {
    if (this.checkMapIndex(mapIndex)) {
      // We know for sure that the selectionLayer exists; checkMapIndex indirectly checks this
      const highlightLayerSource = this.getHighlightLayerSource(
        mapIndex
      ) as VectorSource<Feature<Geometry>>;
      highlightLayerSource.addFeatures(features);
      return this.decideMapComponentEventType(true, mapIndex);
    }
    return this.decideMapComponentEventType(false, mapIndex);
  }

  clearHighlightLayer(mapIndex: string): MapComponentEvent {
    if (this.checkMapIndex(mapIndex)) {
      const highlightLayerSource = this.getHighlightLayerSource(mapIndex);
      if (highlightLayerSource) {
        highlightLayerSource.clear();
      }
      return this.decideMapComponentEventType(true, mapIndex);
    }
    return this.decideMapComponentEventType(false, mapIndex);
  }

  changeHighlightLayerStyle(styleLike: StyleLike, mapIndex: string) {
    this.changeLayerStyle(styleLike, mapIndex, "highlight");
  }

  addFeaturesToSelectionLayer(
    features: Feature<Geometry>[],
    mapIndex: string
  ): MapComponentEvent {
    if (this.checkMapIndex(mapIndex)) {
      // We know for sure that the selectionLayer exists, checkMapIndex indirectly checks that
      const selectionSource = this.getSelectionLayerSource(
        mapIndex
      ) as VectorSource<Feature<Geometry>>;
      selectionSource.addFeatures(features);
      return this.decideMapComponentEventType(true, mapIndex);
    }
    return this.decideMapComponentEventType(false, mapIndex);
  }

  clearSelectionLayer(mapIndex: string): MapComponentEvent {
    if (this.checkMapIndex(mapIndex)) {
      const selectionLayerSource = this.getSelectionLayerSource(
        mapIndex
      ) as VectorSource<Feature<Geometry>>;
      selectionLayerSource?.clear();
      return this.decideMapComponentEventType(true, mapIndex);
    }
    return this.decideMapComponentEventType(false, mapIndex);
  }

  changeSelectionLayerStyle(styleLike: StyleLike, mapIndex: string) {
    this.changeLayerStyle(styleLike, mapIndex, "selection");
  }

  changeLayerStyle(styleLike: StyleLike, mapIndex: string, layername: string) {
    const layer = this.extraLayersMap.get(`${mapIndex}-${layername}`);
    layer?.setStyle(styleLike);
  }

  setExtraLayers(layers: string[]): void {
    this.extraLayers = [...this.extraLayers, ...layers];
  }

  private createGeolocationLayer(
    mapIndex: string
  ): VectorLayer<VectorSource<Feature<Geometry>>> {
    const layer = this.createLayerAndAddToMap(mapIndex, new Style());
    this.extraLayers.push(this.GEOLOCATION_LAYER_ID);
    this.extraLayersMap.set(`${mapIndex}-${this.GEOLOCATION_LAYER_ID}`, layer);
    return layer;
  }

  private createNewOlMap(): OlMap {
    return new OlMap({
      controls: this.getControls(),
      interactions: defaultInteractions({
        // Is always set to false because of the interaction with the tabindex if it's provided.
        // If no tabindex is provided, it does nothing.
        onFocusOnly: false
      }),
      layers: [],
      view: new View({
        projection: this.rdNewProjection
      })
    });
  }

  private getControls(): Collection<Control> {
    const zoomOptions = this.zoomOptions || undefined;
    const rotateOptions = this.rotateOptions || undefined;
    const attributionOptions = this.attributionOptions || undefined;
    if (zoomOptions?.zoomInLabel instanceof HTMLElement) {
      zoomOptions.zoomInLabel = this.clone(zoomOptions.zoomInLabel);
    }

    if (zoomOptions?.zoomOutLabel instanceof HTMLElement) {
      zoomOptions.zoomOutLabel = this.clone(zoomOptions.zoomOutLabel);
    }

    if (rotateOptions?.label instanceof HTMLElement) {
      rotateOptions.label = this.clone(rotateOptions.label);
    }

    if (attributionOptions?.label instanceof HTMLElement) {
      attributionOptions.label = this.clone(attributionOptions.label);
    }
    if (attributionOptions?.collapseLabel instanceof HTMLElement) {
      attributionOptions.collapseLabel = this.clone(
        attributionOptions.collapseLabel
      );
    }

    return defaultControls({ rotateOptions, zoomOptions, attributionOptions });
  }

  private clone(element: HTMLElement): HTMLElement {
    return element.cloneNode(true) as HTMLElement;
  }

  private getHighlightLayerSource(
    mapIndex: string
  ): VectorSource<Feature<Geometry>> | null | undefined {
    return this.extraLayersMap.get(`${mapIndex}-highlight`)?.getSource();
  }

  private getSelectionLayerSource(
    mapIndex: string
  ): VectorSource<Feature<Geometry>> | null | undefined {
    return this.extraLayersMap.get(`${mapIndex}-selection`)?.getSource();
  }

  private createExtraLayers(mapIndex: string): void {
    // Order in which the selection- and highlightlayer are created is important!
    // The selection layer should be added to the map before the highlight layer is added.
    this.extraLayers.forEach((layername) => {
      const layer = this.createLayerAndAddToMap(mapIndex, new Style());
      this.extraLayersMap.set(`${mapIndex}-${layername}`, layer);
    });

    this.setDefaultHighlightLayerStyle(mapIndex);
    this.setDefaultSelectionLayerStyle(mapIndex);
  }

  private setDefaultHighlightLayerStyle(mapIndex: string): void {
    const highlightStyle = new Style({
      fill: new Fill({
        color: "rgba(0, 115, 149, 0.5)"
      }),
      stroke: new Stroke({
        color: "#007395",
        width: 5
      }),
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({
          color: "rgba(0, 115, 149, 0.5)"
        }),
        stroke: new Stroke({
          color: "#007395",
          width: 5
        })
      })
    });
    const layer = this.extraLayersMap.get(`${mapIndex}-highlight`);
    layer?.setStyle(highlightStyle);
  }

  private setDefaultSelectionLayerStyle(mapIndex: string): void {
    const fill = new Fill({
      color: "rgba(255,255,255,0.5)"
    });
    const stroke = new Stroke({
      color: "#0093be",
      width: 4
    });
    const selectionStyle = new Style({
      fill,
      stroke,
      image: new CircleStyle({
        fill,
        stroke,
        radius: 5
      })
    });
    const layer = this.extraLayersMap.get(`${mapIndex}-selection`);
    layer?.setStyle(selectionStyle);
  }
}
