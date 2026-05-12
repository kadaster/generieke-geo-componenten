/**
 * Geldige extent (bounding box) voor het RD New
 * coördinatenreferentiesysteem (EPSG:28992).
 *
 * Wordt gebruikt om de kaart- en tegelgrenzen te bepalen.
 */
export const extent = [-285401.92, 22598.08, 595401.92, 903401.92];

/**
 * Resoluties per zoomniveau voor EPSG:28992.
 *
 * De index in deze array komt overeen met het zoomniveau.
 */
export const resolutions = [
  3440.64, 1720.32, 860.16, 430.08, 215.04, 107.52, 53.76, 26.88, 13.44, 6.72,
  3.36, 1.68, 0.84, 0.42, 0.21, 0.105, 0.0525, 0.02625, 0.013125, 0.0065625,
  0.00328125, 0.001640625, 0.000820313, 0.000410156, 0.000205078, 0.000102539
];

/**
 * Matrixgroottes per zoomniveau voor tiles in EPSG:28992.
 *
 * Elke waarde vertegenwoordigt het aantal tegels
 * per richting (x en y) op dat zoomniveau.
 */
export const matrixSizes = [
  1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768,
  65536, 131072, 262144, 524288, 1048576, 2097152, 4194304, 8388608, 16777216,
  33554432
];

/**
 * EPSG-code voor het RD New coördinatenreferentiesysteem.
 */
export const epsg28992 = "EPSG:28992";

/**
 * Matrix-identifiers per zoomniveau.
 *
 * De identifiers zijn opgebouwd uit de EPSG-code en het bijbehorende zoomniveau.
 */
export const matrixIds = resolutions.map((_, i) => `${epsg28992}:${i}`);

/**
 * Zet een zoomniveau om naar een resolutie voor EPSG:28992.
 *
 * @param zoomlevel Zoomniveau
 * @returns Resolutie behorend bij het zoomniveau
 */
export function zoomlevelToResolution(zoomlevel: number) {
  return 3440.64 / Math.pow(2, zoomlevel);
}

/**
 * Zet een kaartschaal om naar een resolutie.
 *
 * Gebaseerd op de standaard pixelgrootte van
 * 0.28 mm per pixel (diagonaal).
 *
 * @param scale Kaartschaal
 * @returns Resolutie
 */
export function scaleToResolution(scale: number) {
  return scale * 0.00028;
}
