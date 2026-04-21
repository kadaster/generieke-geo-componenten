import { FeatureKeysPipe } from "./keys.pipe";

describe("FeatureKeysPipe", () => {
  let pipe: FeatureKeysPipe;
  const bevatGeometry: string[] = [
    "bronhoudernaam",
    "bronhoudercode",
    "geometry",
    "omschrijving"
  ];
  const bevatGeenGeometry: string[] = [
    "bronhoudernaam",
    "bronhoudercode",
    "omschrijving"
  ];

  beforeEach(() => {
    pipe = new FeatureKeysPipe();
  });

  it('when given an array containing the value "geometry", it should filter out this value', () => {
    expect(pipe.transform(bevatGeometry)).toEqual(bevatGeenGeometry);
  });

  it('when given an array not containing "geometry it shouldn\'t filter out anything"', () => {
    expect(pipe.transform(bevatGeenGeometry)).toEqual(bevatGeenGeometry);
  });
});
