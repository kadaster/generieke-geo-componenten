import { inject, Injectable } from "@angular/core";
import { ScreenSpaceEventType } from "@cesium/engine";
import { CoreSelectionService } from "./core-selection.service";
import { SelectionConfig } from "../model/interfaces";

@Injectable({
  providedIn: "root"
})
export class GgcSelectionService {
  private readonly coreSelectionService = inject(CoreSelectionService);

  public initializeSelections(selections: SelectionConfig[]) {
    this.coreSelectionService.initializeSelections(selections);
  }

  public addSelection(selection: SelectionConfig) {
    this.coreSelectionService.addSelection(selection);
  }

  public clearSelection(eventType: ScreenSpaceEventType) {
    this.coreSelectionService.clearSelection(eventType);
  }

  public clearAllSelections() {
    this.coreSelectionService.clearAllSelections();
  }

  public destroySelection(eventType: ScreenSpaceEventType) {
    this.coreSelectionService.destroySelection(eventType);
  }

  public destroyAllSelections() {
    this.coreSelectionService.destroyAllSelections();
  }

  public getSelectionEventsObservable() {
    return this.coreSelectionService.getClickEventsObservable();
  }

  /**
   * Return een observable die mapEvents terug geeft met daarin een FeatureCollectionForCoordinate.
   * @param selectIndex De selectIndex waarvoor je events wilt ontvangen. Mocht deze niet opgegeven zijn, dan krijg je alle selectie events terug.
   */
  public getFeatureCollectionForCoordinateObservable(selectIndex?: string) {
    return this.coreSelectionService.getFeatureCollectionForCoordinateObservable(
      selectIndex
    );
  }
}
