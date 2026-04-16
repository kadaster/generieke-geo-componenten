import { Options } from "ol/layer/BaseTile";
import Source, { Options as SourceOptions } from "ol/source/WMTS";
import { AbstractClickableLayerOptions } from "./abstract-layer.model";

/**
 * Interface voor configuratieopties van een WMTS-laag.
 */
export interface WmtsLayerOptions extends AbstractClickableLayerOptions {
  /**
   * Optioneel: Instellen van de layerOptions voor de Openlayers Layer,
   * onder andere zIndex, minResolution en maxResolution kunnen worden ingesteld.
   * Zie Tile Layer voor alle opties. [TileLayer](https://openlayers.org/en/latest/apidoc/module-ol_layer_Tile-TileLayer.html)
   */
  layerOptions?: Options<Source>;

  /**
   * Optioneel: Instellen van de sourceOptions voor de Openlayers Source.
   * Hier kan onder andere de url worden ingesteld.
   * Zie Wmts Source voor alle opties. [WMTS](https://openlayers.org/en/latest/apidoc/module-ol_source_WMTS-WMTS.html)
   */
  sourceOptions?: Partial<SourceOptions>;

  /**
   * Naam van de WMTS-laag zoals gedefinieerd in de capabilities.
   */
  layer?: string;
}
