import { Injectable } from "@angular/core";

import { Dataset } from "../model/theme/dataset.model";
import { Theme } from "../model/theme/theme.model";
import {
  DatasetTreeLayer,
  DatasetTreeWebservice
} from "../model/theme/dataset-tree-webservice.model";

/**
 * Factory voor het maken van deep copies van
 * dataset-tree modellen (`Theme` → `Dataset` → `DatasetTreeWebservice` → `DatasetTreeLayer`)
 * uit bestaande instanties of uit plain objects (bijv. JSON van een API).
 *
 * @see Theme
 * @see Dataset
 * @see DatasetTreeWebservice
 * @see DatasetTreeLayer
 */

@Injectable({
  providedIn: "root"
})
export class GgcDatasetTreeModelCreateService {
  /**
   * Bouwt een nieuwe array van {@link Theme} op door van elk item
   * in `themeArray` een deep copy te maken.
   *
   * @param themeArray - Lijst met themes.
   * @returns Een nieuwe lijst met nieuwe, geconstrueerde themes.
   */
  public themeArrayFactory(themeArray: Theme[]): Theme[] {
    const themes: Theme[] = [];
    if (themeArray) {
      for (const theme of themeArray) {
        const newTheme = this.themeFactory(theme);
        themes.push(newTheme);
      }
    }
    return themes;
  }

  /**
   * Bouwt een nieuwe {@link Theme} en alle onderliggende datasets op door een deep copy te maken.
   *
   * @param theme - De theme om te kopiëren.
   * @returns Een nieuwe theme.
   */
  public themeFactory(theme: Theme): Theme {
    const datasets: Dataset[] = [];
    const themes: Theme[] = [];
    if (theme.themes !== undefined) {
      for (const thema of theme.themes) {
        const newTheme = this.themeFactory(thema);
        themes.push(newTheme);
      }
    }
    if (theme.datasets !== undefined) {
      for (const dataset of theme.datasets) {
        const newDataset = this.datasetFactory(dataset);
        datasets.push(newDataset);
      }
    }
    return new Theme(theme.themeName, datasets, themes, theme.open);
  }

  /**
   * Bouwt een nieuwe {@link Dataset} en alle onderliggende services op door een deep copy te maken.
   *
   * @param dataset - De dataset om te kopiëren.
   * @returns Een nieuwe dataset.
   */
  public datasetFactory(dataset: Dataset): Dataset {
    const services: DatasetTreeWebservice[] = [];
    for (const service of dataset.services) {
      const newService = this.serviceFactory(service);
      services.push(newService);
    }
    return new Dataset(
      dataset.datasetName,
      services,
      dataset.infoUrl,
      dataset.open
    );
  }

  /**
   * Bouwt een nieuwe {@link DatasetTreeWebservice} en alle onderliggende lagen op door een deep copy te maken.
   *
   * @param service - De service om te kopiëren.
   * @returns Een nieuwe service.
   */
  public serviceFactory(service: DatasetTreeWebservice): DatasetTreeWebservice {
    const layers: DatasetTreeLayer[] = [];
    for (const layer of service.layers) {
      const newLayer = this.layerFactory(layer as DatasetTreeLayer);
      layers.push(newLayer);
    }
    return new DatasetTreeWebservice(layers);
  }

  /**
   * Bouwt een nieuwe {@link DatasetTreeLayer} op door een deep copy te maken.
   *
   * @param layer - De layer om te kopiëren.
   * @returns Een nieuwe layer.
   */
  public layerFactory(layer: DatasetTreeLayer): DatasetTreeLayer {
    return new DatasetTreeLayer(layer.layerId);
  }
}
