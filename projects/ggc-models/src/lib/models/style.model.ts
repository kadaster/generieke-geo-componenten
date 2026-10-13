import { LayerLegend } from "./legend.model";

/**
 * Een stijl waarmee een kaartlaag kan worden weergegeven.
 *
 * Een kaartlaag kan meerdere stijlen aanbieden; één daarvan is de actieve stijl.
 */
export type Style = {
  /** De technische naam van de stijl, zoals de webservice deze kent. */
  name: string;

  /** De weergavenaam van de stijl, bijvoorbeeld voor de dataset-tree. */
  title?: string;

  /** De legenda die bij deze stijl hoort. */
  legend?: LayerLegend;
};
