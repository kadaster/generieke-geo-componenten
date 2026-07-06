import {
  Cesium3DTileset,
  GeoJsonDataSource,
  ImageryLayer
} from "@cesium/engine";

/**
 * Representatie van een laagobject in de viewer.
 */
export interface LayerObject {
  /**
   * De laag die weergegeven wordt. Kan een ImageryLayer, Cesium3DTileset of GeoJsonDataSource zijn.
   */
  layer?: ImageryLayer | Cesium3DTileset | GeoJsonDataSource;

  /**
   * Geeft aan of de laag nog aan het laden is.
   */
  layerLoading?: true;

  /**
   * Bepaalt of de laag getoond moet worden op basis van camerawaarden.
   */
  showFromCameraCallback?: boolean;

  /**
   * Bepaalt of de laag getoond moet worden op basis van datasetinstellingen.
   */
  showFromDataset?: boolean;

  /**
   * Z-index van de laag voor render-volgorde.
   */
  zIndex?: number;
}
