import { FeatureInfoKeyValue } from "./feature-info-key-value";

describe("FeatureInfoKeyValue", () => {
  it("if feature is undefined, objectKeys should return an empty array", () => {
    const keys = FeatureInfoKeyValue.objectKeys(undefined, true);

    expect(keys).toEqual([]);
  });

  it("if feature is defined and hideEmptyField is false, objectKeys should return all keys of the feature", () => {
    const feature = createFeature();

    const keys = FeatureInfoKeyValue.objectKeys(feature, false);

    expect(keys).toEqual([
      "status",
      "legestring",
      "omschrijving",
      "waardenull"
    ]);
  });

  it("if feature is defined and hideEmptyField is true, objectKeys should only return keys which have a value", () => {
    const feature = createFeature();

    const keys = FeatureInfoKeyValue.objectKeys(feature, true);

    expect(keys).toEqual(["status", "omschrijving"]);
  });
});

function createFeature(): { [key: string]: any } {
  return {
    status: "nieuw",
    legestring: "",
    omschrijving: "hier ontbreekt iets",
    waardenull: null
  };
}
