import { inject, Injectable } from "@angular/core";

import { Observable, of } from "rxjs";
import { DEFAULT_MAPINDEX, MapComponentEvent } from "@kadaster/ggc-models";
import { GgcFeatureInfoConnectService } from "./connect.service";

@Injectable({
  providedIn: "root"
})
export class FeatureInfoMapConnectService {
  private readonly connectService: GgcFeatureInfoConnectService = inject(
    GgcFeatureInfoConnectService
  );

  async getObservableForMapSelection(
    mapIndex: string = DEFAULT_MAPINDEX
  ): Promise<Observable<MapComponentEvent>> {
    const mapObservable: Observable<MapComponentEvent> =
      (
        (await this.connectService.getMapSelectionService()) as any
      )?.getObservable(mapIndex) ?? of();
    return mapObservable;
  }
}
