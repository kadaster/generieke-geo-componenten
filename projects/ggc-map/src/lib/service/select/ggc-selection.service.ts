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
 * Service voor het selecteren en highlighten van features op de kaart.
 *
 * De {@link GgcSelectionService} biedt ondersteuning voor selectie‑interacties
 * op verschillende typen kaartlagen en abstracteert de onderliggende
 * OpenLayers‑selectielogica via de {@link CoreSelectionService}.
 *
 * ## Ondersteunde kaartlagen
 *
 * De service ondersteunt selecties op alle kaartlagen, maar het gebruik van
 * **WFS‑ of OGC‑kaartlagen** wordt sterk aanbevolen. Deze lagen bevatten features
 * als vector‑data in de front‑end, wat uitgebreidere en stabielere selectiemogelijkheden
 * biedt.
 *
 * Selecties op **WMS/WMTS‑kaartlagen** worden ook ondersteund, maar kennen
 * functionele beperkingen (zie hieronder).
 *
 * ## Selectiemodi voor WFS en OGC kaartlagen
 *
 * Voor WFS‑ en OGC‑kaartlagen zijn de volgende selectiemodi beschikbaar:
 *
 * - **Single select**
 *   Door te klikken wordt één feature geselecteerd. Een nieuwe selectie
 *   vervangt de bestaande selectie.
 *
 * - **Multi select**
 *   Meerdere features kunnen geselecteerd worden. Door op een reeds
 *   geselecteerde feature te klikken, wordt deze uit de selectie verwijderd.
 *
 * - **OpenLayers default**
 *   Standaard OpenLayers‑gedrag:
 *   - normale klik → single select
 *   - shift‑klik → multi select
 *
 * ## Selecties op WMS en WMTS kaartlagen
 *
 * Selecties op WMS‑ en WMTS‑kaartlagen werken anders dan bij vector‑lagen,
 * omdat de features niet permanent in de front‑end beschikbaar zijn.
 *
 * Voor WMS/WMTS‑selecties gelden de volgende vereisten en beperkingen:
 *
 * - De kaartlaag moet de property `getFeatureInfoOnSingleclick` op `true` hebben.
 * - Selecties werken alleen via **singleclick** in:
 *   - single select modus
 *   - multi select modus
 * - De GetFeatureInfo‑response **moet een geometry bevatten**,
 *   anders kan de feature niet worden gehighlight.
 *
 * Buiten deze beperkingen gedragen WMS‑ en WMTS‑kaartlagen zich verder hetzelfde
 * binnen de {@link GgcSelectionService} en kunnen zij:
 *
 * - gecombineerd worden met andere kaartlagen;
 * - gelijktijdig gebruikt worden met WFS/OGC‑lagen;
 * - gefilterd worden via `layerIds` bij het starten van een selectie.
 *
 * ## Events en observables
 *
 * De service throws selectie‑events via een {@link Observable} van
 * {@link MapComponentEvent}. Deze events kunnen gebruikt worden om
 * selectie‑wijzigingen te volgen en te synchroniseren met andere componenten.
 *
 * @see {@link SelectOptions}
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
   * @param selectIndex Optionele selectIndex/kaartindex (default: DEFAULT_MAPINDEX) waarvoor
   * selectie‑events worden gevolgd.
   * @returns Observable met {@link MapComponentEvent} selectie‑events.
   */
  getObservable(
    selectIndex: string = DEFAULT_MAPINDEX
  ): Observable<MapComponentEvent> {
    return this.coreSelectionService.getObservableForMap(selectIndex);
  }
}
