import { Options as TileOptions } from "ol/layer/BaseTile";
import { Options } from "ol/layer/BaseImage";
import TileSource, { Options as TileSourceOptions } from "ol/source/TileWMS";
import ImageSource, { Options as ImageSourceOptions } from "ol/source/ImageWMS";
import { AbstractClickableLayerOptions } from "./abstract-layer.model";

/**
 * Interface voor het configureren van een WMS-laagcomponent.
 */
export interface WmsLayerOptions extends AbstractClickableLayerOptions {
  /**
   * Optioneel: Instellen van de layerOptions voor de Openlayers Layer, onder andere
   * zIndex, minResolution en maxResolution kunnen worden ingesteld. Zie (Image Layer)[https://openlayers.org/en/latest/apidoc/module-ol_layer_Image-ImageLayer.html]
   * voor alle opties van reguliere WMS-kaarten.
   * Kijk bij TileLayer wanneer de kaartlaag als tiled-WMS wordt opgehaald (tiled: true).
   */
  layerOptions?: Options<ImageSource> | TileOptions<TileSource>;

  /**
   * Optioneel: Instellen van de sourceOptions voor de OpenLayers Source.
   * Hier kan onder andere de url worden ingesteld. Zie (ImageWms)[https://openlayers.org/en/latest/apidoc/module-ol_source_ImageWMS-ImageWMS.html]
   * Source voor alle opties van reguliere WMS-kaartlagen.
   */
  sourceOptions?: Partial<ImageSourceOptions | TileSourceOptions>;

  /**
   * Optioneel: Voor het aangeven van specifieke kaartlagen waarop geklikt kan worden,
   * default worden alle kaartlagen uit [layers] gebruikt.
   */
  getFeatureInfoQueryLayers?: string[];

  /**
   * Optioneel: Geeft aan of de WMS-laag als tiled moet worden opgehaald.
   */
  tiled?: boolean;

  /**
   * Optioneel: Instellen dat de WMS-capabilities worden opgehaald.
   * Standaard worden de WMS-capabilities opgehaald,
   * tenzij hier de waarde false wordt ingesteld.
   */
  getCapabilities?: boolean;

  /**
   * De naam of namen van de lagen die moeten worden weergegeven.
   * Kan een string of een array van strings zijn.
   */
  layers?: string[] | string;

  /**
   * Gutterwaarde voor de WMS-laag.
   * Wordt gebruikt om extra marge rond tiles te renderen om artefacten te voorkomen.
   */
  gutter?: number;
}
