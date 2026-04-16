/**
 * Mogelijke typen voor een legenda:
 * - Een lijst van iconen met tekst (`IconList[]`)
 * - Een URL naar een legenda-afbeelding (`LegendUrl`)
 * - Een mapbox vector tile stijl (`VectorTileStyle`)
 * - Of `undefined` als er geen legenda is.
 */
export type LegendType = IconList[] | LegendUrl | VectorTileStyle | undefined;

/**
 * Legenda-informatie voor een specifieke laag.
 */
export type LayerLegend = {
  /** De layerId van deze legenda **/
  layerId: string;

  /** De legenda behorend bij deze laag. */
  legend: LegendType;

  /**
   * De naam van de service waar deze lagen in zitten, mocht er een serviceName aanwezig zijn.
   * Met deze naam wordt de legenda gegroepeerd en de serviceName staat dan boven de groepering
   * **/
  serviceTitle?: string;

  /** De titel van deze laag **/
  layerTitle?: string;

  /** True als de layer voor deze legenda is enabled. Als de layer is disabled, wordt de legenda ook niet getoond. **/
  layerEnabled?: boolean;

  /** nummer om de volgorde in de legenda te bepalen */
  legendIndex?: number;
};

/**
 * Een item in een iconenlijst voor de legenda.
 */
export type IconList = {
  /** URL naar het icoon-afbeelding. */
  imageUrl: string;

  /** Beschrijvende tekst bij het icoon. */
  text: string;
};

/**
 * Een URL naar een externe legenda-afbeelding.
 */
export type LegendUrl = {
  /** Volledige URL naar de legenda-afbeelding. */
  legendUrl: string;
};

// todo deze kan er volgensmij uit in de ggc-legend story (een vector style wordt een svg wat een url is)
export class VectorTileStyle {
  name: string;
  url: string;

  constructor(name: string, url: string) {
    this.name = name;
    this.url = url;
  }
}

/**
 * Enum voor de triggers van een legend event.
 * Added en removed worden getriggered bij het aan/uitzetten van een laag in bijvoorbeel de dataset-tree
 * Enabled en disabled worden getriggered als een kaartlaag wel of niet zichtbaar wordt bij het zoomen
 */
export enum LegendEventTrigger {
  ON_LAYER_ADDED = "onLayerAdded",
  ON_LAYER_REMOVED = "onLayerRemoved",
  ON_LAYER_ENABLED = "onLayerEnabled",
  ON_LAYER_DISABLED = "onLayerDisabled"
}

/**
 * Het event dat wordt ge-emit als een legenda moet worden toegevoegd
 */
export class LegendAddedEvent {
  /** De mapIndex waar de legenda moet worden toegevoegd **/
  mapIndex: string;
  /** De legenda die moet worden toegevoegd **/
  legend?: LayerLegend;
}

/**
 * Het event dat wordt ge-emit als een legenda moet worden weggehaald
 */
export class LegendRemovedEvent {
  /** De mapIndex waar de legenda moet worden verwijderd **/
  mapIndex: string;
  /** De layerId waar vand de legenda die moet worden verwijderd **/
  layerId: string;
}
