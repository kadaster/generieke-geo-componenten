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
   * @deprecated
   * Zet de selectiemodus van de kaart op **single select**.
   * Hierbij kan steeds slechts één object tegelijk geselecteerd worden.
   *
   * @param mapIndex Optionele kaartindex (default: DEFAULT_MAPINDEX) waarvoor
   * de selectiemodus wordt ingesteld.
   */
  setSingleselectMode(mapIndex: string = DEFAULT_MAPINDEX): void {
    this.startSelect({ selectMode: "single" }, mapIndex);
  }

  /**
   * @deprecated
   * Zet de selectiemodus van de kaart op **multi select**.
   * Hierbij kunnen meerdere objecten tegelijk geselecteerd worden.
   *
   * @param mapIndex Optionele kaartindex (default: DEFAULT_MAPINDEX) waarvoor
   * de selectiemodus wordt ingesteld.
   */
  setMultiselectMode(mapIndex: string = DEFAULT_MAPINDEX): void {
    this.startSelect({ selectMode: "multi" }, mapIndex);
  }

  /**
   * Start een selectie‑interactie op de kaart.
   *
   * @param options Configuratie voor de selectie, zoals selectiemodus
   * en aanvullende selectie‑opties.
   * @param mapIndex Optionele kaartindex (default: DEFAULT_MAPINDEX) waarop
   * de selectie wordt gestart.
   * @param selectIndex Optionele selectIndex (default: undefined) waarmee een
   * select interaction wordt geïdentificeerd. Als undefined, dan wordt de mapIndex gebruikt voor de selectIndex.
   * Met selectIndex kunnen meerdere select interactions actief zijn op 1 kaart.
   */
  startSelect(
    options: SelectOptions,
    mapIndex: string = DEFAULT_MAPINDEX,
    selectIndex: string | undefined = undefined
  ): void {
    this.coreSelectionService.startSelect(options, mapIndex, selectIndex);
  }

  /**
   * Stopt de actieve selectie‑interactie op de kaart.
   *
   * @param selectIndex Optionele selectIndex/kaartindex (default: DEFAULT_MAPINDEX) waarop
   * de selectie wordt gestopt.
   */
  stopSelect(selectIndex: string = DEFAULT_MAPINDEX): void {
    this.coreSelectionService.stopSelect(selectIndex);
  }

  /**
   * Verwijdert alle huidige selecties van de opgegeven kaart.
   *
   * @param selectIndex Optionele selectIndex/kaartindex (default: DEFAULT_MAPINDEX) waarvoor
   * de selectie wordt gewist.
   */
  clearSelection(selectIndex: string = DEFAULT_MAPINDEX): void {
    this.coreSelectionService.clearSelection(selectIndex);
  }

  /**
   * @deprecated
   * Zet een selectie voor een specifieke kaartlaag.
   * Bestaande selecties voor deze laag worden overschreven.
   *
   * @param features Array van OpenLayers features die geselecteerd moeten worden.
   * @param layerName Naam van de kaartlaag waarop de selectie betrekking heeft.
   * @param mapIndex Optionele selectIndex/kaartindex (default: DEFAULT_MAPINDEX) waarop
   * de selectie wordt toegepast.
   */
  setSelectionForLayer(
    features: Feature<Geometry>[],
    layerName: string,
    mapIndex: string = DEFAULT_MAPINDEX
  ): void {
    this.setSelection(features, mapIndex);
  }

  /**
   * Overschrijft de bestaande selectie met de meegegeven features.
   *
   * @param features De nieuwe OpenLayers features die geselecteerd worden.
   * @param selectIndex Optionele selectIndex/kaartindex (default: DEFAULT_MAPINDEX) waarop
   * de selectie wordt overschreven.
   */
  setSelection(
    features: Feature<Geometry>[],
    selectIndex: string = DEFAULT_MAPINDEX
  ) {
    this.coreSelectionService.setSelection(features, selectIndex);
  }

  /**
   * Geeft de actieve selectie van de opgegeven kaart.
   *
   * @param selectIndex Optionele selectIndex/kaartindex (default: DEFAULT_MAPINDEX) waarvoor
   * de huidige selectie wordt opgehaald.
   * @returns De huidige selectie voor de opgegeven kaart.
   */
  getCurrentSelection(selectIndex: string = DEFAULT_MAPINDEX) {
    return this.coreSelectionService.getCurrentSelection(selectIndex);
  }

  /**
   * Geeft een observable die selectie‑gerelateerde events emit
   * voor de opgegeven kaart. De mapIndex in het event refereert naar de selectIndex als die is opgegeven, anders de mapIndex.
   *
   * @param mapIndex Optionele selectIndex/kaartindex (default: DEFAULT_MAPINDEX) waarvoor
   * selectie‑events worden gevolgd.
   * @returns Observable met {@link MapComponentEvent} selectie‑events.
   */
  getObservable(
    mapIndex: string = DEFAULT_MAPINDEX
  ): Observable<MapComponentEvent> {
    return this.coreSelectionService.getObservableForMap(mapIndex);
  }
}
