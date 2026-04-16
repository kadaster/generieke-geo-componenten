export const extent = [-285401.92, 22598.08, 595401.92, 903401.92];
export const resolutions = [
  3440.64, 1720.32, 860.16, 430.08, 215.04, 107.52, 53.76, 26.88, 13.44, 6.72,
  3.36, 1.68, 0.84, 0.42, 0.21, 0.105, 0.0525, 0.02625, 0.013125, 0.0065625,
  0.00328125, 0.001640625, 0.000820313, 0.000410156, 0.000205078, 0.000102539
];
export const defs =
  "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs";

export const matrixSizes = [
  1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768,
  65536, 131072, 262144, 524288, 1048576, 2097152, 4194304, 8388608, 16777216,
  33554432
];

export const epsg28992 = "EPSG:28992";

export const matrixIds = resolutions.map((_, i) => `${epsg28992}:${i}`);

export function zoomlevelToResolution(zoomlevel: number) {
  return 3440.64 / Math.pow(2, zoomlevel);
}

export function scaleToResolution(scale: number) {
  return scale * 0.00028;
}
