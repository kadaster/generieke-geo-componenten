import { Extent } from "ol/extent";
import { Units } from "ol/proj/Units";

/**
 * Configuratie voor een coördinatenreferentiesysteem (CRS).
 *
 * Dit interface beschrijft alle benodigde eigenschappen om een
 * kaartprojectie en bijbehorende WMTS-/tile-instellingen te configureren.
 */
export interface CrsConfig {
  /**
   * EPSG-code of projectie-identificatie (bijv. "EPSG:28992").
   */
  projectionCode: string;
  /**
   * Geldige extent van de projectie.
   */
  extent: Extent;
  /**
   * Resoluties per zoomniveau.
   */
  resolutions: number[];
  /**
   * Identifier van de matrixset.
   */
  matrixSet: string;
  /**
   * Matrix-identifiers per zoomniveau.
   */
  matrixIds: string[];
  /**
   * Matrixgroottes per zoomniveau.
   */
  matrixSizes: number[];
  /**
   * Eenheid van de projectie (bijv. meters of graden).
   */
  units: Units;
}
