import { FitOptions } from "ol/View";

/**
 * Opties voor het zoomen of fitten(passen) van de kaart.
 *
 * Dit object wordt gebruikt bij zoom- en fit-operaties om
 * aanvullende kaart- en view-instellingen mee te geven.
 */

export interface ZoomOptions {
  /**
   * Optionele index van de kaart waarop de zoomactie moet worden uitgevoerd.
   * Indien niet opgegeven wordt {@link DEFAULT_MAPINDEX} gebruikt.
   */
  mapIndex?: string;
  /**
   * Opties voor het fitten van de view, zoals padding, maxZoom of duration.
   *
   * @see FitOptions
   */
  fitOptions?: FitOptions;
}
