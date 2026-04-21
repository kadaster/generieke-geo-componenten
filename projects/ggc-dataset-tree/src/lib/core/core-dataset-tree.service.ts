import { inject, Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import {
  DatasetTreeEvent,
  DatasetTreeEventType
} from "../model/dataset-tree-event.model";
import { Dataset } from "../model/theme/dataset.model";
import { DatasetTreeMapConnectService } from "../dataset-tree/service/dataset-tree-map-connect.service";
import { Theme } from "../model/theme/theme.model";
import { DatasetTreeWebservice } from "../model/theme/dataset-tree-webservice.model";
import { ViewerType } from "@kadaster/ggc-models";

@Injectable({
  providedIn: "root"
})
export class CoreDatasetTreeService {
  private readonly datasetTreeMapConnectService = inject(
    DatasetTreeMapConnectService
  );

  private readonly subject: Subject<DatasetTreeEvent> = new Subject();

  getEventsObservable(): Observable<DatasetTreeEvent> {
    return this.subject.asObservable();
  }

  async countActiveLayersOfDataset(
    dataset: Dataset,
    mapName: string,
    viewerType: ViewerType
  ): Promise<number> {
    let count = 0;
    for (const service of dataset.services) {
      for (const layer of service.layers) {
        const visible = await this.datasetTreeMapConnectService.isVisible(
          layer.layerId,
          mapName,
          viewerType
        );
        if (visible) {
          count++;
        }
      }
    }
    return count;
  }

  countAllLayersOfDataset(dataset: Dataset): number {
    return dataset.services.reduce(
      (count, service: DatasetTreeWebservice) => count + service.layers.length,
      0
    );
  }

  async countActiveDatasetsOfTheme(
    theme: Theme,
    mapName: string,
    viewerType: ViewerType
  ): Promise<number> {
    let count = 0;

    // Count datasets array
    for (const dataset of theme.datasets) {
      const visible =
        (await this.countActiveLayersOfDataset(dataset, mapName, viewerType)) >
        0;
      if (visible) {
        count++;
      }
    }

    // count recursive themes
    for (const themeRecursive of theme.themes) {
      count += await this.countActiveDatasetsOfTheme(
        themeRecursive,
        mapName,
        viewerType
      );
    }

    return count;
  }

  countAllDatasetsOfTheme(theme: Theme): number {
    return (
      theme.datasets.filter(
        (dataset) => this.countAllLayersOfDataset(dataset) > 0
      ).length +
      theme.themes.reduce(
        (count, themeRecursive) =>
          count + this.countAllDatasetsOfTheme(themeRecursive),
        0
      )
    );
  }

  emitDatasetTreeEvent(
    layerId: string,
    mapIndex: string,
    updatedVisibility: boolean
  ) {
    const type = updatedVisibility
      ? DatasetTreeEventType.LAYER_ACTIVATED
      : DatasetTreeEventType.LAYER_DEACTIVATED;
    const event: DatasetTreeEvent = new DatasetTreeEvent(
      type,
      "",
      layerId,
      mapIndex
    );
    this.subject.next(event);
  }
}
