import { InjectionToken } from "@angular/core";
import { Options } from "ol/control/Zoom";

/**
 * InjectionToken voor optionele configuratie van de OpenLayers zoomcontrol.
 *
 * Kan worden gebruikt om standaard zoomopties te overschrijven bij
 * het initialiseren van de kaart.
 *
 * @see Options
 */
export const ZOOM_OPTIONS = new InjectionToken<Options | undefined>(
  "ZOOM_OPTIONS"
);

/**
 * InjectionToken voor optionele configuratie van de OpenLayers rotatecontrol.
 *
 * Hiermee kunnen instellingen zoals zichtbaarheid en gedrag van
 * de rotatieknop worden aangepast.
 *
 * @see Options
 */
export const ROTATE_OPTIONS = new InjectionToken<Options | undefined>(
  "ROTATE_OPTIONS"
);

/**
 * InjectionToken voor optionele configuratie van de OpenLayers attributioncontrol.
 *
 * Wordt gebruikt om attributie-instellingen (zoals collapsible of custom labels)
 * te configureren.
 *
 * @see Options
 */
export const ATTRIBUTION_OPTIONS = new InjectionToken<Options | undefined>(
  "ATTRIBUTION_OPTIONS"
);
