import { inject, Injectable } from "@angular/core";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import { Observable } from "rxjs";
import { MapComponentEvent } from "../../model/map-component-event.model";
import { CoreSelectionService } from "./core-selection.service";
import { SelectionModeTypes } from "./selection-type.enum";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";

@Injectable({
  providedIn: "root"
})
export class GgcSelectionService {
  private readonly coreSelectionService = inject(CoreSelectionService);

  setSingleselectMode(mapIndex: string = DEFAULT_MAPINDEX): void {
    this.coreSelectionService.setSelectionModeFormapIndex(
      SelectionModeTypes.SINGLE_SELECT,
      mapIndex
    );
  }

  setMultiselectMode(mapIndex: string = DEFAULT_MAPINDEX): void {
    this.coreSelectionService.setSelectionModeFormapIndex(
      SelectionModeTypes.MULTI_SELECT,
      mapIndex
    );
  }

  clearSelection(mapIndex: string = DEFAULT_MAPINDEX): void {
    this.coreSelectionService.clearSelectionForMap(mapIndex);
  }

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

  getObservable(
    mapIndex: string = DEFAULT_MAPINDEX
  ): Observable<MapComponentEvent> {
    return this.coreSelectionService.getObservableForMap(mapIndex);
  }
}
