import { inject, Injectable } from "@angular/core";
import { ScreenSpaceEventType } from "@cesium/engine";
import { CoreSelectionService } from "./core-selection.service";
import { SelectionConfig } from "../model/interfaces";

@Injectable({
  providedIn: "root"
})
export class GgcSelectionService {
  private coreSelectionService = inject(CoreSelectionService);

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
}
