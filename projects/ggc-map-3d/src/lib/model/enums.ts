/**
 * Type aanduiding van het soort {@link CameraOptions}.
 *
 * Wordt gebruikt om te bepalen hoe de camera navigatie uitgevoerd moet worden,
 * bijvoorbeeld via `flyTo`, `lookAt` of een GeoJSON object.
 */
export enum CameraOptionsType {
  /**
   * Geen geldige configuratie gedetecteerd.
   */
  None = "None",

  /**
   * Camera wordt direct naar een positie gevlogen.
   *
   * @see {@link CameraPosition}
   */
  CameraPosition = "CameraPosition",

  /**
   * Camera kijkt naar een specifieke positie in de ruimte.
   *
   * @see {@link LookAtPosition}
   */
  LookAtPosition = "LookAtPosition",

  /**
   * Camera wordt gericht op een object gedefinieerd via GeoJSON.
   *
   * @see {@link LookAtObject}
   */
  LookAtObject = "LookAtObject"
}

/**
 * Type tekenactie binnen de viewer.
 *
 * Wordt gebruikt door tekenfunctionaliteit (bijv. in toolbar componenten)
 * om te bepalen welk type geometrie wordt aangemaakt.
 */
export enum DrawingType {
  /**
   * Tekenen van een punt (coördinaat).
   */
  Point = "Point",

  /**
   * Tekenen van een SVG-gebaseerd object.
   */
  Svg = "Svg"
}
