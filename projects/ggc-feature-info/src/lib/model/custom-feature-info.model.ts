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
    ((valueToBeChanged: string | number) => any) | undefined {
    return this.customFeatureInfoOptions.customAttributeValueFunction;
  }
}
