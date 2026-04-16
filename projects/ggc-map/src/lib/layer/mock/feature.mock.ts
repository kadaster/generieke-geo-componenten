import Feature from "ol/Feature";
import { Geometry } from "ol/geom";

export const featureData = new Feature([
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [154231.72, 452879] },
    properties: {
      basisregistratie: "BGT",
      meldingsNummer: 669,
      bronhoudernaam: "Prorail",
      bronhoudercode: "L0004",
      omschrijving: "Voor BGT",
      toelichting: "Dank voor de melding",
      status: "In onderzoek"
    }
  }
]);

export function getFoundFeatures(numberOfFeatures: number) {
  const foundFeatures: Feature<Geometry>[] = [];

  for (let i = 0; i < numberOfFeatures; i++) {
    foundFeatures.push(featureData);
  }
  return foundFeatures;
}
