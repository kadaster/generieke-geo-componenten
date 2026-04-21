export class FeatureInfoKeyValue {
  static objectKeys(
    feature: { [key: string]: any } | undefined,
    hideEmptyFields: boolean,
    hideEmptyFieldWithKeys?: string[]
  ): string[] {
    if (!feature) {
      return [];
    }
    const keys = Object.keys(feature);
    if (hideEmptyFields) {
      const keysNotEmpty: string[] = [];
      keys.forEach((key) => {
        if (feature[key] !== null && feature[key] !== "") {
          keysNotEmpty.push(key);
        }
      });
      return keysNotEmpty;
    } else if (Array.isArray(hideEmptyFieldWithKeys)) {
      return keys.filter(
        (key) =>
          !hideEmptyFieldWithKeys.includes(key) ||
          (feature[key] !== null && feature[key] !== "")
      );
    }
    return keys;
  }
}
