import { inject, Injectable } from "@angular/core";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import { Observable } from "rxjs";
import { MapComponentEvent } from "../../model/map-component-event.model";
import { CoreSelectionService } from "./core-selection.service";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";
import { SelectOptions } from "../../model/select-options";

@Injectable({
  providedIn: "root"
})

/**
 * Service voor het beheren van selectie-interacties op de kaart.
 *
 * Deze service biedt een vereenvoudigde API voor het instellen van selectiemodi,
 * het beheren van selecties per laag en het afluisteren van
 * selectie-events.
 */
export class GgcSelectionService {
  private readonly coreSelectionService = inject(CoreSelectionService);

  /**
   * Deprecated
   * Zet de selectiemodus voor de kaart op single select.
   * Hierbij kan telkens slechts één object geselecteerd zijn.
   *
   * @param mapIndex Optionele kaartindex (default: DEFAULT_MAPINDEX) waarvoor
   * de selectiemodus wordt ingesteld
   */
  setSingleselectMode(mapIndex: string = DEFAULT_MAPINDEX): void {
    this.coreSelectionService.startSelection(
      { selectMode: "single" },
      mapIndex
    );
  }

  /**
   * Deprecated
   * Zet de selectiemodus voor de kaart op multi select.
   * Hierbij kunnen meerdere objecten tegelijk geselecteerd worden.
   *
   * @param mapIndex Optionele kaartindex (default: DEFAULT_MAPINDEX) waarvoor
   * de selectiemodus wordt ingesteld
   */
  setMultiselectMode(mapIndex: string = DEFAULT_MAPINDEX): void {
    this.coreSelectionService.startSelection({ selectMode: "multi" }, mapIndex);
  }

  /**
   * Start selectie
   */
  startSelect(
    options: SelectOptions,
    mapIndex: string = DEFAULT_MAPINDEX
  ): void {
    this.coreSelectionService.startSelection(options, mapIndex);
  }

  /**
   * Stop selectie
   */
  stopSelect(mapIndex: string = DEFAULT_MAPINDEX): void {
    this.coreSelectionService.stopSelection(mapIndex);
  }

  /**
   * Verwijdert alle huidige selecties van de opgegeven kaart.
   *
   * @param mapIndex Optionele kaartindex (default: DEFAULT_MAPINDEX) waarvoor
   * de selectie wordt gewist
   */
  clearSelection(mapIndex: string = DEFAULT_MAPINDEX): void {
    this.coreSelectionService.clearSelectionForMap(mapIndex);
  }

  /**
   * Zet een selectie voor een specifieke kaartlaag.
   * Bestaande selecties voor deze laag worden overschreven.
   *
   * @param features Array van OpenLayers features die geselecteerd moeten worden
   * @param layerName Naam van de laag waarop de selectie betrekking heeft
   * @param mapIndex Optionele kaartindex (default: DEFAULT_MAPINDEX) waarop
   * de selectie wordt toegepast
   */
  setSelectionForLayer(
    features: Feature<Geometry>[],
    layerName: string,
    mapIndex: string = DEFAULT_MAPINDEX
  ): void {
    this.coreSelectionService.setSelectionForLayer(
      features,
      layerName,
      mapIndex
    );
  }

  /**
   * Geeft een observable die selectie-gerelateerde events emit
   * voor de opgegeven kaart.
   *
   * @param mapIndex Optionele kaartindex (default: DEFAULT_MAPINDEX) waarvoor
   * selectie-events worden gevolgd
   * @returns Observable met {@link MapComponentEvent} selectie-events
   */
  getObservable(
    mapIndex: string = DEFAULT_MAPINDEX
  ): Observable<MapComponentEvent> {
    return this.coreSelectionService.getObservableForMap(mapIndex);
  }
}
