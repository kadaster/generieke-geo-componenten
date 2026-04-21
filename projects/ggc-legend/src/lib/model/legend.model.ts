import { LayerLegend } from "@kadaster/ggc-models";

/**
 * Representatie van een dataset laag in de legenda.
 */
export type Legend = {
  /** Naam van de dataset. */
  name: string;

  /** Geeft aan of de legenda standaard uitgeklapt is. */
  expanded?: boolean;

  /** Lijst van legenda-items per dataset. */
  layerLegends?: LayerLegend[];
};
