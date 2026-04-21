import { Injectable } from "@angular/core";
import { CustomFeatureInfo } from "../model/custom-feature-info.model";
import { FeatureInfoCollection } from "../model/feature-info-collection.model";
import { SortFilterConfig } from "../model/sort-filter-config.model";

@Injectable({
  providedIn: "root"
})
export class GgcFeatureInfoConfigService {
  private sortFilterConfigs: SortFilterConfig[];
  private customFeatureInfo: Map<string, CustomFeatureInfo>;

  setConfig(sortFilterConfigs: SortFilterConfig[]): void {
    this.sortFilterConfigs = sortFilterConfigs;
  }

  setCustomFeatureInfo(
    customFeatureInfo: Map<string, CustomFeatureInfo>
  ): void {
    this.customFeatureInfo = customFeatureInfo;
  }

  setSortTabFunction(
    sortTabFunction: (
      a: FeatureInfoCollection,
      b: FeatureInfoCollection
    ) => number
  ) {
    this.sortTabFunction = sortTabFunction;
  }

  sortTabs(data: FeatureInfoCollection[]): void {
    data.sort(this.sortTabFunction.bind(this));
  }

  filterAndSortAttributes(
    layerName: string,
    featureProperties: object[]
  ): object[] {
    const config = this.sortFilterConfigs
      ? this.sortFilterConfigs.find((conf) => conf.layerName === layerName)
      : undefined;

    if (!config && !this.customFeatureInfo) {
      return featureProperties;
    }
    const filteredFeatureProperties: object[] = [];

    featureProperties.forEach((feature: { [key: string]: any }) => {
      // get array of keys to sort and filter the keys
      let featureKeys = Object.keys(feature);
      if (config) {
        featureKeys = this.excludeAttributes(config, featureKeys);
        featureKeys = this.sortAttributes(config, featureKeys);
        featureKeys = this.checkUnsortedAttributes(config, featureKeys);
      }
      // loop over keys to create a new object with sorted and filtered properties
      const sortedFeatureProperties: { [key: string]: any } = {};
      featureKeys.forEach((key) => {
        sortedFeatureProperties[this.replaceName(key)] = feature[key];
      });
      filteredFeatureProperties.push(sortedFeatureProperties);
    });
    return filteredFeatureProperties;
  }

  checkForCustomValues(
    currentFeature: { [key: string]: any },
    objectKeys: string[]
  ) {
    if (!this.customFeatureInfo) {
      return currentFeature;
    }
    const displayFeature = Object.assign({}, currentFeature);
    this.customFeatureInfo.forEach(
      (
        featureInfoCustom: CustomFeatureInfo,
        customAttributesValuesKey: string
      ) => {
        if (featureInfoCustom) {
          const customAttributeValueFunction =
            featureInfoCustom.getCustomAttributeValueFunction();
          if (customAttributeValueFunction) {
            // path voor als er een customfunctie is, maar geen customname
            let nameMatchFound = this.findMatchToReplace(
              customAttributesValuesKey,
              objectKeys
            );
            if (!nameMatchFound) {
              // path voor als er een customfunctie is en ook een customname
              nameMatchFound = this.findMatchToReplace(
                featureInfoCustom.getCustomAttributeName(),
                objectKeys
              );
            }
            if (nameMatchFound) {
              this.replaceValue(
                nameMatchFound,
                customAttributeValueFunction,
                currentFeature,
                displayFeature
              );
            }
          }
        }
      }
    );
    return displayFeature;
  }

  private excludeAttributes(config: SortFilterConfig, featureKeys: string[]) {
    if (config.excludeAttributes) {
      // remove the keys from excludedAttributes
      featureKeys = featureKeys.filter((key) => {
        const index = config.excludeAttributes
          ? config.excludeAttributes.indexOf(key)
          : -1;
        return index < 0;
      });
    }
    return featureKeys;
  }

  private sortAttributes(config: SortFilterConfig, featureKeys: string[]) {
    if (config.attributeOrder) {
      // sort the keys in attributeOrder
      featureKeys.sort((a: string, b: string) => {
        const indexA = config.attributeOrder
          ? config.attributeOrder.indexOf(a)
          : -1;
        const indexB = config.attributeOrder
          ? config.attributeOrder.indexOf(b)
          : -1;
        if (indexA === -1) {
          return 1;
        }
        if (indexB === -1) {
          return -1;
        }
        return indexA - indexB;
      });
    }
    return featureKeys;
  }

  private checkUnsortedAttributes(
    config: SortFilterConfig,
    featureKeys: string[]
  ) {
    if (config.attributeOrder && config.hideUnorderedAttributes) {
      // hide unordered keys
      featureKeys = featureKeys.filter((key) => {
        const index = config.attributeOrder
          ? config.attributeOrder.indexOf(key)
          : -1;
        return index >= 0;
      });
    }
    return featureKeys;
  }

  private replaceName(oldKey: string): string {
    if (this.customFeatureInfo) {
      const featureInfocustom = this.customFeatureInfo.get(oldKey);
      if (featureInfocustom) {
        const customKey = featureInfocustom.getCustomAttributeName();
        return customKey !== undefined ? customKey : oldKey;
      }
    }
    return oldKey;
  }

  private replaceValue(
    key: string,
    customFunction: (param: any) => any,
    currentFeature: { [key: string]: any },
    displayFeature: { [key: string]: any }
  ) {
    const currentFeatureValue = currentFeature[key];
    try {
      displayFeature[key] = customFunction(currentFeatureValue);
    } catch (error) {
      // Als er een probleem optreedt tijdens het veranderen van de value wordt de oude value teruggezet
      displayFeature[key] = currentFeature[key];
      console.warn(error);
    }
  }

  private findMatchToReplace(
    fieldToFind: string | undefined,
    objectKeys: string[]
  ): string | undefined {
    return objectKeys.find(
      (keyInObject: string) => keyInObject === fieldToFind
    );
  }

  private sortTabFunction(
    a: FeatureInfoCollection,
    b: FeatureInfoCollection
  ): number {
    if (this.sortFilterConfigs) {
      // config wordt alleen gevonden wanneer de layerName gevonden wordt EN wanneer de config een tabIndex heeft
      const configA = this.sortFilterConfigs.find(
        (config) => config.layerName === a.layerName && !!config.tabIndex
      );
      const configB = this.sortFilterConfigs.find(
        (config) => config.layerName === b.layerName && !!config.tabIndex
      );
      const tabIndexA = configA ? configA.tabIndex : undefined;
      const tabIndexB = configB ? configB.tabIndex : undefined;

      if (tabIndexA && tabIndexB) {
        return tabIndexA - tabIndexB;
      } else if (!tabIndexA && tabIndexB) {
        return 1;
      } else if (tabIndexA && !tabIndexB) {
        return -1;
      }
    }
    return 0;
  }
}
