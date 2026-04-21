import { DatasetTreeWebservice } from "./dataset-tree-webservice.model";

/**
 * Een Dataset is het niveau onder een Theme in de recursieve dataset-tree. Onder een Dataset hangt een {@link DatasetTreeWebservice}
 */
export class Dataset {
  /**
   * Maakt een nieuwe `Dataset` aan.
   *
   * @param datasetName - De naam die wordt getoond in het dataset‑structuurcomponent.
   * @param services - Eén of meerdere services die onder deze dataset vallen.
   * @param infoUrl - Optionele URL die wordt weergegeven als informatie‑icoon achter de datasetnaam.
   * @param open - Of de dataset bij initialisatie standaard uitgeklapt moet zijn. Default: false
   */
  constructor(
    public datasetName: string,
    public services: DatasetTreeWebservice[],
    public infoUrl: string,
    public open = false
  ) {}

  containsLayerId(layerId: string): boolean {
    return this.services.some((service) => {
      return service.layers.some((layer) => {
        return layer.layerId === layerId;
      });
    });
  }
}
