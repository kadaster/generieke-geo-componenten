import { LegendType } from "./legend.model";

/**
 * Een OGC style-object met de metadata en legenda die bij een style horen.
 */
export type Style = {
  /** De unieke naam van de style voor identificatie. */
  name: string;

  /** Optioneel: de leesbare titel van de style. */
  title?: string;

  /** Optioneel: de legenda die bij deze style hoort. */
  legend?: LegendType;
};
