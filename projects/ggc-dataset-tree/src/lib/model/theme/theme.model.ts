import { Dataset } from "./dataset.model";

/**
 * Een Theme is het hoogste niveau in de recursieve dataset-tree, waaronder {@link Dataset} hangt
 */
export class Theme {
  /**
   * Maakt een nieuwe `Theme` aan.
   *
   * @param themeName - De naam die wordt getoond in het theme‑structuurcomponent.
   * @param datasets - Eén of meerdere datasets die onder dit theme vallen.
   * @param themes - Een lijst van themes om optionele recursieve themes te maken.
   * @param open - Of de theme bij initialisatie standaard uitgeklapt moet zijn. Default: false
   */
  constructor(
    public themeName: string,
    public datasets: Dataset[] = [],
    public themes: Theme[] = [],
    public open = false
  ) {}

  containsLayerId(layerId: string): boolean {
    return (
      this.datasets.some((dataset) => {
        return dataset.containsLayerId(layerId);
      }) ||
      this.themes.some((theme) => {
        theme.containsLayerId(layerId);
      })
    );
  }
}
