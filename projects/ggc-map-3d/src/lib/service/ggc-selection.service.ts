import { inject, Injectable } from "@angular/core";
import { ScreenSpaceEventType } from "@cesium/engine";
import { Observable } from "rxjs";
import { CoreSelectionService } from "./core-selection.service";
import { MapComponentEvent } from "@kadaster/ggc-models";
import { SelectionConfig, SelectionEvent } from "../model/interfaces";

/**
 * Service voor selectiefunctionaliteit binnen de GGC Cesium viewer.
 *
 * Afnemers kunnen via deze service:
 *
 * - selecties initialiseren en beheren;
 * - selecties toevoegen of verwijderen;
 * - luisteren naar selectie-events;
 * - feature-informatie ophalen op basis van coördinaten.
 */
@Injectable({
  providedIn: "root"
})
export class GgcSelectionService {
  private readonly coreSelectionService = inject(CoreSelectionService);

  /**
   * Initialiseert meerdere selectieconfiguraties. Verwijdert alle huidige selecties.
   *
   * @param selections Lijst van {@link SelectionConfig} objecten die de selecties definiëren
   */
  public initializeSelections(selections: SelectionConfig[]) {
    this.coreSelectionService.initializeSelections(selections);
  }

  /**
   * Voegt een nieuwe selectieconfiguratie toe aan de huidige selecties.
   *
   * @param selection De {@link SelectionConfig} die toegevoegd moet worden
   */
  public addSelection(selection: SelectionConfig) {
    this.coreSelectionService.addSelection(selection);
  }

  /**
   * Leegt de selectie voor een specifiek event type.
   *
   * @param eventType Het {@link ScreenSpaceEventType} waarvoor de selectie moet worden leeggemaakt
   */
  public clearSelection(eventType: ScreenSpaceEventType) {
    this.coreSelectionService.clearSelection(eventType);
  }

  /**
   * Leegt alle actieve selecties.
   */
  public clearAllSelections() {
    this.coreSelectionService.clearAllSelections();
  }

  /**
   * Verwijdert (destroy) een selectie voor een specifiek event type.
   *
   * @param eventType Het {@link ScreenSpaceEventType} waarvoor de selectie verwijderd moet worden
   */
  public destroySelection(eventType: ScreenSpaceEventType) {
    this.coreSelectionService.destroySelection(eventType);
  }

  /**
   * Verwijdert (destroy) alle selectieconfiguraties.
   */
  public destroyAllSelections() {
    this.coreSelectionService.destroyAllSelections();
  }

  /**
   * Geeft een observable met selectie-events van het type {@link SelectionEvent} gerelateerd aan selecties.
   *
   * @returns Observable met selectie klik-events vanuit de {@link CoreSelectionService}
   */
  public getSelectionEventsObservable(): Observable<SelectionEvent> {
    return this.coreSelectionService.getClickEventsObservable();
  }

  /**
   * Return een observable die mapEvents terug geeft met daarin een {@link FeatureCollectionForCoordinate}.
   * @param selectIndex De selectIndex waarvoor je events wilt ontvangen. Mocht deze niet opgegeven zijn, dan krijg je alle selectie events terug.
   */
  public getFeatureCollectionForCoordinateObservable(
    selectIndex?: string
  ): Observable<MapComponentEvent> {
    return this.coreSelectionService.getFeatureCollectionForCoordinateObservable(
      selectIndex
    );
  }
}
