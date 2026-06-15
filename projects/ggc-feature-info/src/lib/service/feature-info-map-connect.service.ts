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

  /**
   * Toont een highlight op de kaart voor het opgegeven feature.
   * Eerst wordt de bestaande highlight‑laag opgeschoond,
   * daarna wordt het feature toegevoegd.
   *
   * @param feature Feature dat gehighlight moet worden
   * @param mapIndex Kaartindex waarop de highlight wordt getoond
   */
  showHighlight(feature: object | undefined, mapIndex: string): void {
    this.clearHighlightLayer(mapIndex).then(() => {
      return this.addFeaturesToHighlightLayer([feature], mapIndex);
    });
  }

  /**
   * Geeft een observable die selectie‑gerelateerde events emit
   * voor de opgegeven kaart.
   *
   * @param mapIndex Optionele kaartindex (default: DEFAULT_MAPINDEX) waarvoor
   * selectie‑events worden gevolgd
   * @param selectIndex Optionele selectIndex (default: undefined) waarvoor selectie‑events worden gevolgd
   * @returns Promise met een Observable van {@link MapComponentEvent}
   */
  getObservableForMapSelection(
    mapIndex: string = DEFAULT_MAPINDEX,
    selectIndex?: string
  ): Promise<Observable<MapComponentEvent>> {
    return this.connectService
      .getMapSelectionService()
      .then((selectionService: any) => {
        return selectionService?.getObservable(mapIndex, selectIndex) ?? of();
      });
  }

  /**
   * Start een selectie‑actie op de kaart voor het opgegeven object.
   *
   * @param object Object dat geselecteerd moet worden
   * @param mapIndex Kaartindex waarop de selectie wordt gestart
   */
  startSelect(object: any, mapIndex: string): void {
    this.connectService
      .getMapSelectionService()
      .then((selectionService: any) => {
        selectionService?.startSelect(object, mapIndex);
      });
  }

  /**
   * Verwijdert de highlight‑laag van de kaart.
   *
   * @param mapIndex Optionele kaartindex (default: DEFAULT_MAPINDEX)
   * @returns Promise met een {@link MapComponentEvent}
   */
  clearHighlightLayer(
    mapIndex: string = DEFAULT_MAPINDEX
  ): Promise<MapComponentEvent> {
    return this.connectService.getMapService().then((mapService: any) => {
      return mapService?.clearHighlightLayer(mapIndex);
    });
  }

  /**
   * Voegt features toe aan de highlight‑laag van de kaart.
   *
   * @param features Features die toegevoegd moeten worden
   * @param mapIndex Optionele kaartindex (default: DEFAULT_MAPINDEX)
   * @returns Promise die resolve wanneer de actie is uitgevoerd
   */
  private addFeaturesToHighlightLayer(
    features: [object | undefined],
    mapIndex: string = DEFAULT_MAPINDEX
  ): Promise<void> {
    return this.connectService.getMapService().then((mapService: any) => {
      mapService?.addFeaturesToHighlightLayer(features, mapIndex);
    });
  }
}
