import { InjectionToken } from "@angular/core";
import { Options } from "ol/control/Zoom";

export const ZOOM_OPTIONS = new InjectionToken<Options | undefined>(
  "ZOOM_OPTIONS"
);
export const ROTATE_OPTIONS = new InjectionToken<Options | undefined>(
  "ROTATE_OPTIONS"
);
export const ATTRIBUTION_OPTIONS = new InjectionToken<Options | undefined>(
  "ATTRIBUTION_OPTIONS"
);
