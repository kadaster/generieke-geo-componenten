/**
 * Ondersteunde formaten voor het aanleveren van geometrieën.
 *
 * Wordt gebruikt om te bepalen hoe string-geometrieën
 * geïnterpreteerd en geparsed moeten worden.
 */
export enum FormatType {
  /** Well-Known Text (WKT) formaat */
  WKT,
  /** GeoJSON formaat */
  GEOJSON
}
