import { Segmenters } from "ol/interaction/Snap";

/**
 * Opties voor snapgedrag tijdens tekenen/bewerken.
 */
export interface SnapOptions {
  /**
   * Aantal pixels waarbinnen snappen actief wordt. Default: 10.
   */
  pixelTolerance?: number;

  /**
   * LayerId's van vectorlagen op de kaart waarnaar gesnapt kan worden.
   * Alleen vectorlagen worden ondersteund (bijv. GeoJSON); rasterlagen zoals WMS/WMTS niet.
   */
  snapLayers?: string[];

  /**
   * LayerId's van tekenlagen waarnaar gesnapt kan worden.
   */
  snapDrawLayers?: string[];

  /**
   * Snappen op hoekpunten (vertices) van geometrieën. Default: true.
   */
  vertex?: boolean;

  /**
   * Snappen op randen (edges) van geometrieën. Default: true.
   */
  edge?: boolean;

  /**
   * Snappen op kruisingen van lijnen. Default: false.
   */
  intersection?: boolean;

  /**
   * Aangepaste segmenters per geometrie-type.
   * Hiermee kun je bijvoorbeeld naar het midden van een lijn snappen.
   * Let op: opgegeven segmenters overschrijven het standaard snapgedrag
   * voor de betreffende geometrie-typen. Default: undefined.
   */
  segmenters?: Segmenters;
}
