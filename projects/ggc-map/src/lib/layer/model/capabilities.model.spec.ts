import { Capabilities } from "./capabilities.model";

describe("Capabilities", () => {
  describe("getFeatureInfoUrl", () => {
    it("when the capabilities contain a GetFeatureInfo href, it should return that href", () => {
      const cap = {
        OperationsMetadata: {
          GetFeatureInfo: { DCP: { HTTP: { Get: [{ href: "abcd" }] } } }
        }
      };

      const capabilities = new Capabilities(cap);

      expect(capabilities.getFeatureInfoUrl()).toBe("abcd");
    });

    it("when the capabilities do not contain a GetFeatureInfo href, it should return a falsy value", () => {
      const capabilities = new Capabilities({});

      expect(capabilities.getFeatureInfoUrl()).toBeFalsy();
    });
  });

  describe("hasFeatureInfoUrl", () => {
    it("when a featureInfoUrl is present, it should return true", () => {
      const cap = {
        OperationsMetadata: {
          GetFeatureInfo: { DCP: { HTTP: { Get: [{ href: "abcd" }] } } }
        }
      };
      const capabilities = new Capabilities(cap);

      expect(capabilities.hasFeatureInfoUrl()).toBe(true);
    });

    it("when a featureInfoUrl is not present, it should return false", () => {
      const capabilities = new Capabilities({});

      expect(capabilities.hasFeatureInfoUrl()).toBe(false);
    });
  });
});
