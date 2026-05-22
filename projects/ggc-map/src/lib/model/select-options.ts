import { Condition } from "ol/events/condition";
import { Layer } from "ol/layer";
import { StyleLike } from "ol/style/Style";

/**
 * Configuratie voor het starten van een Select interaction
 */
export interface SelectOptions {
  /**
   * OL condition waarop de selectie wordt gemaakt (bijv. singleclick, pointerMove, etc.)
   * Als deze waarde wordt leeggelaten, dan wordt de standaard condition gebruikt van de verschillende select modes.
   */
  condition?: Condition;

  /**
   * Een filter voor de selectielagen. Dit is een lijst van layerIds waarop de selecties worden toegepast.
   * Als deze leeg is, dan worden alle layers gebruikt voor selecties waar dit kan.
   */
  layerIds?: string[];

  /**
   * Style voor geselecteerde features.
   * Bij de waarde null zal geen andere style worden toegepast op de selectie.
   */
  style?: StyleLike | null;

  /**
   * Filter functie voor features
   */
  filter?: (feature: any, layer: Layer) => boolean;

  /**
   * De pixel tolerantie voor het selecteren van een feature. Default is 0.
   */
  hitTolerance?: number;

  /**
   * De select mode van de selectie.
   * Single (default) - 1 feature wordt geselecteerd met een single click
   * Multi - meerdere feature worden geselecteerd met een single click
   * OpenlayersDefault - met singleclick is er een single select, met shift-click is er een multi select
   */
  selectMode?: "single" | "multi" | "openlayersDefault";
}
