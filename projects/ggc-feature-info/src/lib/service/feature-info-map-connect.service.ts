import { inject, Injectable } from "@angular/core";

import { Observable, of } from "rxjs";
import {
  DEFAULT_MAPINDEX,
  MapComponentEvent,
  ViewerType
} from "@kadaster/ggc-models";
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
   * @param viewerType Viewertype waarvoor dit uitgevoerd moet worden. Ondersteund alleen 2D.
   */
  showHighlight(
    feature: object | undefined,
    mapIndex: string,
    viewerType: ViewerType
  ): void {
    if (viewerType == ViewerType.TWEE_D) {
      this.clearHighlightLayer(viewerType, mapIndex).then(() => {
        return this.addFeaturesToHighlightLayer([feature], mapIndex);
      });
    }
  }

  /**
   * Geeft een observable die selectie‑gerelateerde events emit
   * voor de opgegeven kaart.
   *
   * @param mapIndex Optionele kaartindex (default: DEFAULT_MAPINDEX) waarvoor
   * selectie‑events worden gevolgd. Cesium maakt geen gebruik van een mapIndex.
   * @param selectIndex Optionele selectIndex (default: undefined) waarvoor selectie‑events worden gevolgd
   * @param viewerType Viewertype waarvoor dit uitgevoerd moet worden.
   * @returns Promise met een Observable van {@link MapComponentEvent}
   */
  getObservableForMapSelection(
    viewerType: ViewerType,
    mapIndex: string = DEFAULT_MAPINDEX,
    selectIndex?: string
  ): Promise<Observable<MapComponentEvent>> {
    if (viewerType == ViewerType.TWEE_D) {
      return this.connectService
        .getMapSelectionService()
        .then((selectionService: any) => {
          return selectionService?.getObservable(mapIndex, selectIndex) ?? of();
        });
    } else {
      return this.connectService
        .getCesiumSelectionService()
        .then((selectionService: any) => {
          return (
            selectionService?.getFeatureCollectionForCoordinateObservable(
              selectIndex
            ) ?? of()
          );
        });
    }
  }

  /**
   * Start een selectie‑actie op de kaart voor het opgegeven object.
   *
   * @param object Object dat geselecteerd moet worden
   * @param mapIndex Kaartindex waarop de selectie wordt gestart
   * @param viewerType Viewertype waarvoor dit uitgevoerd moet worden.
   */
  startSelect(object: any, mapIndex: string, viewerType: ViewerType): void {
    if (viewerType == ViewerType.TWEE_D) {
      this.connectService
        .getMapSelectionService()
        .then((selectionService: any) => {
          selectionService?.startSelect(object, mapIndex);
        });
    } else if (viewerType == ViewerType.DRIE_D) {
      this.connectService
        .getCesiumSelectionService()
        .then((selectionService: any) => {
          selectionService?.addSelection();
        });
    }
  }

  /**
   * Verwijdert de highlight‑laag van de kaart.
   *
   * @param mapIndex Optionele kaartindex (default: DEFAULT_MAPINDEX)
   * @param viewerType Viewertype waarvoor dit uitgevoerd moet worden. Ondersteund alleen 2D.
   */
  clearHighlightLayer(
    viewerType: ViewerType,
    mapIndex: string = DEFAULT_MAPINDEX
  ) {
    if (viewerType == ViewerType.TWEE_D) {
      this.connectService.getMapService().then((mapService: any) => {
        mapService?.clearHighlightLayer(mapIndex);
        return Promise.resolve();
      });
    }
    return Promise.resolve();
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
