export interface SortFilterConfigOptions {
  layerName: string;
  tabIndex?: number;
  attributeOrder?: string[];
  hideUnorderedAttributes?: boolean;
  excludeAttributes?: string[];
}

export class SortFilterConfig {
  layerName: string;
  tabIndex?: number;
  attributeOrder?: string[];
  hideUnorderedAttributes? = true;
  excludeAttributes?: string[];

  constructor(sortFilterConfigOptions: SortFilterConfigOptions) {
    this.layerName = sortFilterConfigOptions.layerName;
    this.tabIndex = sortFilterConfigOptions.tabIndex;
    this.attributeOrder = sortFilterConfigOptions.attributeOrder;
    if (sortFilterConfigOptions.hideUnorderedAttributes !== undefined) {
      this.hideUnorderedAttributes =
        sortFilterConfigOptions.hideUnorderedAttributes;
    }
    this.excludeAttributes = sortFilterConfigOptions.excludeAttributes;
  }
}
