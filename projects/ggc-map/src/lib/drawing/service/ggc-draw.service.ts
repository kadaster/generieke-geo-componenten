import { inject, Injectable } from "@angular/core";
import { Condition } from "ol/events/condition";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import { Observable } from "rxjs";
import {
  DrawInteractionEvent,
  MapComponentDrawTypes,
  StyleLikeMap
} from "../../model/draw-interaction-event.model";
import { MapComponentEvent } from "../../model/map-component-event.model";
import { DrawOptions } from "../../model/draw-options";
import { ModifyInteractionEvent } from "../../model/modify-interaction-event.model";
import { CoreDrawService } from "./core-draw.service";
import { Coordinate } from "ol/coordinate";
import { CoreDrawLayerService } from "./core-draw-layer.service";
import { TraceOptions } from "../../model/trace-options";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";

/**
 * Service voor het beheren van teken- en bewerkingsinteracties op de kaart.
 *
 * Deze service biedt methoden voor het starten, stoppen en configureren van
 * teken-, bewerk- en verplaatsingsinteracties, en het beheren van tekenlagen en features.
 */
@Injectable({
  providedIn: "root"
})
export class GgcDrawService {
  private readonly coreDrawService = inject(CoreDrawService);
  private readonly coreDrawLayerService = inject(CoreDrawLayerService);

  /**
   * Voegt een feature toe aan een bestaande tekenlaag.
   *
   * @param layerName - Naam van de laag waaraan de feature toegevoegd wordt.
   * @param feature - Toe te voegen `ol/Feature`.
   * @param mapIndex - Index van de kaart. Default: `DEFAULT_MAPINDEX`.
   * @returns `MapComponentEvent` als bevestiging van de toevoeging.
   */
  addFeatureToLayer(
    layerName: string,
    feature: Feature<Geometry>,
    mapIndex = DEFAULT_MAPINDEX
  ): MapComponentEvent {
    return this.coreDrawService.addFeatureToLayer(layerName, mapIndex, feature);
  }

  /**
   * Voegt een coördinaat toe aan de huidige actieve tekening.
   *
   * @param coordinates - Toe te voegen coördinaat.
   * @param mapIndex - Index van de kaart. Default: `DEFAULT_MAPINDEX`.
   */
  appendCoordinates(coordinates: Coordinate, mapIndex = DEFAULT_MAPINDEX) {
    this.coreDrawService.appendCoordinates(mapIndex, coordinates);
  }

  /**
   * Verwijdert het laatste toegevoegde punt van de huidige actieve tekening.
   *
   * @param mapIndex - Index van de kaart. Default: `DEFAULT_MAPINDEX`.
   */
  removeLastPoint(mapIndex = DEFAULT_MAPINDEX) {
    this.coreDrawService.removeLastPoint(mapIndex);
  }

  /**
   * Geeft de coördinaten terug van de huidige actieve tekening, exclusief de positie van de cursos.
   *
   * @param mapIndex - Index van de kaart. Default: `DEFAULT_MAPINDEX`.
   * @returns Array van `Coordinate` of `undefined` als er geen actieve tekening is.
   */
  getSketchCoordinates(mapIndex = DEFAULT_MAPINDEX): Coordinate[] | undefined {
    return this.coreDrawService.getSketchCoordinates(mapIndex);
  }

  /**
   * Verwijdert alle features uit de opgegeven laag.
   *
   * @param layerName - Naam van de te legen laag.
   * @param mapIndex - Index van de kaart. Default: `DEFAULT_MAPINDEX`.
   */
  clearLayer(layerName: string, mapIndex: string = DEFAULT_MAPINDEX): void {
    this.coreDrawService.clearLayer(layerName, mapIndex);
  }

  /**
   * Verwijdert de opgegeven laag van de kaart.
   *
   * @param layerName - Naam van de te verwijderen laag.
   * @param mapIndex - Index van de kaart. Default: `DEFAULT_MAPINDEX`.
   */
  deleteLayer(layerName: string, mapIndex: string = DEFAULT_MAPINDEX): void {
    this.coreDrawService.deleteLayer(layerName, mapIndex);
  }

  /**
   * Rondt de huidige actieve tekening af.
   *
   * @param mapIndex - Index van de kaart. Default: `DEFAULT_MAPINDEX`.
   */
  finishCurrentDraw(mapIndex: string = DEFAULT_MAPINDEX): void {
    this.coreDrawService.finishCurrentDraw(mapIndex);
  }

  /**
   * Geeft een `Observable` terug met tekeninteractie-events voor de opgegeven kaart.
   *
   * @param mapIndex - Index van de kaart. Default: `DEFAULT_MAPINDEX`.
   * @returns `Observable` van `DrawInteractionEvent`.
   */
  getDrawEventsObservable(
    mapIndex: string = DEFAULT_MAPINDEX
  ): Observable<DrawInteractionEvent> {
    return this.coreDrawService.getDrawObservable(mapIndex);
  }

  /**
   * Geeft een `Observable` terug met bewerkingsinteractie-events voor de opgegeven kaart.
   *
   * @param mapIndex - Index van de kaart. Default: `DEFAULT_MAPINDEX`.
   * @returns `Observable` van `ModifyInteractionEvent`.
   */
  getModifyEventsObservable(
    mapIndex: string = DEFAULT_MAPINDEX
  ): Observable<ModifyInteractionEvent> {
    return this.coreDrawService.getModifyEventsObservable(mapIndex);
  }

  /**
   * Haalt alle features op uit de opgegeven tekenlaag.
   *
   * @param layerName - Naam van de laag.
   * @param mapIndex - Index van de kaart. Default: `DEFAULT_MAPINDEX`.
   * @returns Array van `Feature<Geometry>`.
   */
  getFeaturesFromLayer(
    layerName: string,
    mapIndex: string = DEFAULT_MAPINDEX
  ): Feature<Geometry>[] {
    const layer = this.coreDrawLayerService.getDrawLayer(layerName, mapIndex);
    return layer.getSource()!.getFeatures();
  }

  /**
   * Controleert of de opgegeven laag zichtbaar is.
   *
   * @param layerName - Naam van de laag.
   * @param mapIndex - Index van de kaart. Default: `DEFAULT_MAPINDEX`.
   * @returns `true` als de laag zichtbaar is, anders `false`.
   */
  isLayerVisible(layerName: string, mapIndex = DEFAULT_MAPINDEX): boolean {
    const layer = this.coreDrawLayerService.getDrawLayer(layerName, mapIndex);
    return layer.getVisible();
  }

  /**
   * Stelt de tekenstijl in voor de opgegeven laag.
   *
   * @param layerName - Naam van de laag.
   * @param styleLikeMap - Toe te passen stijl als `StyleLikeMap`.
   * @param mapIndex - Index van de kaart. Default: `DEFAULT_MAPINDEX`.
   */
  setDrawStyle(
    layerName: string,
    styleLikeMap: StyleLikeMap,
    mapIndex: string = DEFAULT_MAPINDEX
  ): void {
    this.coreDrawService.setDrawStyle(layerName, mapIndex, styleLikeMap);
  }

  /**
   * Stelt de zichtbaarheid van een laag in.
   *
   * @param layerName - Naam van de laag.
   * @param visible - `true` om de laag zichtbaar te maken, `false` om te verbergen.
   * @param mapIndex - Index van de kaart. Default: `DEFAULT_MAPINDEX`.
   */
  setLayerVisibility(
    layerName: string,
    visible: boolean,
    mapIndex: string = DEFAULT_MAPINDEX
  ): void {
    this.coreDrawService.setLayerVisibility(layerName, mapIndex, visible);
  }

  /**
   * Stelt de z-index in van de opgegeven laag.
   *
   * @param zIndex - Gewenste z-index waarde.
   * @param layerName - Naam van de laag.
   * @param mapIndex - Index van de kaart. Default: `DEFAULT_MAPINDEX`.
   */
  setLayerZIndex(
    zIndex: number,
    layerName: string,
    mapIndex: string = DEFAULT_MAPINDEX
  ): void {
    this.coreDrawService.setLayerZIndex(layerName, mapIndex, zIndex);
  }

  /**
   * Start het tekenen van objecten op de opgegeven laag.
   *
   * @param layerName - Naam van de laag waarop getekend wordt.
   * @param drawType - Type tekening (bijv. punt, lijn, polygoon).
   * @param drawOptions - Opties voor de tekeninteractie.
   * @param mapIndex - Index van de kaart. Default: `DEFAULT_MAPINDEX`.
   * @param traceOptions - Optioneel: trace-opties voor het volgen van bestaande geometrieën.
   */
  startDraw(
    layerName: string,
    drawType: MapComponentDrawTypes,
    drawOptions: DrawOptions,
    mapIndex: string = DEFAULT_MAPINDEX,
    traceOptions?: TraceOptions
  ): void {
    this.coreDrawService.startDraw(
      layerName,
      mapIndex,
      drawType,
      drawOptions,
      traceOptions
    );
  }

  /**
   * Start het bewerken van opbjecten op de opgegeven laag.
   *
   * @param layerName - Naam van de laag waarop bewerkt wordt.
   * @param mapIndex - Index van de kaart. Default: `DEFAULT_MAPINDEX`.
   * @param drawOptions - Opties voor de bewerkingsinteractie. Default: leeg object.
   * @param deleteCondition - Optioneel: ol/Condition om een vertex te verwijderen. Default: never.
   * @param insertVertexCondition - Optioneel: ol/Condition om een vertex in te voegen. Default: never.
   */
  startModify(
    layerName: string,
    mapIndex: string = DEFAULT_MAPINDEX,
    drawOptions: DrawOptions = {},
    deleteCondition?: Condition,
    insertVertexCondition?: Condition
  ): void {
    this.coreDrawService.startModify(
      layerName,
      mapIndex,
      drawOptions,
      deleteCondition,
      insertVertexCondition
    );
  }

  /**
   * Start het verplaatsen van objecten op de opgegeven laag.
   *
   * @param layerName - Naam van de laag waarop verplaatst wordt.
   * @param mapIndex - Index van de kaart. Default: `DEFAULT_MAPINDEX`.
   * @param drawOptions - Opties voor de verplaatsingsinteractie. Default: leeg object.
   */
  startMove(
    layerName: string,
    mapIndex: string = DEFAULT_MAPINDEX,
    drawOptions: DrawOptions = {}
  ): void {
    this.coreDrawService.startMove(layerName, mapIndex, drawOptions);
  }

  /**
   * Stopt het verplaatsen van objecten.
   *
   * @param mapIndex - Index van de kaart. Default: `DEFAULT_MAPINDEX`.
   */
  stopMove(mapIndex: string = DEFAULT_MAPINDEX): void {
    this.coreDrawService.stopMove(mapIndex);
  }

  /**
   * Stopt het tekenen van objecten.
   *
   * @param mapIndex - Index van de kaart. Default: `DEFAULT_MAPINDEX`.
   */
  stopDraw(mapIndex: string = DEFAULT_MAPINDEX): void {
    this.coreDrawService.stopDraw(mapIndex);
  }

  /**
   * Stopt het tekenen, leegt de laag en verwijdert daarna de laag.
   *
   * @param layerName - Naam van de laag.
   * @param mapIndex - Index van de kaart. Default: `DEFAULT_MAPINDEX`.
   */
  stopDrawAndClearLayer(
    layerName: string,
    mapIndex: string = DEFAULT_MAPINDEX
  ): void {
    this.stopDraw(mapIndex);
    this.clearLayer(layerName, mapIndex);
    this.coreDrawService.deleteLayer(layerName, mapIndex);
  }

  /**
   * Stopt het bewerken van objecten.
   *
   * @param mapIndex - Index van de kaart. Default: `DEFAULT_MAPINDEX`.
   */
  stopModify(mapIndex: string = DEFAULT_MAPINDEX): void {
    this.coreDrawService.stopModify(mapIndex);
  }

  /**
   * Wisselt de zichtbaarheid van de opgegeven laag.
   *
   * @param layerName - Naam van de laag.
   * @param mapIndex - Index van de kaart. Default: `DEFAULT_MAPINDEX`.
   */
  toggleLayer(layerName: string, mapIndex: string = DEFAULT_MAPINDEX): void {
    this.coreDrawService.toggleLayer(layerName, mapIndex);
  }

  /**
   * @deprecated Gebruik `resetDrawStyle` in plaats van deze methode.
   *
   * Reset de meetstijl van de opgegeven laag naar de standaardstijl.
   *
   * @param layerName - Naam van de laag.
   * @param mapIndex - Index van de kaart. Default: `DEFAULT_MAPINDEX`.
   * @param drawOptions - Opties voor de tekenstijl. Default: leeg object.
   */
  resetMeasureStyle(
    layerName: string,
    mapIndex: string = DEFAULT_MAPINDEX,
    drawOptions: DrawOptions = {}
  ) {
    this.resetDrawStyle(layerName, mapIndex, drawOptions);
  }

  /**
   * Reset de tekenstijl van de opgegeven laag naar de standaardstijl.
   *
   * @param layerName - Naam van de laag.
   * @param mapIndex - Index van de kaart. Default: `DEFAULT_MAPINDEX`.
   * @param drawOptions - Opties voor de tekenstijl. Default: leeg object.
   */
  resetDrawStyle(
    layerName: string,
    mapIndex: string = DEFAULT_MAPINDEX,
    drawOptions: DrawOptions = {}
  ) {
    this.coreDrawService.resetDrawStyle(layerName, mapIndex, drawOptions);
  }
}
