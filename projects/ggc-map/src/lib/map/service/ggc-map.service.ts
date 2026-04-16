import { inject, Injectable } from "@angular/core";
import { Coordinate } from "ol/coordinate";
import Feature from "ol/Feature";
import WKT from "ol/format/WKT";
import { Geometry } from "ol/geom";
import Point from "ol/geom/Point";
import BaseLayer from "ol/layer/Base";
import VectorLayer from "ol/layer/Vector";
import OlMap from "ol/Map";
import MapBrowserEvent from "ol/MapBrowserEvent";
import VectorSource from "ol/source/Vector";
import { StyleLike } from "ol/style/Style";
import {
  MapComponentEvent,
  MapComponentEventTypes
} from "../../model/map-component-event.model";
import { CoreMapService } from "./core-map.service";
import { SearchResultDoc } from "./SearchResultDoc.model";
import { Extent } from "ol/extent";
import { ZoomOptions } from "./ZoomOptions.model";
import { GeoJSON } from "ol/format";
import { FormatType } from "../../enum/format-type";
import { Observable } from "rxjs";
import { DEFAULT_MAPINDEX, LayerChangedEvent } from "@kadaster/ggc-models";

@Injectable({
  providedIn: "root"
})
export class GgcMapService {
  private readonly coreMapService = inject(CoreMapService);

  getLayerChangedObservable(): Observable<LayerChangedEvent> {
    return this.coreMapService.getLayerChangedObservable();
  }

  getMap(mapIndex?: string): OlMap {
    return this.coreMapService.getMap(mapIndex);
  }

  getLayer(
    layerId: string,
    mapIndex = DEFAULT_MAPINDEX
  ): BaseLayer | undefined {
    return this.coreMapService.getLayer(layerId, mapIndex);
  }

  getExtraLayer(
    layer: string,
    mapIndex = DEFAULT_MAPINDEX
  ): VectorLayer<VectorSource<Feature<Geometry>>> | undefined {
    return this.coreMapService.getExtraLayer(layer, mapIndex);
  }

  getMaxZIndex(mapIndex?: string): number {
    let maxZIndex = Number.MIN_SAFE_INTEGER;
    for (const layer of this.getMap(mapIndex).getAllLayers()) {
      if (layer.getVisible()) {
        const zIndex = layer.getZIndex() ?? 0;
        if (zIndex! > maxZIndex) {
          maxZIndex = zIndex!;
        }
      }
    }
    return maxZIndex;
  }

  zoomToCoordinate(
    coord: Coordinate,
    mapIndex = DEFAULT_MAPINDEX,
    maxZoom?: number
  ): Promise<MapComponentEvent> {
    return new Promise<MapComponentEvent>((resolve) => {
      if (this.coreMapService.checkMapIndex(mapIndex)) {
        const map = this.coreMapService.getMap(mapIndex);

        const zoom = () => {
          map.getView().fit([...coord, ...coord], { maxZoom });
          resolve(
            this.coreMapService.decideMapComponentEventType(true, mapIndex)
          );
        };

        if (map.isRendered()) {
          zoom();
        } else {
          map.once("loadend", () => {
            zoom();
          });
        }
      }
      resolve(this.coreMapService.decideMapComponentEventType(false, mapIndex));
    });
  }

  /**
   * @deprecated
   * In de volgende major versie krijgt 'zoomToGeometry' de properties van 'zoomToGeometryWithZoomOptions'
   **/
  zoomToGeometry(
    geometry: string | Geometry,
    mapIndex = DEFAULT_MAPINDEX,
    maxZoom?: number,
    formatType = FormatType.WKT
  ): MapComponentEvent {
    return this.zoomToGeometryWithZoomOptions(
      geometry,
      {
        mapIndex,
        fitOptions: { maxZoom }
      },
      formatType
    );
  }

  /**
   * @deprecated
   **/
  zoomToGeometryWithZoomOptions(
    geometry: string | Geometry,
    zoomOptions: ZoomOptions,
    formatType = FormatType.WKT
  ): MapComponentEvent {
    const mapIndex = zoomOptions?.mapIndex;
    if (this.coreMapService.checkMapIndex(mapIndex)) {
      const geom: Geometry =
        geometry instanceof Geometry
          ? geometry
          : this.transformStringToGeometry(geometry, formatType);
      const extent: Extent = geom.getExtent();
      this.coreMapService
        .getMap(mapIndex)
        .getView()
        .fit(extent, zoomOptions?.fitOptions);
      return this.coreMapService.decideMapComponentEventType(true, mapIndex);
    }
    return this.coreMapService.decideMapComponentEventType(false, mapIndex);
  }

  zoomToExtent(bbox: Extent, zoomOptions?: ZoomOptions): MapComponentEvent {
    const mapIndex = zoomOptions?.mapIndex ?? DEFAULT_MAPINDEX;
    if (this.coreMapService.checkMapIndex(mapIndex)) {
      this.coreMapService
        .getMap(mapIndex)
        .getView()
        .fit(bbox, zoomOptions?.fitOptions);
      return this.coreMapService.decideMapComponentEventType(true, mapIndex);
    }
    return this.coreMapService.decideMapComponentEventType(false, mapIndex);
  }

  markFeature(
    geometry: string | Geometry,
    mapIndex = DEFAULT_MAPINDEX,
    formatType = FormatType.WKT
  ): MapComponentEvent {
    if (this.coreMapService.checkMapIndex(mapIndex)) {
      const geom: Geometry =
        geometry instanceof Geometry
          ? geometry
          : this.transformStringToGeometry(geometry, formatType);

      this.clearHighlightLayer(mapIndex);
      this.addFeaturesToHighlightLayer(
        [new Feature({ geometry: geom })],
        mapIndex
      );

      return this.coreMapService.decideMapComponentEventType(true, mapIndex);
    }
    return this.coreMapService.decideMapComponentEventType(false, mapIndex);
  }

  private transformStringToGeometry(
    geometry: string,
    formatType = FormatType.WKT
  ): Geometry {
    switch (formatType) {
      case FormatType.GEOJSON:
        return new GeoJSON().readGeometry(geometry);
      case FormatType.WKT:
      default:
        return new WKT().readGeometry(geometry);
    }
  }

  /**
   * @deprecated
   **/
  zoomToPdokResult(
    evt: any,
    mapIndex?: string,
    maxZoom?: number
  ): MapComponentEvent {
    return this.zoomToPdokResultWithZoomOptions(evt, {
      mapIndex,
      fitOptions: { maxZoom }
    });
  }

  /**
   * @deprecated
   **/
  zoomToPdokResultWithZoomOptions(
    evt: any,
    zoomOptions: ZoomOptions
  ): MapComponentEvent {
    if (this.coreMapService.checkMapIndex(zoomOptions.mapIndex)) {
      const coordinates = this.getCoordinatesFromEvent(evt);
      return coordinates
        ? this.zoomToGeometryWithZoomOptions(coordinates, zoomOptions)
        : new MapComponentEvent(
            MapComponentEventTypes.UNSUCCESSFUL,
            zoomOptions.mapIndex || DEFAULT_MAPINDEX,
            "Coordinaat voor zoomToPdokResult op de kaart kon niet worden bepaald"
          );
    }
    return this.coreMapService.decideMapComponentEventType(
      false,
      zoomOptions.mapIndex
    );
  }

  /**
   * @deprecated
   **/
  zoomToPdokResultAndSimulateClick(
    evt: any,
    mapIndex?: string,
    maxZoom?: number
  ): MapComponentEvent {
    return this.zoomToPdokResultAndSimulateClickWithZoomOptions(evt, {
      mapIndex,
      fitOptions: { maxZoom }
    });
  }

  /**
   * @deprecated
   **/
  zoomToPdokResultAndSimulateClickWithZoomOptions(
    evt: any,
    zoomOptions: ZoomOptions
  ): MapComponentEvent {
    const mapIndex = zoomOptions.mapIndex;
    if (this.coreMapService.checkMapIndex(zoomOptions.mapIndex)) {
      this.zoomToPdokResultWithZoomOptions(evt, zoomOptions);
      const coordinate = this.getCentroidRdFromPdokResult(evt);
      if (!coordinate) {
        return new MapComponentEvent(
          MapComponentEventTypes.UNSUCCESSFUL,
          mapIndex || DEFAULT_MAPINDEX,
          "Coordinaat voor simuleren klik op de kaart kon niet worden bepaald"
        );
      } else {
        const map = this.coreMapService.getMap(mapIndex);
        // het is niet mogelijk de ol.MapBrowserEvent constructor
        // te gebruiken vandaar deze manier van event creatie
        const browserEvent: MapBrowserEvent = {
          type: "singleclick",
          map: this.getMap(mapIndex),
          coordinate,
          pixel: map.getPixelFromCoordinate(coordinate)
        } as MapBrowserEvent;
        map.dispatchEvent(browserEvent);
        return this.coreMapService.decideMapComponentEventType(true, mapIndex);
      }
    }
    return this.coreMapService.decideMapComponentEventType(false, mapIndex);
  }

  /**
   * @deprecated
   **/
  zoomToPdokResultAndMark(
    evt: any,
    mapIndex?: string,
    maxZoom?: number
  ): MapComponentEvent {
    return this.zoomToPdokResultAndMarkWithZoomOptions(evt, {
      mapIndex,
      fitOptions: { maxZoom }
    });
  }

  /**
   * @deprecated
   **/
  zoomToPdokResultAndMarkWithZoomOptions(
    evt: any,
    zoomOptions: ZoomOptions
  ): MapComponentEvent {
    const mapIndex = zoomOptions.mapIndex;
    if (this.coreMapService.checkMapIndex(mapIndex)) {
      this.zoomToPdokResultWithZoomOptions(evt, zoomOptions);
      const coordinates = this.getCoordinatesFromEvent(evt);
      if (coordinates) {
        const olFeature: Feature<Geometry>[] = new WKT().readFeatures(
          coordinates
        );
        this.clearHighlightLayer(mapIndex);
        this.addFeaturesToHighlightLayer(olFeature, mapIndex);
        return this.coreMapService.decideMapComponentEventType(true, mapIndex);
      } else {
        return new MapComponentEvent(
          MapComponentEventTypes.UNSUCCESSFUL,
          mapIndex || DEFAULT_MAPINDEX,
          "Coordinaat voor zoomToPdokResultAndMark op de kaart kon niet worden bepaald"
        );
      }
    }
    return this.coreMapService.decideMapComponentEventType(false, mapIndex);
  }

  /**
   * @deprecated
   **/
  getCentroidRdFromPdokResult(evt: any): Coordinate | undefined {
    let coordinateRd: Coordinate | undefined;
    const pdokDoc: SearchResultDoc | undefined =
      this.getSearchResultDocFromEvent(evt);
    if (pdokDoc) {
      const centroidRd = pdokDoc.centroide_rd;
      if (centroidRd) {
        // Een centroide is een punt, dus we weten dat het een point betreft, vandaar de cast.
        const point: Point = this.transformStringToGeometry(
          centroidRd
        ) as Point;
        coordinateRd = point.getCoordinates();
      }
    }
    return coordinateRd;
  }

  /**
   * @deprecated
   **/
  getGeometryFromPdokResult(evt: any): Geometry | undefined {
    let geometry: Geometry | undefined;
    const pdokDoc: SearchResultDoc | undefined =
      this.getSearchResultDocFromEvent(evt);
    if (pdokDoc) {
      const geometryRd = pdokDoc.geometrie_rd;
      if (geometryRd) {
        const readGeometry: Geometry = new WKT().readGeometry(geometryRd);
        geometry = readGeometry.getSimplifiedGeometry(0);
      }
    }
    return geometry;
  }

  addFeaturesToHighlightLayer(
    features: Feature<Geometry>[],
    mapIndex: string = DEFAULT_MAPINDEX
  ): MapComponentEvent {
    return this.coreMapService.addFeaturesToHighlightLayer(features, mapIndex);
  }

  clearHighlightLayer(mapIndex: string = DEFAULT_MAPINDEX): MapComponentEvent {
    return this.coreMapService.clearHighlightLayer(mapIndex);
  }

  changeHighlightLayerStyle(
    styleLike: StyleLike,
    mapIndex: string = DEFAULT_MAPINDEX
  ) {
    this.coreMapService.changeHighlightLayerStyle(styleLike, mapIndex);
  }

  addFeaturesToSelectionLayer(
    features: Feature<Geometry>[],
    mapIndex: string = DEFAULT_MAPINDEX
  ): MapComponentEvent {
    return this.coreMapService.addFeaturesToSelectionLayer(features, mapIndex);
  }

  clearSelectionLayer(mapIndex: string = DEFAULT_MAPINDEX): MapComponentEvent {
    return this.coreMapService.clearSelectionLayer(mapIndex);
  }

  changeSelectionLayerStyle(
    styleLike: StyleLike,
    mapIndex: string = DEFAULT_MAPINDEX
  ) {
    this.coreMapService.changeSelectionLayerStyle(styleLike, mapIndex);
  }

  isMaxZoomlevel(mapIndex: string = DEFAULT_MAPINDEX): boolean {
    const view = this.coreMapService.getMap(mapIndex).getView();
    return view.getZoom() === view.getMaxZoom();
  }

  private getGeometrieOrCentroide(pdokDoc: SearchResultDoc) {
    if (pdokDoc.geometrie_rd) {
      return pdokDoc.geometrie_rd;
    }
    if (pdokDoc.centroide_rd) {
      return pdokDoc.centroide_rd;
    }
  }

  private getSearchResultDocFromEvent(evt: any): SearchResultDoc | undefined {
    let pdokDoc: SearchResultDoc | undefined;
    if (evt.value && evt.value.docs && evt.value.docs.length > 0) {
      pdokDoc = evt.value.docs[0];
    }
    return pdokDoc;
  }

  private getCoordinatesFromEvent(evt: SearchResultDoc): string | undefined {
    let coordinates: string | undefined;
    const pdokDoc = this.getSearchResultDocFromEvent(evt);
    if (pdokDoc) {
      const geometrieOrCentroide = this.getGeometrieOrCentroide(pdokDoc);
      if (geometrieOrCentroide) {
        coordinates = geometrieOrCentroide;
      }
    }
    return coordinates;
  }
}
