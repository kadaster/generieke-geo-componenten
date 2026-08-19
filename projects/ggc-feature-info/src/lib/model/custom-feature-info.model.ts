/**
 * Hiermee kunnen values binnen de feature-info worden aangepast met behulp van een valueFunction.
 */
export interface CustomFeatureInfoOptions {
  /**
   * De string waarmee de naam (key) wordt overschreven
   */
  customAttributeName?: string;
  /**
   * De valueFunction die de waarde (value) aanpast.
   */
  customAttributeValueFunction?: (valueToBeChanged: string | number) => any;
}

/**
 * Stelt aangepaste veldnamen en waardeveranderingen in voor feature-info data.
 *
 * Deze klasse wordt gebruikt om attribuutveldnamen en -waarden van features
 * aan te passen voordat deze worden weergegeven in de feature-info component.
 *
 * @example
 * ```typescript
 * const customInfo = new CustomFeatureInfo({
 *   customAttributeName: "ID",
 *   customAttributeValueFunction: (value) => value.toString().toUpperCase()
 * });
 * customMap.set("msfid", customInfo);
 * ```
 *
 * ```html
 * <ggc-feature-info
 *   [customAttributeNamesAndValues]="customAttributeNamesAndValues"
 * ></ggc-feature-info>
 * ```
 */
export class CustomFeatureInfo {
  constructor(
    private readonly customFeatureInfoOptions: CustomFeatureInfoOptions
  ) {}

  /**
   * Geeft de aangepaste veldnaam terug, of undefined als deze niet is ingesteld.
   */
  getCustomAttributeName(): string | undefined {
    return this.customFeatureInfoOptions.customAttributeName;
  }

  /**
   * Geeft de transformatiefunctie voor veldwaarden terug, of undefined als deze niet is ingesteld.
   */
  getCustomAttributeValueFunction():
    | ((valueToBeChanged: string | number) => any)
    | undefined {
    return this.customFeatureInfoOptions.customAttributeValueFunction;
  }
}
