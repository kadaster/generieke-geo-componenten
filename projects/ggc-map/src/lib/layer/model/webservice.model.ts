import { AbstractConfigurableLayerOptions } from "./abstract-layer.model";
import { Webservice2DType } from "@kadaster/ggc-models";

/**
 * Interface voor het configureren van webservices.
 */
export interface Webservice {
  /** Type service */
  type: Webservice2DType;

  /** Optioneel: titel van de service */
  title?: string;

  /** URL van de service */
  url: string;

  /** Kaartlagen die van de service opgehaald worden */
  layers: AbstractConfigurableLayerOptions[];
}
