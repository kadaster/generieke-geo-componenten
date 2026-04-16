import { viewResolutionIsInLayerResolutionRange } from "./viewResolutionIsInLayerResolutionRange";

describe("viewResolutionIsInLayerResolutionRange", () => {
  it("should return true if minResolution and maxResolution are undefined", () => {
    expect(viewResolutionIsInLayerResolutionRange(0)).toBeTruthy();
  });

  it("should return false if viewResolution < minResolution", () => {
    const result = viewResolutionIsInLayerResolutionRange(5, 10);

    expect(result).toBeFalsy();
  });

  it("should return true if viewResolution > minResolution", () => {
    const result = viewResolutionIsInLayerResolutionRange(15, 10);

    expect(result).toBeTruthy();
  });

  it("should return false if viewResolution > maxResolution", () => {
    const result = viewResolutionIsInLayerResolutionRange(15, undefined, 10);

    expect(result).toBeFalsy();
  });

  it("should return true if viewResolution < maxResolution", () => {
    const result = viewResolutionIsInLayerResolutionRange(5, undefined, 10);

    expect(result).toBeTruthy();
  });

  it("should return true if viewResolution < maxResolution and viewResolution > minResolution", () => {
    const result = viewResolutionIsInLayerResolutionRange(5, 2, 10);

    expect(result).toBeTruthy();
  });
});
