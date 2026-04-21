export interface CustomFeatureInfoOptions {
  customAttributeName?: string;
  customAttributeValueFunction?: (valueToBeChanged: string | number) => any;
}

export class CustomFeatureInfo {
  constructor(private customFeatureInfoOptions: CustomFeatureInfoOptions) {}

  getCustomAttributeName(): string | undefined {
    return this.customFeatureInfoOptions.customAttributeName;
  }

  getCustomAttributeValueFunction():
    | ((valueToBeChanged: string | number) => any)
    | undefined {
    return this.customFeatureInfoOptions.customAttributeValueFunction;
  }
}
