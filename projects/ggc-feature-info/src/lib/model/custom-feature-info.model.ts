/**
 * Hiermee kunnen values binnen de feature-info worden aangepast met behulp van een valueFunction.
 */
export interface CustomFeatureInfoOptions {
  /**
   * De naam van de key waarop de valueFunction moet worden toegepast.
   */
  customAttributeName?: string;
  /**
   * De valueFunction die de waarde aanpast.
   */
  customAttributeValueFunction?: (valueToBeChanged: string | number) => any;
}

/**
 * Hiermee kunnen values binnen de feature-info worden aangepast met behulp van een valueFunction.
 */
export class CustomFeatureInfo {
  constructor(
    private readonly customFeatureInfoOptions: CustomFeatureInfoOptions
  ) {}

  getCustomAttributeName(): string | undefined {
    return this.customFeatureInfoOptions.customAttributeName;
  }

  getCustomAttributeValueFunction():
    | ((valueToBeChanged: string | number) => any)
    | undefined {
    return this.customFeatureInfoOptions.customAttributeValueFunction;
  }
}
