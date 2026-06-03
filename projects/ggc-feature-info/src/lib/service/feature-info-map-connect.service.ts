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

  async showHighlight(feature: object | undefined, mapIndex: string) {
    await this.clearHighlightLayer(mapIndex);
    await this.addFeaturesToHighlightLayer([feature], mapIndex);
  }

  async getObservableForMapSelection(
    mapIndex: string = DEFAULT_MAPINDEX
  ): Promise<Observable<MapComponentEvent>> {
    return (
      (
        (await this.connectService.getMapSelectionService()) as any
      )?.getObservable(mapIndex) ?? of()
    );
  }

  private async clearHighlightLayer(
    mapIndex: string = DEFAULT_MAPINDEX
  ): Promise<MapComponentEvent> {
    return (
      (await this.connectService.getMapService()) as any
    )?.clearHighlightLayer(mapIndex);
  }

  private async addFeaturesToHighlightLayer(
    features: [object | undefined],
    mapIndex: string = DEFAULT_MAPINDEX
  ): Promise<void> {
    (
      (await this.connectService.getMapService()) as any
    )?.addFeaturesToHighlightLayer(features, mapIndex);
  }
}
