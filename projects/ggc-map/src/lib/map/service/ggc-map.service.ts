import { inject, Injectable } from "@angular/core";
import { Coordinate } from "ol/coordinate";
import Feature from "ol/Feature";
import WKT from "ol/format/WKT";
import { Geometry } from "ol/geom";
import BaseLayer from "ol/layer/Base";
import VectorLayer from "ol/layer/Vector";
import OlMap from "ol/Map";
import VectorSource from "ol/source/Vector";
import { StyleLike } from "ol/style/Style";
import { MapComponentEvent } from "../../model/map-component-event.model";
import { CoreMapService } from "./core-map.service";
import { SearchResultDoc } from "./SearchResultDoc.model";
import { Extent } from "ol/extent";
import { ZoomOptions } from "./ZoomOptions.model";
import { GeoJSON } from "ol/format";
import { FormatType } from "../../enum/format-type";
import { Observable } from "rxjs";
import {
  DEFAULT_MAPINDEX,
  LayerChangedEvent
} from "@kadaster/ggc-models";

/**
 * Service die kaartfunctionaliteit aanbiedt voor:
 *
 * - Opvragen van kaarten en lagen
 * - Zoomen naar coördinaten, geometrieën en extensies
 * - Highlight- en selection-lagen beheren
 * - Interactie met (PDOK) zoekresultaten
 *
 * Deze service abstraheert OpenLayers-details en zorgt voor consistente
 * {@link MapComponentEvent}-afhandeling.
 */

@Injectable({
  providedIn: "root"
})
export class GgcMapService {
  private readonly coreMapService = inject(CoreMapService);

  /**
   * Geeft een observable die notificaties uitstuurt wanneer lagen wijzigen.
   *
   * @returns Observable met {@link LayerChangedEvent}
   */
  getLayerChangedObservable(): Observable<LayerChangedEvent> {
    return this.coreMapService.getLayerChangedObservable();
  }

  /**
   * Haalt een OpenLayers map op, op basis van mapIndex.
   *
   * @param mapIndex Optionele kaartindex (default: DEFAULT_MAPINDEX)
   * @returns OpenLayers {@link OlMap}
   */
  getMap(mapIndex?: string): OlMap {
    return this.coreMapService.getMap(mapIndex);
  }

  /**
   * Haalt een kaartlaag op, op basis van layerID en mapIndex.
   *
   * @param layerId Unieke laag-id
   * @param mapIndex Optionele kaartindex (default: DEFAULT_MAPINDEX)
   * @returns De kaartlaag of `undefined` indien niet gevonden
   */
  getLayer(
    layerId: string,
    mapIndex = DEFAULT_MAPINDEX
  ): BaseLayer | undefined {
    return this.coreMapService.getLayer(layerId, mapIndex);
  }

  /**
   * Haalt een extra vectorlaag op (bijvoorbeeld highlight- of selectionlaag),
   * op basis van een layerName en mapIndex.
   *
   * @param layer Naam van de extra laag
   * @param mapIndex Optionele kaartindex (default: DEFAULT_MAPINDEX)
   * @returns VectorLayer of `undefined`
   */
  getExtraLayer(
    layer: string,
    mapIndex = DEFAULT_MAPINDEX
  ): VectorLayer<VectorSource<Feature<Geometry>>> | undefined {
    return this.coreMapService.getExtraLayer(layer, mapIndex);
  }

  /**
   * Bepaalt de hoogste z-index van zichtbare lagen binnen een kaart.
   *
   * @param mapIndex Optionele kaartindex (default: DEFAULT_MAPINDEX)
   * @returns Hoogste z-index
   */
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

  /**
   * Zoomt de kaart naar een specifieke coördinaat.
   * Wacht indien nodig tot de kaart volledig is gerenderd.
   *
   * @param coord Doelcoördinaat
   * @param mapIndex Optionele kaartindex (default: DEFAULT_MAPINDEX)
   * @param maxZoom Optioneel maximum zoomniveau
   * @returns Promise met {@link MapComponentEvent}
   */
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
   * Zoomt naar een geometrie met uitgebreide zoomopties.
   *
   * @param geometry Geometrie als WKT, GeoJSON of OpenLayers Geometry
   * @param zoomOptions Opties voor mapIndex en fit
   * @param formatType Formaat van string-geometrie
   * @returns {@link MapComponentEvent}
   */
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

  /**
   * Zoomt naar een gegeven bounding box (extent).
   *
   * @param bbox Extent in kaartprojectie
   * @param zoomOptions Optioneel Zoom- en fitopties
   * @returns {@link MapComponentEvent}
   */
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

  /**
   * Markeert een geometrie op de highlightlaag.
   * Bestaande markeringen worden eerst verwijderd.
   *
   * @param geometry Geometrie als string of OpenLayers Geometry
   * @param mapIndex Optionele kaartindex (default: DEFAULT_MAPINDEX)
   * @param formatType Formaat van de string-geometrie (enum FormatType)
   * @returns {@link MapComponentEvent}
   */
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

  /**
   * Voegt één of meerdere features toe aan de highlightlaag.
   * De features worden zichtbaar gemaakt met de huidige highlightstijl.
   *
   * @param features Array van OpenLayers features met geometrie
   * @param mapIndex Index van de kaart waarop de features worden
   * toegevoegd (default: DEFAULT_MAPINDEX)
   * @returns {@link MapComponentEvent} dat aangeeft of de actie succesvol was
   */

  addFeaturesToHighlightLayer(
    features: Feature<Geometry>[],
    mapIndex: string = DEFAULT_MAPINDEX
  ): MapComponentEvent {
    return this.coreMapService.addFeaturesToHighlightLayer(features, mapIndex);
  }

  /**
   * Verwijdert alle features uit de highlightlaag.
   *
   * @param mapIndex Index van de kaart waarvoor de highlightlaag wordt
   * geleegd (default: DEFAULT_MAPINDEX)
   * @returns {@link MapComponentEvent} dat aangeeft of de actie succesvol was
   */
  clearHighlightLayer(mapIndex: string = DEFAULT_MAPINDEX): MapComponentEvent {
    return this.coreMapService.clearHighlightLayer(mapIndex);
  }

  /**
   * Wijzigt de stijl die wordt gebruikt voor het renderen van features
   * in de highlightlaag.
   *
   * @param styleLike OpenLayers StyleLike
   * @param mapIndex Index van de kaart waarop de stijl wordt
   * aangepast (default: DEFAULT_MAPINDEX)
   */
  changeHighlightLayerStyle(
    styleLike: StyleLike,
    mapIndex: string = DEFAULT_MAPINDEX
  ) {
    this.coreMapService.changeHighlightLayerStyle(styleLike, mapIndex);
  }

  /**
   * Voegt één of meerdere features toe aan de selectionlaag.
   * Deze laag wordt doorgaans gebruikt voor geselecteerde objecten.
   *
   * @param features Array van OpenLayers features met geometrie
   * @param mapIndex Index van de kaart waarop de features worden
   * toegevoegd (default: DEFAULT_MAPINDEX)
   * @returns {@link MapComponentEvent} dat aangeeft of de actie succesvol was
   */
  addFeaturesToSelectionLayer(
    features: Feature<Geometry>[],
    mapIndex: string = DEFAULT_MAPINDEX
  ): MapComponentEvent {
    return this.coreMapService.addFeaturesToSelectionLayer(features, mapIndex);
  }

  /**
   * Verwijdert alle features uit de selectionlaag.
   *
   * @param mapIndex Index van de kaart waarvoor de selectionlaag wordt
   * geleegd (default: DEFAULT_MAPINDEX)
   * @returns {@link MapComponentEvent} dat aangeeft of de actie succesvol was
   */
  clearSelectionLayer(mapIndex: string = DEFAULT_MAPINDEX): MapComponentEvent {
    return this.coreMapService.clearSelectionLayer(mapIndex);
  }

  /**
   * Past de stijl aan waarmee features in de selectionlaag
   * worden weergegeven.
   *
   * @param styleLike OpenLayers stijl of stijl-functie
   * @param mapIndex Index van de kaart waarop de stijl wordt
   * aangepast (default: DEFAULT_MAPINDEX)
   */
  changeSelectionLayerStyle(
    styleLike: StyleLike,
    mapIndex: string = DEFAULT_MAPINDEX
  ) {
    this.coreMapService.changeSelectionLayerStyle(styleLike, mapIndex);
  }

  /**
   * Controleert of de kaart zich op het maximale zoomniveau bevindt.
   *
   * @param mapIndex Index van de kaart waarvoor het zoomniveau wordt
   * gecontroleerd (default: DEFAULT_MAPINDEX)
   * @returns `true` indien het huidige zoomniveau gelijk is aan het maximale
   * zoomniveau, anders `false`
   */
  isMaxZoomlevel(mapIndex: string = DEFAULT_MAPINDEX): boolean {
    const view = this.coreMapService.getMap(mapIndex).getView();
    return view.getZoom() === view.getMaxZoom();
  }

  /**
   * Geeft de geometrie of – indien niet aanwezig – het centroïde
   * uit een PDOK zoekresultaat.
   *
   * @param pdokDoc PDOK zoekresultaatdocument
   * @returns WKT-representatie van geometrie of centroïde, of `undefined`
   */
  private getGeometrieOrCentroide(pdokDoc: SearchResultDoc) {
    if (pdokDoc.geometrie_rd) {
      return pdokDoc.geometrie_rd;
    }
    if (pdokDoc.centroide_rd) {
      return pdokDoc.centroide_rd;
    }
  }

  /**
   * Haalt het eerste {@link SearchResultDoc} object uit een event.
   *
   * @param evt Event met PDOK zoekresultaten
   * @returns Het eerste zoekresultaatdocument of `undefined`
   */
  private getSearchResultDocFromEvent(evt: any): SearchResultDoc | undefined {
    let pdokDoc: SearchResultDoc | undefined;
    if (evt.value && evt.value.docs && evt.value.docs.length > 0) {
      pdokDoc = evt.value.docs[0];
    }
    return pdokDoc;
  }

  /**
   * Bepaalt de geometrie- of centroïdecoördinaten uit een PDOK-event.
   *
   * @param evt Event met PDOK zoekresultaten
   * @returns WKT-representatie van coördinaten of `undefined`
   */
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

  /**
   * Zet een stringrepresentatie van een geometrie om naar een
   * OpenLayers Geometry.
   */
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
}
