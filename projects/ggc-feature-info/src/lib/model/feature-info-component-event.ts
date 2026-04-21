export enum FeatureInfoComponentEventType {
  SELECTEDOBJECT = "selectedObject",
  SELECTEDTAB = "selectedTab"
}

export class FeatureInfoComponentEvent {
  /**
   * @param type FeatureInfoComponentEventType
   * @param message de gebruiker heeft een andere feature gekozen,  ...
   * @param value het actuele object of FeatureInfoCollection
   */
  constructor(
    public type: FeatureInfoComponentEventType,
    public message: string,
    public value: any
  ) {}
}
