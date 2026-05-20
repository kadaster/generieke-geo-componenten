import { Condition } from "ol/events/condition";
import { Layer } from "ol/layer";
import { StyleLike } from "ol/style/Style";

/**
 * Configuratie voor het starten van een Select interaction
 */
export interface SelectOptions {
  /**
   * OL condition (bijv. click, pointerMove, etc.)
   */
  condition?: Condition;

  /**
   * Filter op lagen
   */
  layers?: Layer[] | ((layer: Layer) => boolean);

  /**
   * Style voor geselecteerde features
   */
  style?: StyleLike;

  /**
   * Filter functie voor features
   */
  filter?: (feature: any, layer: Layer) => boolean;

  /**
   * GGC select mode (extra feature bovenop OL)
   */
  selectMode?: "single" | "multi" | "openlayersDefault";
}
