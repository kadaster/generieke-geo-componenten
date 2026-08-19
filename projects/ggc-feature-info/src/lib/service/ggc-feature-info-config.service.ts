import { Injectable } from "@angular/core";
import { CustomFeatureInfo } from "../model/custom-feature-info.model";
import { FeatureInfoCollection } from "../model/feature-info-collection.model";
import { SortFilterConfig } from "../model/sort-filter-config.model";

/**
 * Service voor het configureren van sorteer-, filter- en custom weergave-instellingen
 * van feature info attributen en tabs.
 */
@Injectable({
  providedIn: "root"
})
export class GgcFeatureInfoConfigService {
  private sortFilterConfigs: SortFilterConfig[];
  private customFeatureInfo: Map<string, CustomFeatureInfo>;

  /**
   * Stelt de sorteer- en filterconfiguraties in per layer.
   *
   * Deze configuraties bepalen o.a.:
   * - de volgorde van attributen;
   * - welke attributen verborgen moeten worden;
   * - optioneel de tab-volgorde via `tabIndex`.
   *
   * @param sortFilterConfigs Lijst met {@link SortFilterConfig} per layer
   */
  setConfig(sortFilterConfigs: SortFilterConfig[]): void {
    this.sortFilterConfigs = sortFilterConfigs;
  }

  /**
   * Stelt de custom feature info configuratie in.
   *
   * Deze configuratie maakt het mogelijk om:
   * - custom attributenamen te definiëren;
   * - attributewaarden dynamisch te transformeren via functies.
   *
   * @param customFeatureInfo Map met keys en bijbehorende {@link CustomFeatureInfo}
   */
  setCustomFeatureInfo(
    customFeatureInfo: Map<string, CustomFeatureInfo>
  ): void {
    this.customFeatureInfo = customFeatureInfo;
  }

  /**
   * Stelt een custom sorteerfunctie in voor tabs (feature info collecties).
   *
   * Wanneer deze functie is ingesteld, wordt deze gebruikt in plaats van de standaard sortering
   * op basis van `tabIndex` uit {@link SortFilterConfig}.
   *
   * @param sortTabFunction Vergelijkingsfunctie zoals gebruikt door `Array.sort`
   */
  setSortTabFunction(
    sortTabFunction: (
      a: FeatureInfoCollection,
      b: FeatureInfoCollection
    ) => number
  ) {
    this.sortTabFunction = sortTabFunction;
  }

  /**
   * Sorteert de tabs (feature info collecties) in-place.
   *
   * Gebruikt de ingestelde sorteerfunctie via {@link setSortTabFunction},
   * of de interne standaardimplementatie indien geen custom functie is ingesteld.
   *
   * @param data Lijst van {@link FeatureInfoCollection} die gesorteerd moet worden
   */
  sortTabs(data: FeatureInfoCollection[]): void {
    data.sort(this.sortTabFunction.bind(this));
  }

  /**
   * Sorteert en filtert attributen van features op basis van de configuratie voor een layer.
   *
   * De volgende stappen worden toegepast:
   * - uitsluiten van attributen (`excludeAttributes`);
   * - sorteren volgens `attributeOrder`;
   * - optioneel verbergen van niet-gesorteerde attributen (`hideUnorderedAttributes`);
   * - vervangen van attributenamen via custom configuratie.
   *
   * Indien geen configuratie beschikbaar is, worden de originele feature properties geretourneerd.
   *
   * @param layerId Id van de layer waarvoor de configuratie geldt
   * @param featureProperties Lijst van feature objecten (key-value paren)
   * @returns Nieuwe lijst met gesorteerde en gefilterde feature properties
   */
  filterAndSortAttributes(
    layerId: string,
    featureProperties: object[]
  ): object[] {
    const config = this.sortFilterConfigs
      ? this.sortFilterConfigs.find((conf) => conf.layerId === layerId)
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

  /**
   * Past custom waarde-transformaties toe op een feature.
   *
   * Voor elke entry in {@link CustomFeatureInfo} wordt:
   * - bepaald of een key matcht (op originele of custom naam);
   * - indien van toepassing een custom functie uitgevoerd op de waarde.
   *
   * Bij fouten in de custom functie wordt de originele waarde behouden.
   *
   * @param currentFeature Het originele feature object
   * @param objectKeys Lijst van keys binnen het feature object die moeten aangepast worden met custom values
   * @returns Nieuw feature object met aangepaste waarden
   */
  checkForCustomValues(
    currentFeature: { [key: string]: any },
    objectKeys: string[]
  ) {
    if (!this.customFeatureInfo) {
      return currentFeature;
    }
    const displayFeature = { ...currentFeature };
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
        return customKey ?? oldKey;
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
      // config wordt alleen gevonden wanneer de layerId gevonden wordt EN wanneer de config een tabIndex heeft
      const configA = this.sortFilterConfigs.find(
        (config) => config.layerId === a.layerId && !!config.tabIndex
      );
      const configB = this.sortFilterConfigs.find(
        (config) => config.layerId === b.layerId && !!config.tabIndex
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
