/**
 * Het object dat wordt gebruikt om de feature-info te sorteren en eventueel waardes niet te tonen.
 */
export interface SortFilterConfigOptions {
  /**
   * @deprecated
   * De naam van de layer waarop de sorteer- en filterconfiguratie van toepassing is.
   * layerId vervangt de layerName
   */
  layerName?: string;

  /**
   * De layerId waarop de sorteer- en filterconfiguratie van toepassing is.
   */
  layerId: string;

  /**
   * Optionele index die bepaalt in welke tab deze configuratie wordt weergegeven.
   */
  tabIndex?: number;

  /**
   * Bepaalt de volgorde waarin attributen worden weergegeven.
   * Attributen die niet in deze lijst voorkomen worden afhankelijk van
   * `hideUnorderedAttributes` wel of niet getoond.
   */
  attributeOrder?: string[];

  /**
   * Wanneer `true`, worden attributen die niet in `attributeOrder` staan verborgen.
   *
   * @defaultValue false (tenzij expliciet gezet via de class default)
   */
  hideUnorderedAttributes?: boolean;

  /**
   * Lijst van attributen die expliciet uitgesloten moeten worden van weergave.
   */
  excludeAttributes?: string[];
}

export class SortFilterConfig {
  layerName?: string;
  layerId: string;
  tabIndex?: number;
  attributeOrder?: string[];
  hideUnorderedAttributes? = true;
  excludeAttributes?: string[];

  constructor(sortFilterConfigOptions: SortFilterConfigOptions) {
    this.layerName = sortFilterConfigOptions.layerName;
    this.layerId = sortFilterConfigOptions.layerId;
    this.tabIndex = sortFilterConfigOptions.tabIndex;
    this.attributeOrder = sortFilterConfigOptions.attributeOrder;
    if (sortFilterConfigOptions.hideUnorderedAttributes !== undefined) {
      this.hideUnorderedAttributes =
        sortFilterConfigOptions.hideUnorderedAttributes;
    }
    this.excludeAttributes = sortFilterConfigOptions.excludeAttributes;
  }
}
