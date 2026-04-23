/**
 * De default mapIndex die wordt gebruikt in 2D kaarten
 */
export const DEFAULT_MAPINDEX = "_DEFAULT_";

/**
 * De default mapIndex die wordt gebruikt in 3D kaarten (Cesium)
 */
export const DEFAULT_CESIUM_MAPINDEX = "_DEFAULT_CESIUM_";

/**
 * Proj4-definitie voor het RD New
 * coördinaten referentiesysteem (EPSG:28992).
 *
 * Wordt gebruikt voor projectie-registratie in OpenLayers.
 */
export const defs =
  "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs";
